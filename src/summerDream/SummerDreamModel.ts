namespace summerDream {
    export class SummerDreamModel implements clientCore.BaseModel {
        /** 活动ID*/
        readonly ACTIVITY_ID: number = 145;
        /**购物车内容 */
        public buyCarInfo: number[] = [];
        /**锁定切换 */
        public lockPanel: boolean = false;
        /** 当前折扣*/
        discount: number;
        /** 抽奖次数*/
        times: number;
        dispose() {
            this.buyCarInfo = null;
        }

        getCfg(period: number): xls.rouletteDrawCost {
            let array = _.filter(xls.get(xls.rouletteDrawCost).getValues(), (element: xls.rouletteDrawCost) => { return element.type == this.ACTIVITY_ID && element.period == period });
            let times: number = Math.min(this.times, array.length - 1);
            return array[times];
        }

        /** 检查是否折扣*/
        checkDiscount(): boolean {
            return this.discount > 0 && this.discount < 100;
        }
    }
}