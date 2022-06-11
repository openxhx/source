namespace clientCore {
    /**
     * 表里面物品信息
     */
    enum TYPE_NAME {
        '货币' = 1,
        '材料' = 5,
        '生产品' = 7,
        '升级材料' = 8,
        '基础材料' = 13,
        '礼包道具' = 19,
        '功能道具' = 15,
        '技能' = 16,
        '属性碎片' = 17,
        '花种' = 20,
        '花精灵' = 23,
        '采集材料' = 71
    }

    export class ItemsInfo {
        private static _allItemHashMap: util.HashMap<{ itemId: number, name: string, captions: string }>;
        private static _allItemUrlHashMap: util.HashMap<any>;
        public static setUp() {
            this._allItemHashMap = new util.HashMap();
            this._allItemUrlHashMap = new util.HashMap();
            let arr1 = xls.get(xls.materialBag).getValues();
            let arr2 = xls.get(xls.itemBag).getValues();
            this.addItemInfo(arr1);
            this.addItemInfo(arr2);

            this.parseAllItemUrl();
        }
        private static addItemInfo(arr: any[]) {
            for (let info of arr) {
                this._allItemHashMap.add(info.itemId, info);
            }
        }
        private static copyInfo(info, id) {
            let newInfo = JSON.parse(JSON.stringify(info));
            newInfo.itemId = id;
            return newInfo;
        }
        public static getItemInfo(id: number): { itemId: number, name: string } {
            if (this._allItemHashMap.has(id)) {
                return this._allItemHashMap.get(id);
            }
            else if (ClothData.getCloth(id)) {
                let cloth = ClothData.getCloth(id)
                return { itemId: cloth.xlsInfo.clothesId, name: cloth.name };
            }
        }
        /**获取物品名称（支持服装,角色,建筑） */
        public static getItemName(id: number) {
            if (this._allItemHashMap.has(id)) {
                return this._allItemHashMap.get(id).name;
            }
            else if (ClothData.getCloth(id)) {
                return ClothData.getCloth(id).name;
            }
            else if (xls.get(xls.characterId).has(id)) {
                return xls.get(xls.characterId).get(id).name;
            }
            else if (xls.get(xls.manageBuildingId).has(id)) {
                return xls.get(xls.manageBuildingId).get(id).name;
            }
            else if (xls.get(xls.suits).has(id)) {
                return xls.get(xls.suits).get(id).name + '套装';
            }
            else if (xls.get(xls.bgshow).has(id)) {
                return xls.get(xls.bgshow).get(id).name;
            }
            else if (xls.get(xls.partyHouse).has(id)) {
                return xls.get(xls.partyHouse).get(id).furnitureName;
            }
            else if (xls.get(xls.title).has(id)) {
                return xls.get(xls.title).get(id).titleName;
            }
            else if (xls.get(xls.userHead).has(id)) {
                return xls.get(xls.userHead).get(id).name;
            }
            else if (xls.get(xls.userHeadFrame).has(id)) {
                return xls.get(xls.userHeadFrame).get(id).name;
            }
            else if (xls.get(xls.collocation).has(id)) {
                return xls.get(xls.collocation).get(id).name;
            }
            else {
                return '';
            }
        }
        public static getItemCaptions(id: number) {
            if (this._allItemHashMap.has(id)) {
                return this._allItemHashMap.get(id).captions;
            }
            else if (ClothData.getCloth(id)) {
                let str = xls.get(xls.itemCloth).get(id)?.describe;
                return str ? str : "这是一个漂亮的装扮";
            }
            else if (xls.get(xls.manageBuildingId).has(id)) {
                return xls.get(xls.manageBuildingId).get(id).captions;
            }
            else if (xls.get(xls.collocation).has(id)) {
                return xls.get(xls.collocation).get(id).captions;
            }
            else {
                return '';
            }
        }
        private static parseAllItemUrl() {
            let arr = xls.get(xls.uiUrl).getValues();
            for (let info of arr) {
                let id = Math.floor(info.startID / 100000);
                this._allItemUrlHashMap.add(id, info);
            }
        }
        /**
         * 获取素材icon路径(支持服装,套装，角色)
         * @param itemId 
         */
        public static getItemIconUrl(itemId: number) {
            if (ClothData.getCloth(itemId)) {
                return pathConfig.getClothIcon(itemId);
            }
            else if (this._allItemUrlHashMap.has(Math.floor(itemId / 100000))) {
                let id = Math.floor(itemId / 100000);
                let xls = this._allItemUrlHashMap.get(id);
                if ((itemId >= 3900025 && itemId <= 3900034)) {
                    return xls.iconUrl + "3900000.png";
                } else {
                    return xls.iconUrl + itemId + ".png";
                }
            }
            else if (xls.get(xls.characterId).has(itemId)) {
                return pathConfig.getRoleIcon(itemId);
            }
            else if (xls.get(xls.suits).has(itemId)) {
                return pathConfig.getSuitIcon(itemId, clientCore.LocalInfo.sex);
            }
            else {
                return '';
            }
        }

        /** 性能消耗大 不能用于正式*/
        public static getIdByName(name: string): number {
            //衣服
            let cloths: xls.itemCloth[] = xls.get(xls.itemCloth).getValues();
            let len: number = cloths.length;
            for (let i: number = 0; i < len; i++) {
                if (cloths[i].name == name) return cloths[i].clothesId;
            }
            //人物
            let roles: xls.characterId[] = xls.get(xls.characterId).getValues();
            len = roles.length;
            for (let i: number = 0; i < len; i++) {
                if (roles[i].name == name) return roles[i].characterId;
            }
            //道具
            let items: xls.itemBag[] = xls.get(xls.itemBag).getValues();
            len = items.length;
            for (let i: number = 0; i < len; i++) {
                if (items[i].name == name) return items[i].itemId;
            }
            //材料
            let materials: xls.materialBag[] = xls.get(xls.materialBag).getValues();
            len = materials.length;
            for (let i: number = 0; i < len; i++) {
                if (materials[i].name == name) return materials[i].itemId;
            }
        }

        /**获取icon底板素材（支持服装  依据itemCloth表和itemBag表中quality字段  两个表中找不到id就是默认底框） */
        public static getItemIconBg(itemId: number) {
            let quality = 1;
            if (ClothData.getCloth(itemId)) {
                quality = ClothData.getCloth(itemId).xlsInfo.quality;
            }
            else if (xls.get(xls.itemBag).has(itemId)) {
                quality = xls.get(xls.itemBag).get(itemId).quality;
            }
            else if (xls.get(xls.materialBag).has(itemId)) {
                quality = xls.get(xls.materialBag).get(itemId).quality;
            }
            else if (xls.get(xls.characterId).has(itemId)) {
                quality = 3;
            }
            else if (xls.get(xls.bgshow).has(itemId)) {
                quality = xls.get(xls.bgshow).get(itemId).quality;
            }
            else if (xls.get(xls.userHeadFrame).has(itemId) || xls.get(xls.userHead).has(itemId)) {
                return '';
            }
            else if (xls.get(xls.partyHouse).has(itemId)) {
                quality = xls.get(xls.partyHouse).get(itemId).quality;
            }
            else if (xls.get(xls.suits).has(itemId)) {
                quality = xls.get(xls.suits).get(itemId).quality;
            }
            quality = _.clamp(quality, 1, 5);
            return `commonRes/iconType_${quality}.png`;
        }

        /** 获取品质*/
        public static getItemQuality(itemId: number): number {
            let quality: number = 0;
            if (ClothData.getCloth(itemId)) {
                quality = ClothData.getCloth(itemId).xlsInfo.quality;
            }
            else if (xls.get(xls.itemBag).has(itemId)) {
                quality = xls.get(xls.itemBag).get(itemId).quality;
            }
            return quality;
        }

        /** 获取介绍说明*/
        public static getItemDesc(itemId: number): string {
            if (ClothData.getCloth(itemId)) {
                return ClothData.getCloth(itemId).xlsInfo.describe;
            }
            else if (xls.get(xls.itemBag).has(itemId)) {
                return xls.get(xls.itemBag).get(itemId).captions;
            }
            return "";
        }

        /**
         * 获取素材路径
         * @param itemId 
         */
        public static getItemUIUrl(itemId: number) {
            let id = Math.floor(itemId / 100000);
            return this._allItemUrlHashMap.has(id) ? this._allItemUrlHashMap.get(id).uiUrl + itemId + ".png" : '';
        }
        /**
         * 判断物品数量不否足够
         * @param arr 
         */
        public static checkItemsEnough(arr: GoodsInfo[]): boolean {
            for (let info of arr) {
                if (xls.get(xls.materialBag).has(info.itemID)) {
                    if (!MaterialBagManager.checkItemEnough(info)) {
                        return false;
                    }
                }
                else if (xls.get(xls.itemBag).has(info.itemID)) {
                    if (!ItemBagManager.checkItemEnough(info)) {
                        return false;
                    }
                }
            }
            return true;
        }
        /**
         * 获取不足的数量
         * @param itemInfo 
         */
        public static getItemLackNum(itemInfo: GoodsInfo): number {
            let haveHam = this.getItemNum(itemInfo.itemID);
            return Math.max(itemInfo.itemNum - haveHam, 0);
        }
        /**
         * 
         * @param itemInfo 
         * 获取物品数量,支持材料，道具，服装，背景秀、舞台，装饰，套装（是否集齐）
         */
        public static getItemNum(id: number): number {
            if (xls.get(xls.materialBag).has(id)) {
                return MaterialBagManager.getItemNum(id);
            }
            else if (xls.get(xls.itemBag).has(id)) {
                return ItemBagManager.getItemNum(id);
            }
            else if (xls.get(xls.itemCloth).has(id)) {
                return clientCore.LocalInfo.checkHaveCloth(id) ? 1 : 0;
            }
            else if (xls.get(xls.bgshow).has(id)) {
                let bgInfo = BgShowManager.instance.getDecoInfoById(id)
                return bgInfo ? (bgInfo.restTime != 0 ? 1 : 0) : 0;
            }
            else if (xls.get(xls.manageBuildingId).has(id)) {
                return MapItemsInfoManager.instance.getPackageDecorationNumInById(id);
            }
            else if (xls.get(xls.suits).has(id)) {
                return clientCore.SuitsInfo.getSuitInfo(id).allGet ? 1 : 0;
            }
            else if (xls.get(xls.collocation).has(id)) {
                return CollocationManager.getItemNum(id);
            }
            return 0;
        }

        public static getItemLimitNum(id: number): number {
            if (xls.get(xls.itemBag).has(id)) {
                return xls.get(xls.itemBag).get(id).max;
            }
            else if (xls.get(xls.materialBag).has(id)) {
                return xls.get(xls.materialBag).get(id).max;
            }
            return 1;
        }

        /**获取 */
        public static getItemTypeName(id: number) {
            if (xls.get(xls.materialBag).has(id)) {
                let kind = xls.get(xls.materialBag).get(id).kind
                return TYPE_NAME[kind] ? TYPE_NAME[kind] : '道具'
            }
            else if (xls.get(xls.itemBag).has(id)) {
                let kind = xls.get(xls.itemBag).get(id).kind
                return TYPE_NAME[kind] ? TYPE_NAME[kind] : '道具'
            }
            else if (xls.get(xls.itemCloth).has(id)) {
                return '服装';
            }
            return '';
        }

        /**
         * 1301001~1301999 被认为是特殊产品
         * 是否是特殊道具
         */
        public static isSpecial(id: number): boolean {
            return xls.get(xls.materialBag).has(id) && id >= 1301001 && id <= 1301999;
        }

        public static checkHaveItem(id: number): boolean {
            if (xls.get(xls.title).has(id))
                return clientCore.TitleManager.ins.checkHaveTitle(id);
            return clientCore.ItemsInfo.getItemNum(id) > 0;
        }
    }
}