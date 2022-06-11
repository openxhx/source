namespace bigCharge {
    export class BigChargeModel {
        private static _model: BigChargeModel;
        private constructor() { };
        public static get instance(): BigChargeModel {
            if (!this._model) {
                this._model = new BigChargeModel();
            }
            return this._model;
        }
        /**活动id */
        public activityId: number = 164;
        /**切换页签限制 */
        public canChangePanel: boolean = true;
        /**活动代币 */
        public coinid: number = 9900193;
        /**已消耗代币数量 */
        public costCnt: number = 0;
        /**累计消耗代币数量 */
        public costAllCnt: number = 0;
        /**购物车内容 */
        public buyCarInfo: number[] = [];
        /**已签到天数 */
        public signDay: number;
        /**今天是否签到 */
        public isSign: number;
        /**是否领取7日奖励 */
        public isSignReward: number;
        /**转轮当前价格 */
        public currPrice: number;
        /**转轮次数 */
        public refreshTimes: number;
        /**代币不足 */
        public coinNotEnough() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('moneyShop.MoneyShopModule', 3);
        }

        /**代币消耗
         * @param canDraw 是否算在抽奖里，默认算
         */
        public coinCost(cnt: number, canDraw: boolean = true) {
            if (canDraw) this.costCnt += cnt;
            this.costAllCnt += cnt;
        }

        dispose(): void {

        }
    }
}