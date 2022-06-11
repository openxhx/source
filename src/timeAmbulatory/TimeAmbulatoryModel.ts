namespace timeAmbulatory {
    export class TimeAmbulatoryModel implements clientCore.BaseModel {
        /**屏蔽切换界面 */
        public disPanelChange: boolean;
        /**累计活跃值 */
        public activeValue: number;
        /**活跃值奖励状态 */
        public activeRewardStatus: number;
        /**活跃值VIP奖励领取状态 */
        public activeVIPRewardStatus: number;
        /**活跃值额外奖励领取状态 */
        public activeExtraRewardStatus: number;
        /**芳华勋章激活状态 */
        public medalBuyStatus: number;
        /**累计消费领奖状态 */
        public costRewardStatus: number;

        /**光阴之信一生一次红点 */
        public letterRed: number;
        dispose() {

        }
    }
}