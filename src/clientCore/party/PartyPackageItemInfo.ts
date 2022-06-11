namespace clientCore {
    /**
     * 
     */
    export class PartyPackageItemInfo{
        public ID:number;
        public num:number;
        public name:string;
        public putType:number;
        public type:number;

        public static createPackageInfo(id:number,num:number):PartyPackageItemInfo{
            let info = new PartyPackageItemInfo();
            info.ID = id;
            info.num = num;
            let tmpInfo = xls.get(xls.partyHouse).get(id);
            info.name = tmpInfo.furnitureName;
            info.putType = tmpInfo.mapArea;
            info.type = tmpInfo.furnitureType;
            return info;
        }
    }
}