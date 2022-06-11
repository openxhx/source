namespace dbfEvent {
    export enum ItemType {
        /**糯米 */
        rice = 0,
        /**红豆 */
        bean,
        /**粽叶 */
        leaf
    }
    export class DbfEventModel implements clientCore.BaseModel {
        /**相关套装id */
        public readonly suitId: number = 2100066;
        /**糯米、红豆、粽叶 */
        public readonly itemIds: number[] = [9900042, 9900043, 9900044];
        /**菖蒲叶id */
        public readonly materialId: number = 1300011;
        /**是否观看剧情 */
        public isStory: number;
        /**菖蒲叶购买礼包次数 */
        public leafBuyTimes: number;
        /**菖蒲叶礼包id */
        public leafBuyIds: number[] = [55, 56];
        /**货币直接购买礼包次数 */
        public coinBuyTimes: number;
        /**货币礼包id */
        public coinBuyIds: number[] = [57, 58, 59, 60];
        /**抽奖消耗 */
        public costCount: number[];
        /**最大抽奖次数 */
        public maxDrawCount: number;
        /**获取可抽奖的最大次数 */
        public getMaxDraw() {
            this.maxDrawCount = 0;
            for (let i: number = 0; i < this.itemIds.length; i++) {
                let count = Math.floor(clientCore.ItemsInfo.getItemNum(this.itemIds[i]) / this.costCount[i]);
                if (i == 0) this.maxDrawCount = count;
                else if (count < this.maxDrawCount) this.maxDrawCount = count;
            }
            if (this.maxDrawCount > 10) this.maxDrawCount = 10;
            return this.maxDrawCount;
        }

        /**读取抽奖消耗 */
        public getCostCount() {
            this.costCount = [];
            let config = xls.get(xls.giftSell).get(1).oneLottery;
            for (let i: number = 0; i < config.length; i++) {
                this.costCount.push(config[i].v2);
            }
        }
        dispose() {

        }
    }
}