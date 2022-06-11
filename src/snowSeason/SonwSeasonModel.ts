namespace snowSeason {
    export class SnowSeasonModel {
        private static _model: SnowSeasonModel;
        private constructor() { };
        public static get instance(): SnowSeasonModel {
            if (!this._model) {
                this._model = new SnowSeasonModel();
            }
            return this._model;
        }
        /**活动id */
        public activityId: number = 213;
        /**切换页签限制 */
        public canChangePanel: boolean = true;
        //活动代币
        public coinid: number = 9900277;
        /**已消耗代币数量 */
        public costCnt: number = 0;
        /**累计消耗代币数量 */
        public costAllCnt: number = 0;
        /**转轮当前价格 */
        public currPrice: number;
        /**转轮次数 */
        public refreshTimes: number;
        private buyPanel:SnowSeasonBuyPanel;
        public startTime:number = 0;
        /**代币不足 */
        public async coinNotEnough() {
            if (!this.buyPanel){
               await res.load(`atlas/snowSeason/SnowSeasonGiftPanel.atlas`, Laya.Loader.ATLAS);
                this.buyPanel = new SnowSeasonBuyPanel();
            }
            this.buyPanel.setData();
            clientCore.DialogMgr.ins.open(this.buyPanel);
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