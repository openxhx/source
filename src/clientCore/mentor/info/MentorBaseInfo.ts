namespace clientCore.mentor {
    import STATE = clientCore.MENTOR_HELP_STATE;
    export class MentorBaseInfo {
        readonly uid: number;
        readonly _srvData: pb.ITeacher;
        constructor(data: pb.ITeacher) {
            this._srvData = data;
            this.uid = data.otherId;
            this.init();
        }

        /**初始化相关数据 */
        protected init() {

        }

        /**获取每日求助状态 */
        get helpState() {
            let helpInfo = this._srvData.helpInfo;
            //helpTime这个时间戳不会随自然日清空
            //status 0:学生未申请 1:导师未提交物资 2:导师已提交等待学生领取(可以跨天) 3:学生已领取
            //提出互助的时间戳为0，则从来没提出过互助
            if (helpInfo.helpTime == 0) {
                return STATE.NO_HELP;
            }
            else {
                let isToday = util.TimeUtil.isSameDay(clientCore.ServerManager.curServerTime, helpInfo.helpTime);
                if (isToday) {
                    //时间戳是今天的
                    switch (helpInfo.status) {
                        case 1:
                            return STATE.WAITTING;
                        case 2:
                            return STATE.HELP_OVER;
                        case 3:
                            return STATE.REWARD;
                        default:
                            console.warn('数据错误！');
                            break;
                    }
                }
                else {
                    //申请时间戳不是今天，判断导师有没有给奖励，如果有则等待领取
                    if (helpInfo.status == 2)
                        return STATE.HELP_OVER;
                    else
                        return STATE.NO_HELP;
                }
            }
        }

        /**获取每日求助的物资列表 */
        get helpItems() {
            return this._srvData.helpInfo.itms;
        }
    }
}