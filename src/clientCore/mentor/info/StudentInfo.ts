namespace clientCore.mentor {
    export class StudentInfo extends MentorBaseInfo {
        /** 获取服务器的任务状态没有就是undefined*/
        getTaskInfoById(id: number) {
            return _.find(this._srvData.tasks, o => o.taskid == id);
        }

        /**是否还有桃李之心可以领取 */
        get haveReward() {
            if (this.allRewardClaimed)
                return false;
            let growInfo = clientCore.MentorConst.parseLvByGrow(this._srvData.grow);
            let maxRwdIdx = growInfo.lv;//当前是什么等级(最多可以领到几级奖励)
            //这里只要判断当前等级的奖励是否已领取，前面一级领了才能领后面的
            return maxRwdIdx == 0 ? false : util.getBit(this._srvData.flag, maxRwdIdx) == 0;
        }

        /**是不是所有的桃李之心都被领取了 */
        get allRewardClaimed() {
            return util.get1num(this._srvData.flag) == 4;
        }
    }
}