namespace midAutumnGift{
    export class MidAutumnGiftModel{
        /**活动id */
        public eventId:number = 190;
        /**跳一跳游戏次数 */
        public gameTimes:number;
        /**已答对题目数量 */
        public rightCnt:number;
        /**是否获得总奖励 */
        public isGetReward:number;
        /**
         * 检查活动是否开启
         * 开启返回true
         */
        public checkEventOpen(){
            return !clientCore.SystemOpenManager.ins.checkActOver(this.eventId);
        }
        private static _model: MidAutumnGiftModel;
        private constructor() { };
        public static get instance(): MidAutumnGiftModel {
            if (!this._model) {
                this._model = new MidAutumnGiftModel();
            }
            return this._model;
        }
    }
}