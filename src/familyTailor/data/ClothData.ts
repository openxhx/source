namespace familyTailor.data {
    /**
     * 服装部件的数据
     */
    export class ClothData {

        /** 商店类型 0-裁缝小铺 1-服装圣殿*/
        public type: number;
        /** 配置*/
        public xlsData: xls.familyClothStore | xls.clothTemple;

        constructor() { }

        public dispose(): void {
            this.xlsData = null;
            Laya.Pool.recover("ClothData", this);
        }

        public static create(): ClothData {
            return Laya.Pool.getItemByClass("ClothData", ClothData);
        }

        public checkCanMake() {
            //暂时只针对服装圣殿
            // if (this.type == 0)
            //     return false;
            //已有了就不可制作
            if (clientCore.LocalInfo.checkHaveCloth(this.xlsData.clothId))
                return false;
            for (const needItem of this.xlsData.materials) {
                if (clientCore.ItemsInfo.getItemLackNum({ itemID: needItem.v1, itemNum: needItem.v2 }) > 0) {
                    return false;
                }
            }
            return true;
        }
    }
}