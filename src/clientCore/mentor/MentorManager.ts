namespace clientCore {
    /**
     * 导师系统管理
     */
    export class MentorManager {
        /**当前身份 */
        private static _identity: MENTOR_IDENTITY;
        /**徒弟信息管理(玩家的所有徒弟) */
        static student: mentor.StudentMgr;
        /**导师信息管理(玩家的导师) */
        static teacher: mentor.TeacherMgr;
        /**历史记录 */
        static history: mentor.HistoryMgr;
        /** 桃李缘 信息管理（缓存拉取信息） */
        static applyInfo: mentor.ApplyMgr;

        /**初始化完成 */
        static inited: boolean;

        static async setup() {
            MentorManager.student = new mentor.StudentMgr();
            MentorManager.teacher = new mentor.TeacherMgr();
            MentorManager.history = new mentor.HistoryMgr();
            MentorManager.applyInfo = new mentor.ApplyMgr();
            await Promise.all([
                xls.load(xls.tutorCommonData),
                xls.load(xls.tutorLevel),
                xls.load(xls.tutorRecruit)
            ]);
            let xlsInfo = xls.get(xls.tutorCommonData).get(1);
            MentorConst.maxStudentLv = xlsInfo.traineeMaxLevel;
            MentorConst.minTeacherLv = xlsInfo.tutorLevel;
            await MentorManager.reqAllRelationInfo();
            await MentorManager.reqGraduateRewardInfo();
            MentorManager.addEventListeners();
            MentorManager.inited = true;
            EventManager.event(globalEvent.MENTOR_UPDATE_MAINUI_RED);
            return Promise.resolve();
        }

        static addEventListeners() {
            //开始监听
            net.listen(pb.sc_student_tasks_state_notify, this, MentorManager.onTaskStateChange);
            net.listen(pb.sc_teacher_daily_help_notify, this, MentorManager.onHelpStateChange);
            net.listen(pb.sc_notify_propaganda_notice, this, MentorManager.showPromoteNotice);
            net.listen(pb.sc_notify_teachers_relation_change, this, MentorManager.onRelationChange);
        }

        static showPromoteNotice(data: pb.sc_notify_propaganda_notice): void {
            let noticeInfo = new clientCore.mentor.MentorNoticeInfo();
            noticeInfo.uid = data.userid;
            noticeInfo.type = data.type;
            noticeInfo.mIndex = data.mIndex;
            noticeInfo.nick = data.nick;

            let key = MentorManager.applyInfo.MESSAGE_VARIFY_ID++;
            MentorManager.applyInfo.applyMessageHashMap.add(key, noticeInfo);
            //聊天里面显示
            let str = noticeInfo.type == 1 ? ` “【${xls.get(xls.tutorRecruit).get(noticeInfo.mIndex).recruitDesc}】。”【${noticeInfo.nick}】正在寻找合适的徒弟哟！` : `“【${xls.get(xls.tutorRecruit).get(noticeInfo.mIndex).recruitDesc}】。”【${noticeInfo.nick}】正在寻找合适的导师哟！`
            let info = { time: clientCore.ServerManager.curServerTime, msg: str };
            let noticeMsg = MentorManager.createOneMsg(info, 1, noticeInfo.type);
            noticeMsg.special = key;
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, noticeMsg);
        }
        /**
         * 收徒公告：  “【玩家的公告文字】。”【玩家昵称】正在寻找合适的徒弟哟！
         * 拜师公告： “【玩家的公告文字】。”【玩家昵称】正在寻找合适的导师哟！
         * @param info 
         * @param chatType 
         * @param type 
         */
        private static createOneMsg(info: any, chatType: number, type: number) {
            let msg = new pb.chat_msg_t();
            msg.chatType = chatType;
            msg.sendUid = 0;
            msg.recvUid = clientCore.LocalInfo.uid;
            msg.content = info.msg;
            msg.sendTime = info.time;
            msg.special = 0;
            msg.sendNick = type == 1 ? "收徒公告" : "拜师公告";
            return msg;
        }

        /**当前身份 */
        static get identity() {
            return MentorManager._identity;
        }

        static async reqAllRelationInfo() {
            await net.sendAndWait(new pb.cs_get_teachers_relation_info()).then((data: pb.sc_get_teachers_relation_info) => {
                data.teachers = _.filter(data.teachers, (element) => { return element.state != 3; }); //过滤被解除关系的
                for (const o of data.teachers) {
                    MentorManager.saveOneTeacherInfo(o);
                }
                //开始分类数据
                MentorManager.updateIdentity();
            });
        }

        /** 通知学生任务的完成进度*/
        private static onTaskStateChange(data: pb.sc_student_tasks_state_notify) {
            MentorManager.student.updateStudentTaskInfo(data);
            EventManager.event(globalEvent.MENTOR_TASK_CHANGE);
        }

        /**每日求助的通知 */
        private static onHelpStateChange(data: pb.sc_teacher_daily_help_notify) {
            //我是老师，且学生发起求助
            if (MentorManager._identity == MENTOR_IDENTITY.TEACHER && data.type == 1) {
                MentorManager.student.updateStudentHelpInfo(data);
            }
            //我是学生，老师提交了物资(直接更新srvData就好)
            else if (MentorManager._identity == MENTOR_IDENTITY.STUDENT && data.type == 2) {
                MentorManager.teacher.teacherInfo._srvData.helpInfo = data.helpInfo;
            }
            else {
                console.warn(`数据错误 identity:${MentorManager._identity}  type:${data.type}`)
            }
            EventManager.event(globalEvent.MENTOR_HELP_CHANGE);
        }

        private static onRelationChange(data: pb.sc_notify_teachers_relation_change) {
            if (data?.info) {
                MentorManager.saveOneTeacherInfo(data.info);
                MentorManager.updateIdentity();
                this.checkStudentReward(data.info);
            }
        }

        /** 检查是否有奖励可领取*/
        private static checkStudentReward(data: pb.ITeacher): void {
            if (data.state == 1 && data.relation == 0) { //确认的关系是学生
                let student: mentor.StudentInfo = MentorManager.student.getStudentById(data.otherId);
                student && student.haveReward && EventManager.event(globalEvent.MENTOR_HAVE_GIFT);//更新的学生信息中 有可领取的奖励
            }
        }

        private static saveOneTeacherInfo(data: pb.ITeacher) {
            //确认的关系
            if (data.state == 1) {
                if (data.relation == 0)
                    MentorManager.student.addStudent(data);
                else if (data.relation == 1)
                    MentorManager.teacher.setTeacherInfo(data);
                //这里有个特殊处理如果双方都发过申请，有一方同意时，另一边的申请列表里就可以去掉了
                MentorManager.history.removeFromApplyList(data);
            }
            //申请
            else if (data.state == 0) {
                MentorManager.history.addToApplyReq(data);
            }
            //已经毕业的关系
            else if (data.state == 2) {
                //relation是学生且毕业，就加到毕业列表
                if (data.relation == 0) {
                    MentorManager.history.addToGraducate(data);
                    //毕业了 也在学生列表里面更新下
                    MentorManager.student.addStudent(data);
                }
                //relation是老师且毕业，说明我毕业了
                if (data.relation == 1) {
                    MentorManager.teacher.setTeacherInfo(data);
                }
            }
            //已经解除了的关系
            else if (data.state == 3) {
                MentorManager.history.addToCutOff(data);
                //需要解除关系
                //我有学生，那就删除学生信息
                MentorManager.student.removeOneStudent(data.otherId);
                //我有老师，就置空老师信息
                MentorManager.teacher.setTeacherInfo(data);
            }
            //拒绝了的申请
            else if (data.state == 4) {

            }
        }

        /**更新玩家自身身份 */
        private static updateIdentity() {
            let preIdentity = MentorManager._identity;
            //有导师了，且还没有毕业
            let teacherInfo = MentorManager.teacher.teacherInfo;
            if (teacherInfo && teacherInfo._srvData.state != 2) {
                MentorManager._identity = MENTOR_IDENTITY.STUDENT;
            }
            else if (MentorManager.student.studentList.length > 0) {
                //有徒弟了，说明自己是导师
                MentorManager._identity = MENTOR_IDENTITY.TEACHER;
            }
            else {
                MentorManager._identity = MENTOR_IDENTITY.NONE;
            }
            if (preIdentity != MentorManager._identity)
                EventManager.event(globalEvent.MENTOR_IDENTITY_CHANGE);
        }

        /**打开导师系统（自动判断应该打开哪个） */
        static openMentorSystem() {
            if (this.checkCanGetAllGraduateReward()) {
                clientCore.ModuleManager.open("mentorGraduate.GraduateRewardModule", "all");
                return;
            }

            //判断如下:
            //1.如果当前是导师或者学生，则打开对应的面板
            //2.如果是普通人，需要根据等级,是否毕业过判断他能否当导师/学生
            if (MentorManager._identity == MENTOR_IDENTITY.TEACHER) {
                clientCore.ModuleManager.open('mentor.MentorTeacherModule')
            }
            else if (MentorManager._identity == MENTOR_IDENTITY.STUDENT) {
                clientCore.ModuleManager.open('mentor.MentorStuentModule');
            }
            else {
                if (MentorConst.checkCanStudentByLv())
                    clientCore.ModuleManager.open('mentor.MentorStuentModule');
                else
                    clientCore.ModuleManager.open('mentor.MentorTeacherModule')
            }
        }

        static checkCanGetAllGraduateReward(): boolean {
            let openDate = util.TimeUtil.formatTimeStrToSec("2020/5/01 00:00:00");
            let graInfo = this.applyInfo.graduateRewardInfo;
            return graInfo.regTime < openDate && graInfo.uLevel > MentorConst.maxStudentLv && graInfo.eduGifts <= 0;
        }
        /** 导师的收徒信息 */
        static async getTeacherApply(forceRefresh: boolean = false) {
            let outDateFlag = false;
            if (MentorManager.applyInfo.teacherApplyArr.length < 6) {
                outDateFlag = true;
            }
            else {
                for (let i = MentorManager.applyInfo.teacherApplyArr.length - 1; i >= 0; i--) {
                    if (clientCore.ServerManager.curServerTime - MentorManager.applyInfo.teacherApplyArr[i].timestamp > 72 * 3600) {
                        outDateFlag = true;
                        break;
                    }
                }
            }
            forceRefresh && (outDateFlag = true);
            if (outDateFlag) {
                await net.sendAndWait(new pb.cs_get_teachers_notice({ num: 6 })).then((data: pb.sc_get_teachers_notice) => {
                    MentorManager.applyInfo.teacherApplyArr = data.notice;
                    return Promise.resolve();
                })
            }
            else {
                return Promise.resolve();
            }
        }
        /** 学生的拜师信息 */
        static async getStudentApply(forceRefresh: boolean = false) {
            let outDateFlag = false;
            if (MentorManager.applyInfo.studentApplyArr.length < 6) {
                outDateFlag = true;
            }
            else {
                for (let i = MentorManager.applyInfo.studentApplyArr.length - 1; i >= 0; i--) {
                    if (clientCore.ServerManager.curServerTime - MentorManager.applyInfo.studentApplyArr[i].timestamp > 72 * 3600) {
                        outDateFlag = true;
                        break;
                    }
                }
            }
            forceRefresh && (outDateFlag = true);
            if (outDateFlag) {
                await net.sendAndWait(new pb.cs_get_student_notice({ num: 6 })).then((data: pb.sc_get_teachers_notice) => {
                    MentorManager.applyInfo.studentApplyArr = data.notice;
                    return Promise.resolve();
                })
            }
            else {
                return Promise.resolve();
            }
        }

        static async reqGraduateRewardInfo() {
            await net.sendAndWait(new pb.cs_get_education_gifts_info({})).then((data: pb.sc_get_education_gifts_info) => {
                this.applyInfo.graduateRewardInfo = data;
            });
        }
    }
}