namespace clientCore.mentor {
    export class TeacherMgr {

        /**导师信息(!!!有可能是undefined)*/
        teacherInfo: TeacherInfo;

        setTeacherInfo(data: pb.ITeacher) {
            // 服务端会把导师信息永久记录下来，所以要判断是不是已解除，如果没解除需要判断是否已领取毕业礼
            if (data.state == 1) {
                let beforeGrow = this.teacherInfo?.growPoint;
                this.teacherInfo = new TeacherInfo(data);
                if (beforeGrow != this.teacherInfo.growPoint) {
                    EventManager.event(globalEvent.MENTOR_MY_GROW_CHANGE);
                }
            }
            else {
                this.teacherInfo = undefined;
            }
        }

        /**向导师提交道具帮助 */
        askHelpToTeacher(ids: number[]) {
            if (!this.teacherInfo)
                return Promise.resolve();
            return net.sendAndWait(new pb.cs_help_teachers_relation({ type: 1, otherId: this.teacherInfo.uid, ids: ids })).then((data: pb.sc_help_teachers_relation) => {
                this.teacherInfo._srvData.helpInfo = data.helpInfo;
            })
        }

        /**领取导师提交的物资 */
        getSupplyFromTeacher() {
            if (!this.teacherInfo)
                return Promise.resolve();
            return net.sendAndWait(new pb.cs_help_teachers_relation({ type: 3, otherId: this.teacherInfo.uid, ids: [] })).then((data: pb.sc_help_teachers_relation) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                this.teacherInfo._srvData.helpInfo = data.helpInfo;
                EventManager.event(globalEvent.MENTOR_UPDATE_MAINUI_RED);
            })
        }

        /**不要师傅了 */
        cutOffOneStudent() {
            if (!this.teacherInfo)
                return Promise.resolve();
            return net.sendAndWait(new pb.cs_close_teachers_relation({ type: 2, otherId: this.teacherInfo.uid })).then((data: pb.sc_close_teachers_relation) => {
            });
        }
    }
}