namespace ginkgoOath {
    export class GinkgoOathModel implements clientCore.BaseModel {
        /**累计活跃值 */
        public activeValue: number;
        /**活跃值奖励状态 */
        public activeRewardStatus: number;
        /**活跃值VIP奖励领取状态 */
        public activeVIPRewardStatus: number;
        /**许愿之池抽奖次数 */
        public drawCount: number;
        /**许愿之池抽奖次数奖励状态 */
        public drawCountRewardStatus: number;
        /**芳华勋章激活状态 */
        public medalBuyStatus: number;
        /**累计消费领奖状态 */
        public costRewardStatus: number;
        /**广告页购买状态 */
        public adBuyStatus: number;
        public adBuyDaily: number;
        /**特惠礼包购买状态 */
        public show33: number;
        /**广告页人民币礼包id */
        public adRmbBuyStatus: number[] = [];
        public readonly adRechargeId: number[] = [39, 40, 41];
        /**特惠礼包打开标记 */
        public giftOpen: number;
        /**礼包购买勋章id */
        private readonly _medalIds: number[] = [
            MedalConst.GINKGOOATH_BUY_33,
            MedalDailyConst.GINKGOOATH_DAILY_ALL_GIFT,
            MedalDailyConst.GINKGOOATH_DAILY_GIFT
        ];
        /**
         * 1511012  淘乐球  1511013  杏叶币
         */

        /**获取礼包购买情况 */
        async getBuyMedal() {
            /**各种勋章标记 */
            let totalInfo = await clientCore.MedalManager.getMedal(this._medalIds);
            this.show33 = totalInfo[0].value;
            this.giftOpen = totalInfo[1].value;
            this.adBuyDaily = totalInfo[2].value;
            /**人民币礼包 */
            this.medalBuyStatus = clientCore.ItemsInfo.checkHaveItem(9900096) ? 1 : 0;
            for (let i: number = 0; i < 3; i++) {
                if (clientCore.RechargeManager.checkBuyLimitInfo(this.adRechargeId[i]).lastTime < clientCore.ServerManager.getWeekUpdataSec()) {
                    this.adRmbBuyStatus[i] = 0;
                } else {
                    this.adRmbBuyStatus[i] = 1;
                }
            }
            return Promise.resolve();
        }

        dispose() {

        }
    }
}