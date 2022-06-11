namespace anniversary {
    export class AnniversaryModel implements clientCore.BaseModel {
        /**货币id */
        public readonly coinId: number = 9900046;
        /**许愿花牌 */
        public readonly drawCoin: number = 1511009;
        /**累计活跃值 */
        public activeValue: number;
        /**活跃值奖励状态 */
        public activeRewardStatus: number;
        /**活跃值VIP奖励领取状态 */
        public activeVIPRewardStatus: number;
        /**累计消费值 */
        public totalCost: number;
        /**累计消费奖励状态 */
        public costRewardStatus: number;
        /**许愿之池预约礼包 */
        public readonly orderGiftId: number[] = [29];
        /**许愿之池抽奖次数 */
        public drawCount: number;
        /**许愿之池抽奖次数奖励状态 */
        public drawCountRewardStatus: number;
        /**芳华勋章激活状态 */
        public medalBuyStatus: number;
        /**花开几度打开 */
        public hkjdOpen: number;
        /**花愿之池打开 */
        public xyzcOpen: number;
        /**花之恋语打开 */
        public hzlyOpen: number;
        /**神奇密码 */
        public code: string;
        /**广告页购买状态 */
        public adBuyStatus: number;
        /**特惠礼包购买状态 */
        public show33: number;
        /**广告页人民币礼包id */
        public adRmbBuyStatus: number[] = [];
        public readonly adRechargeId: number[] = [39, 40, 41];
        /**礼包购买勋章id */
        private readonly _medalIds: number[] = [
            MedalConst.ANNIVERSARY_OPEN_XYZC_2,
            MedalConst.ANNIVERSARY_BUY_33
        ];
        /**购物车内容 */
        public buyCarInfo: number[] = [];
        /**获取礼包购买情况 */
        async getBuyMedal() {
            /**各种勋章标记 */
            let totalInfo = await clientCore.MedalManager.getMedal(this._medalIds);
            this.xyzcOpen = totalInfo[0].value;
            this.show33 = totalInfo[1].value;
            /**人民币礼包 */
            this.medalBuyStatus = clientCore.ItemsInfo.checkHaveItem(9900047) ? 1 : 0;//totalInfo[2].value;
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