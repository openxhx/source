namespace schoolTime {
    export class SchoolTimeModel implements clientCore.BaseModel {
        /**套装id */
        public readonly suitId: number = 2110405;
        /**货币id */
        public readonly baseCoinId: number = 9900186;
        /**活动id */
        public readonly eventId: number = 161;
        /**帮助说明id */
        public readonly ruleId: number = 1182;
        /**园艺任务 */
        public flowerTask: number;
        /**手工任务 */
        public handTask: number;
        /**今日是否签到 */
        public isSign: number;
        /**已签到天数 */
        public singDays: number;
        /**今日答题数 */
        public quizCnt: number;
        /**打开时的日期 */
        public openDay: number;
        /**当前总学分 */
        public allCoin: number;

        public setEventInfo(msg: pb.sc_get_finish_school_times_info) {
            this.flowerTask = msg.flowerTaskId;
            this.handTask = msg.handTaskId;
            this.isSign = msg.signFlag;
            this.singDays = msg.signday;
            this.quizCnt = msg.answerFlag;
            this.openDay = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
        }

        public checkDayChange(): boolean {
            let cur = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (cur != this.openDay) alert.showFWords("日期已变更，请重新打开活动界面");
            return cur == this.openDay;
        }

        dispose() {

        }
    }
}