namespace anniversary2021{
    /**
     * 通用价格
     */
    export class PriceItem extends ui.anniversary2021.item.PriceItemUI{

        /**
         * 设置信息
         * @param array 
         */
        public setInfo(array: xls.eventExchange[]): void{
            let type: number = clientCore.FlowerPetInfo.petType;
            _.forEach(array,(element: xls.eventExchange,index: number)=>{
                this[`price_${index}`].changeText(element.cost[0].v2 + '');
            })
            this.imgGou.y = type == 0 ? 2 : (type == 3 ? 62 : 32); 
        }

        get price(): number{
            let type: number = clientCore.FlowerPetInfo.petType;
            let idx: number = type == 0 ? 1 : (type == 3 ? 3 : 2);
            return parseInt(this[`price_${idx}`].text);
        }
    }
}