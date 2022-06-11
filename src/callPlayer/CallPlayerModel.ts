namespace callPlayer {
    export class CallPlayerModel implements clientCore.BaseModel {
        /**是否回流 */
        public isBacker: boolean;
        /**活跃奖励套装 */
        public activeSuit: number = 2100213;
        /**召回奖励套装 */
        public callSuit: number = 2100223;
        /**三日奖励可领取当天 */
        public _curDay: number;
        /**三日奖励最大签到次数 */
        public _maxDay: number;
        /**已邀请玩家id */
        public invitedId: number[];
        /**是否填写过邀请人 */
        public haveInvite: boolean;
        /**召唤奖励id */
        public callReward: number;
        /**活跃奖励id */
        public activeReward: number;
        /**当前活跃值 */
        public curActive: number;
        /**召回礼包领取状态 */
        public isCallReward: boolean;
        /**活跃礼包领取状态 */
        public isActReward: boolean;
        dispose() {
            this.invitedId = null;
        }
    }
}