namespace springMedal {
    export class SpringMedalModel implements clientCore.BaseModel {
        /**累计活跃值 */
        public activeValue: number;
        /**活跃值奖励状态 */
        public activeRewardStatus: number;
        /**活跃值VIP奖励领取状态 */
        public activeVIPRewardStatus: number;
        /**芳华勋章激活状态 */
        public medalBuyStatus: number;
        /**最大奖励活跃度 */
        public maxActiveValue:number;
        initMsg(msg: pb.sc_get_lucky_medal_info) {
            this.activeValue = msg.activeValue;
            this.activeRewardStatus = msg.freeId;
            this.activeVIPRewardStatus = msg.payId;

            let medal30 = clientCore.RechargeManager.getShopInfo(33).rewardFamale[0].v1;
            let medal128 = clientCore.RechargeManager.getShopInfo(42).rewardFamale[0].v1;
            this.medalBuyStatus = clientCore.ItemsInfo.checkHaveItem(medal30) ? 30 : (clientCore.ItemsInfo.checkHaveItem(medal128) ? 128 : 0);
        }
        dispose() {

        }
    }
}