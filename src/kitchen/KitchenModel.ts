namespace kitchen {
    export class Material {
        id: number;
        food: number[];
    }
    export class KitchenModel implements clientCore.BaseModel {
        public materialXls: util.HashMap<Material>;
        public serverFoodInfo: util.HashMap<pb.RecipeInfo>;
        /**餐厅当前等级 */
        public curLevel: number;
        /**锅子数据 */
        public serverWokInfo: pb.IWokInfo[];
        /**帮厨的好友 */
        public fHelp: pb.IUserBase;
        /**帮厨的好友神祈 */
        public fGodPray:number;
        /**被帮厨的好友 */
        public bHelpF: pb.IUserBase;
        /**好友帮厨结束时间 */
        public fHelpTime: number;
        /**自己帮厨结束时间 */
        public helpTimeEnd: number;
        /**自己帮厨开始时间 */
        public helpTimeBegin: number;

        public creatMaterialConfig() {
            this.materialXls = new util.HashMap();
            let xlsFood = xls.get(xls.diningRecipe).getValues();
            for (let i: number = 0; i < xlsFood.length; i++) {
                for (let j: number = 0; j < xlsFood[i].material.length; j++) {
                    let materialId = xlsFood[i].material[j].v1;
                    if (!this.materialXls.has(materialId)) {
                        let newMaterial = new Material();
                        newMaterial.id = materialId;
                        newMaterial.food = [];
                        this.materialXls.add(materialId, newMaterial);
                    }
                    this.materialXls.get(materialId).food.push(xlsFood[i].foodId);
                }
            }
        }

        /**判断是否有空余的锅 */
        public judge() {
            let limit = xls.get(xls.diningLevelUp).get(this.curLevel).stockpot;
            for (let i: number = 1; i <= limit; i++) {
                let info = _.find(this.serverWokInfo, (o) => { return o.wokPos == i });
                if (!info.id) return true;
            }
            return false;
        }
        dispose() {
            this.materialXls?.clear();
            this.materialXls = null;
            this.serverWokInfo = null;
            this.serverFoodInfo = null;
            this.fHelp = this.bHelpF = null;
        }
    }
}