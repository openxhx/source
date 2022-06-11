namespace summerMemory {
    export class SummerMemoryModel implements clientCore.BaseModel {
        public TARGET_ITEM_ID = 9900167;
        public readonly SUIT_ID = 2110370;
        public readonly MATEIAL_ID = 700008;
        /**每日最大交换次数 */
        public readonly MAX_EXCHANGE_COUNT = 1;
        /**每日最大游戏次数 */
        public readonly MAX_GAME_COUNT = 3;
        /**每日礼包id */
        public readonly _buyIdArr: number[] = [136, 137, 138, 139];
        /**当前可购买礼包index */
        public _curBuyIndex: number;
        /**今日交换次数 */
        public _exchangeTimes: number;
        /**今日游戏次数 */
        public _gameTimes: number;
        /**奖励配置 */
        public rewardArr: xls.commonAward[];
        /**最大代币需求 */
        public maxCost: number;
        /**当前捕鱼数量 */
        public fishCnt: number[];
        /**获取奖励配置 */
        public getRewardArr() {
            this.rewardArr = _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == 150 });
            this.TARGET_ITEM_ID = this.rewardArr[this.rewardArr.length - 1].num.v1;
            this.maxCost = this.rewardArr[this.rewardArr.length - 1].num.v2;
        }

        /**当前面板数据 */
        public setCurData(data: pb.sc_summer_memory_panel) {
            this._exchangeTimes = data.exchangeItemFlag;
            this._gameTimes = data.gameTimes;
            this._curBuyIndex = data.buyTimes;
            this.fishCnt = data.fishNum;
            this.fishCnt.splice(1, 1);
        }

        dispose(): void {
        }
    }
}