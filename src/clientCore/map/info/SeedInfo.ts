namespace clientCore {
    /**
     * 
     */
    export class SeedInfo{
        public seedID:number;
        public num:number;
        public name:string;
        public putType:number;

        public static createSeedInfo(id:number,num:number):SeedInfo{
            let info = new SeedInfo();
            info.seedID = id;
            info.num = num;
            let flowerID = SeedFlowerRelateConf.getRelateID(id);
            let tmpFlowerInfo = xls.get(xls.manageBuildingId).get(flowerID);
            info.name = xls.get(xls.itemBag).get(id).name;
            info.putType = tmpFlowerInfo.mapArea;
            return info;
        }
    }
}