namespace clientCore.mentor {
    export class HistoryMgr {
        /**已解除的玩家列表 */
        cutOffMap: util.HashMap<pb.ITeacher>;
        /**申请列表 */
        applyMap: util.HashMap<pb.ITeacher>;
        /**毕业的列表 */
        graducateMap: util.HashMap<pb.ITeacher>;

        constructor() {
            this.cutOffMap = new util.HashMap();
            this.applyMap = new util.HashMap();
            this.graducateMap = new util.HashMap();
        }

        /**添加解除/毕业关系的数据 */
        addToCutOff(dat: pb.ITeacher) {
            this.cutOffMap.add(dat.otherId, dat);
        }

        /**添加到请求列表里 */
        addToApplyReq(dat: pb.ITeacher) {
            let before = this.getApplyList().length;
            this.applyMap.add(dat.otherId, dat);
            if (before != this.getApplyList().length) {
                EventManager.event(globalEvent.MENTOR_APPLY_LIST_CHANGE);
            }
        }

        /**从邀请列表里删除（主要用于双方都发了申请，但是一边同意了，另一边就可以去掉申请了） */
        removeFromApplyList(dat: pb.ITeacher) {
            let before = this.getApplyList().length;
            this.applyMap.remove(dat.otherId);
            if (before != this.getApplyList().length) {
                EventManager.event(globalEvent.MENTOR_APPLY_LIST_CHANGE);
            }
        }

        addToGraducate(dat: pb.ITeacher) {
            this.graducateMap.add(dat.otherId, dat);
        }

        /**获取已毕业的学生列表 */
        getGraduationList() {
            return this.graducateMap.getValues();
        }

        /** 获取申请列表 */
        getApplyList() {
            let arr = this.applyMap.getValues();
            //如果我的只能当学生，返回导师发来的申请
            if (MentorConst.checkCanStudentByLv())
                return _.filter(arr, o => o.relation == 1);
            //如果我只能当导师,返回学生发来的申请
            if (MentorConst.checkCanTeacherByLv())
                return _.filter(arr, o => o.relation == 0);
            return [];
        }

        /**答复请求
         * @param id 玩家id
         * @param agree 是否同意
         */
        replyApply(id: number, agree: boolean) {
            if (!this.applyMap.has(id)) {
                console.warn('没有这个申请uid' + id);
                return Promise.resolve();
            }
            let type = 0;
            if (MentorConst.checkCanStudentByLv())
                type = 2;
            if (MentorConst.checkCanTeacherByLv())
                type = 1;
            if (type != 0)
                return net.sendAndWait(new pb.cs_reply_teachers_relation({ otherId: id, type: type, replyFlag: agree ? 0 : 1 })).then(() => {
                    //通过后就删掉这个状态，如果是同意请求，会有师徒关系变动通知，从那个通知里面更新数据
                    this.applyMap.remove(id);
                    EventManager.event(globalEvent.MENTOR_APPLY_LIST_CHANGE);
                    return Promise.resolve();
                }).catch((e) => {
                    this.applyMap.remove(id);
                    EventManager.event(globalEvent.MENTOR_APPLY_LIST_CHANGE);
                    return Promise.resolve();
                })
            else
                return Promise.resolve();
        }
    }
}