namespace whiteNightTheory {
    export class WhiteNightTheoryModel implements clientCore.BaseModel {
        /**规则ID */
        public readonly RULE_ID: number = 1152;
        /**套装ID */
        public readonly SUIT_ID: number = 2110444;
        /**剧情ID */
        public readonly PLOT_ID: number = 80540;
        /**代币 */
        public readonly MONEY_ID: number = 9900210;
        public readonly ITEM_DATA_LIST: Array<IItemVo>;
        public readonly FLAG_ITEM_INDEX: number = 4;
        public readonly ITEM_TOTAL: number = 8;
        /**红点ID */
        public readonly RED_POINTER_ID: number = 29001;

        public constructor() {
            this.ITEM_DATA_LIST = [];
            const sex: number = clientCore.LocalInfo.sex;
            const moneys: Array<number> = [6, 12, 18, 24, 30, 36, 42, 48];
            const items: number[] = sex == 1 ?
                [129287, 129282, 129286, 129285, 129280, 129281, 129283, 129284] :
                [129295, 129290, 129294, 129293, 129288, 129289, 129291, 129292]
            for (let i: number = 0; i < this.ITEM_TOTAL; i++) {
                this.ITEM_DATA_LIST.push({
                    index: i,
                    moneyNum: moneys[i],
                    itemId: items[i]
                });
            }
        }

        /**
         * 是否完成
         */
        public isFinishedItem(index: number | IItemVo): boolean {
            let itemIds: number;
            if (typeof (index) == "number") {
                itemIds = this.ITEM_DATA_LIST[index].itemId;
            } else {
                itemIds = index.itemId;
            }
            return clientCore.ItemsInfo.checkHaveItem(itemIds);
        }
        /**
         * 是否全部完成
         */
        public isFinishedAll(): boolean {
            let isFinished: boolean = true;
            let cell: IItemVo;
            for (let i: number = 0, j: number = this.ITEM_DATA_LIST.length; i < j; i++) {
                cell = this.ITEM_DATA_LIST[i];
                if (!clientCore.ItemsInfo.checkHaveItem(cell.itemId)) {
                    isFinished = false;
                    break;
                }
            }
            return isFinished;
        }
        /**
         * 获取下一个待领取的item
         */
        public getNextDoingItem(): IItemVo {
            let cell: IItemVo;
            for (let i: number = 0, j: number = this.ITEM_DATA_LIST.length; i < j; i++) {
                cell = this.ITEM_DATA_LIST[i];
                if (!clientCore.ItemsInfo.checkHaveItem(cell.itemId)) {
                    return cell;
                }
            }
            return null;
        }
        dispose(): void {

        }
    }
}