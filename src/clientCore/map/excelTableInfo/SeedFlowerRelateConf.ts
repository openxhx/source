namespace clientCore {
    /**
     * 种子跟花种ID映射关系表
     * 
     */
    export class SeedFlowerRelateConf {
        private static relateHashMap:util.HashMap<number>;
        public static setUp(){
            this.relateHashMap = new util.HashMap<number>();
            let arr = xls.get(xls.flowerPlant).getValues();
            for(const info of arr){
                this.relateHashMap.add(info.flowerId,info.plantExpend);
                this.relateHashMap.add(info.plantExpend,info.flowerId);
            }
        }
        public static isFlower(id:number):boolean{
            return id > 900000 && id < 999999;
        }
        public static isSeed(id:number):boolean{
            return id > 2000000 && id < 2099999;
        }
        public static getRelateID(id:number):number{
            return this.relateHashMap.get(id);
        }
    }
}