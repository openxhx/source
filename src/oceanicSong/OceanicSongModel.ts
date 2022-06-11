namespace oceanicSong {
    export class OceanicSongModel implements clientCore.BaseModel {
        readonly ACTIVITY_ID: number = 157;

        //#region 
        //群星闪耀购买Ids号
        public readonly _periodIds: Array<Array<number>> = [
            [2678],//1buy
            [2679,2680,2681],//2buy
        ];
        //#region 闪耀
        //闪耀 - 粉兔轻语背景show
        public readonly flash_bgshow_id: number = 1000120;
        /**粉兔轻语数量*/
        public surplus_suit_num: number;
        //#endregion

        //#region 弥蓝之情
        /**折扣*/
        public discount: number;
        /**已抽奖次数*/
        public times: number;
        //#endregion

        public getPrices( arr: Array<number> ): Array<number>{
            let cfx: xls.eventExchange;
            let results: Array<number> = [];
            arr.forEach( id => {
                cfx = xls.get( xls.eventExchange ).get( id );
                results.push(cfx.cost[0].v2);
            } );
            return results;
        }

        public getPeriod( suitType: number , playerType: number ): number{
            return this._periodIds[suitType][playerType];
        }

        public  getSuits(periodId: number, sex: number): Array<number>{
            const cfx: xls.eventExchange = xls.get( xls.eventExchange ).get(periodId);
            const pairs: Array<xls.pair> = sex == 1 ? cfx.femaleProperty : cfx.maleProperty;
            let results: Array<number> = [];
            pairs.forEach( item => {
                results.push( item.v1 );
            } );
            return results;
        }

        public getCheckSuits( suitType: number , sex : number): Array<number>{
            const id: number = this._periodIds[suitType][0];
            const cfx: xls.eventExchange = xls.get( xls.eventExchange ).get( id ) as xls.eventExchange;
            let pairs: Array<xls.pair> = sex == 1 ? cfx.femaleProperty : cfx.maleProperty;
            let results: Array<number> = [];
            pairs.forEach( item => {
                results.push( item.v1 );
            } );
            return results;
        }


        //#region 弥蓝之情
        public getCfg(): xls.rouletteDrawCost {
            let array = _.filter(xls.get(xls.rouletteDrawCost).getValues(), (element: xls.rouletteDrawCost) => { return element.type == this.ACTIVITY_ID });
            let times: number = Math.min(this.times, array.length - 1);
            return array[times];
        }
        /** 检查是否折扣*/
        public checkDiscount(): boolean {
            return this.discount > 0 && this.discount < 100;
        }
        //#endregion
        //#endregion
        dispose(): void {

        }
    }
}