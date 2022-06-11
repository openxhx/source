namespace clientCore {
    /**
     * 
     */
    export class DecorationInfo{
        public decoID:number;
        public num:number;
        public name:string;
        public putType:number;

        public static createDecorationInfo(id:number,num:number):DecorationInfo{
            let info = new DecorationInfo();
            info.decoID = id;
            info.num = num;
            let tmpDecInfo = xls.get(xls.manageBuildingId).get(id);
            info.name = tmpDecInfo.name;
            info.putType = tmpDecInfo.mapArea;
            return info;
        }
    }
}