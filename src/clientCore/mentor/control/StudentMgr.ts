
namespace clientCore.mentor {
    /**徒弟信息管理 */
    export class StudentMgr {
        private studentMap: util.HashMap<StudentInfo>;

        constructor() {
            this.studentMap = new util.HashMap();
        }

        /**
         * 当前学生列表
         */
        get studentList() {
            let arr = this.studentMap.getValues();
            // 这里有个特殊逻辑，学生已毕业切桃李之心全部被领取，这个就不算学生了
            return _.filter(arr, (o) => { return !(o.allRewardClaimed && o._srvData.state == 2) });
        }

        /**添加/更新一个学生信息 */
        addStudent(data: pb.ITeacher) {
            let before = this.studentList.length;
            let info = new StudentInfo(data);
            this.studentMap.add(data.otherId, info);
            if (before != this.studentList.length) {
                EventManager.event(globalEvent.MENTOR_STUEND_LIST_CHANGE);
            }
        }

        /**删除一个学生信息 */
        removeOneStudent(uid: number) {
            let before = this.studentMap.length;
            this.studentMap.remove(uid);
            if (before != this.studentMap.length) {
                EventManager.event(globalEvent.MENTOR_STUEND_LIST_CHANGE);
            }
        }

        /**通过uid获取一个学生信息 */
        getStudentById(uid: number) {
            return this.studentMap.get(uid);
        }

        /**给学生帮助道具 */
        giveItemToStudent(studentId: number, itemIds: number[]) {
            if (!this.getStudentById(studentId)) {
                alert.showFWords('学生信息错误!');
                return Promise.resolve();
            }
            if (itemIds.length == 0) {
                alert.showFWords('帮助道具错误');
                return Promise.resolve();
            }
            return net.sendAndWait(new pb.cs_help_teachers_relation({ type: 2, otherId: studentId, ids: itemIds })).then((data: pb.sc_help_teachers_relation) => {
                this.getStudentById(studentId)._srvData.helpInfo = data.helpInfo;
                EventManager.event(globalEvent.MENTOR_HELP_CHANGE);
            });
        }

        /**更新一个学生的任务信息（变量通知） */
        updateStudentTaskInfo(data: pb.sc_student_tasks_state_notify) {
            let student = this.getStudentById(data.studentId);
            if (!student) {
                console.warn(`任务信息出错,找不到学生${data.studentId}`)
                return;
            }
            student._srvData.tasks = _.merge(student._srvData.tasks, data.tasks);
        }

        /**更新一个学生的求助信息 */
        updateStudentHelpInfo(data: pb.sc_teacher_daily_help_notify) {
            let student = this.getStudentById(data.otherId);
            if (!student) {
                console.warn(`求助信息出错,找不到学生${data.otherId}`)
                return;
            }
            student._srvData.helpInfo = data.helpInfo;
        }

        /**把某个徒弟逐出师门 */
        cutOffOneStudent(id: number) {
            let student = this.getStudentById(id);
            if (!student) {
                console.warn(`逐出师门信息出错,找不到学生${id}`);
                return;
            }
            return net.sendAndWait(new pb.cs_close_teachers_relation({ type: 1, otherId: id })).then((data: pb.sc_close_teachers_relation) => {
            });
        }

        /**领取学生的桃李之心 */
        getStudentHeartReward(id: number) {
            let student = this.getStudentById(id);
            if (!student) {
                console.warn(`领取桃李之心信息出错,找不到学生${id}`);
                return;
            }
            return net.sendAndWait(new pb.cs_get_teacher_education_gifts({ studentId: id })).then((data: pb.sc_get_teacher_education_gifts) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                student._srvData.flag = data.flag;
                EventManager.event(globalEvent.MENTOR_UPDATE_MAINUI_RED);
            });
        }
    }
}