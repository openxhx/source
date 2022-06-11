namespace clientCore {
    /**
     * 种子跟花种ID映射关系表
     * 
     */
    export class FlowerGrowConf {
        private static flowerGrowHashMap:util.HashMap<xls.flowerGrow[]>;
        public static setUp(){
            this.flowerGrowHashMap = new util.HashMap<xls.flowerGrow[]>();
            let arr = xls.get(xls.flowerGrow).getValues();
            for(const info of arr){
                if(!this.flowerGrowHashMap.has(info.buildingTypeId)){
                    this.flowerGrowHashMap.add(info.buildingTypeId,[]);
                }
                this.flowerGrowHashMap.get(info.buildingTypeId).push(info);
            }
        }
        /**
         * 通过花朵的ID跟已经种植过的花朵数量，计算花朵的等级
         * @param flowerID 
         * @param num 
         */
        public static getFlowerLevel(flowerID:number,num:number):number{
            let arr = this.flowerGrowHashMap.get(flowerID);
            let level = 0;
            for(let i = 0;i<arr.length;i++){
                if(num >= arr[i].plantNum){
                    level++;
                }
                else{
                    break;
                }
            }
            return level;
        }
        /**
         * 获取获得当前最大生产数量
         * @param flowerID 
         * @param plantNum 
         */
        public static getFlowerMaxGrowNum(flowerID:number,num:number):number{
            let arr = this.flowerGrowHashMap.get(flowerID);
            for(let i = 0;i<arr.length;i++){
                if(num < arr[i].plantNum){
                    return arr[i-1].stackLimit;
                }
            }
            return arr[arr.length-1].stackLimit;
        }

        /**
         * 获得加成后的最大生产数
         * @param flowerID 
         * @param num 
         */
        public static getFlowerMax(flowerID:number,num:number): number{
            let max: number = this.getFlowerMaxGrowNum(flowerID,num);
            let xlsFlower: xls.manageBuildingId = xls.get(xls.manageBuildingId).get(flowerID);
            let waterAdd: number = xlsFlower.mapArea == 2 ? clientCore.ScienceTreeManager.ins.increment(8) : 0; //水域花加成
            let landAdd: number = xlsFlower.mapArea == 1 ? clientCore.ScienceTreeManager.ins.increment(9) : 0; //地面花加成
            let allAdd: number = clientCore.ScienceTreeManager.ins.increment(2); //全部
            return Math.round(max*(100+waterAdd+landAdd+allAdd)/100);
        }

        public static getFlowerMaxGrowNumByLevel(flowerID:number,level:number):number{
            let arr = this.flowerGrowHashMap.get(flowerID);
            if(level > arr.length){
                return arr[arr.length-1].stackLimit;
            }
            return arr[level-1].stackLimit;
        }
        /** */
        public static getSpeedUpEfficiency(flowerID:number,num:number):number{
            return this.getEfficiencyByLevel(flowerID,this.getFlowerLevel(flowerID,num));
        }

        public static getEfficiencyByLevel(flowerID:number,level:number):number{
            let arr = this.flowerGrowHashMap.get(flowerID);
            if(level > arr.length){
                return arr[arr.length-1].efficiency;
            }
            return arr[level-1].efficiency;
        }

        public static getFlowerMaxLevel(flowerID:number):number{
            return this.flowerGrowHashMap.get(flowerID).length;
        }
        public static nextLevelNeedPlant(flowerID:number,level:number,num:number){
            let arr = this.flowerGrowHashMap.get(flowerID);
            if(level >= arr.length){
                return 0;
            }
            return arr[level].plantNum - num;
        }
    }
}