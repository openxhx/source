namespace girlWs{
    export class GirlWsModel implements clientCore.BaseModel{

        readonly ACTIVITY_ID: number = 127;
        /** 森之物语套装ID*/
        readonly FARIY_SUIT_ID: number = 2110302;
        /** 抽奖ID*/
        readonly DRAW_ID: number = 3;
        /** 抽奖代币*/
        readonly DRAW_ITEM_ID: number = 9900137;
        /** 缤纷星辰套装ID*/
        readonly STAR_SUIT_ID: number = 2110298;
        /** 缤纷星辰舞台ID*/
        readonly STAR_STAGE_ID: number = 1100058;
        /** 缤纷星辰背景秀ID*/
        readonly STAR_BGSHOW_ID: number = 1000089;
        /** 缤纷星辰坐骑ID*/
        readonly STAR_RIDER_ID: number = 1200011;

        /** 当前折扣*/
        discount: number;
        /** 抽奖次数*/
        times: number;

        private _array: xls.rouletteDrawCost[];

        getCfg(): xls.rouletteDrawCost{
            let times: number = Math.min(this.times,this.array.length - 1);
            return this.array[times];
        }

        get array(): xls.rouletteDrawCost[]{
            if(!this._array){
                this._array = _.filter(xls.get(xls.rouletteDrawCost).getValues(),(element: xls.rouletteDrawCost)=>{ return element.type == this.ACTIVITY_ID; });
            }
            return this._array;
        }

        /** 检查是否折扣*/
        checkDiscount(): boolean{
            return this.discount > 0 && this.discount < 100;
        }

        dispose(): void{
            if(this._array){
                this._array.length = 0;
                this._array = null;
            }
        }
    }
}