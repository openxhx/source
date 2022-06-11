namespace springSummberAppoint{
    export class SpringSummberAppointModel implements clientCore.BaseModel{

        /** 活动ID*/
        readonly ACTIVITY_ID: number = 141;

        /** 当前折扣*/
        discount: number;
        /** 抽奖次数*/
        times: number;
        dispose(): void{

        }

        getCfg(): xls.rouletteDrawCost {
            let array = _.filter(xls.get(xls.rouletteDrawCost).getValues(), (element: xls.rouletteDrawCost) => { return element.type == this.ACTIVITY_ID });
            let times: number = Math.min(this.times, array.length - 1);
            return array[times];
        }

        /** 检查是否折扣*/
        checkDiscount(): boolean {
            return this.discount > 0 && this.discount < 100;
        }
    }
}