
namespace clientCore {
    /**
     * 2号背包，也就是需要扩容的背包，也就是材料背包，也叫2号仓库
     */
    export interface MaterialBagInfo {
        goodsInfo: IGoodsInfo;//服务器给的数据
        xlsInfo: xls.materialBag;//表中信息
    }

    export class MaterialBagManager {
        private static _allBagItemDataArr: util.HashMap<MaterialBagInfo>;
        private static _xlsInfo: util.HashMap<xls.materialBag>;
        public static setUp(): Promise<any> {
            this._allBagItemDataArr = new util.HashMap();
            this._xlsInfo = xls.get(xls.materialBag);
            return Promise.resolve(net.sendAndWait(new pb.cs_get_all_mts()).then((data: pb.sc_get_all_mts) => {
                this._allBagItemDataArr.clear();
                data.mts.map((v) => {
                    let goodsInfo = new GoodsInfo(v.mtsId, v.mtsCnt);
                    this._allBagItemDataArr.add(v.mtsId, { goodsInfo: goodsInfo, xlsInfo: this._xlsInfo.get(v.mtsId) });
                })
            }));
        }
        /**判断是否解锁（物品数量是0也算） */
        public static checkMatUnlock(id: number) {
            return this._allBagItemDataArr.has(id);
        }
        public static get isWareHouseFull() {
            let allitems = this.getAllItems();
            allitems = _.filter(allitems, o => o.xlsInfo.show == 0);
            let sum = _.reduce(allitems, (prev: number, curr) => {
                return prev + curr.goodsInfo.itemNum;
            }, 0)
            return sum >= clientCore.LocalInfo.pkgSize;
        }
        public static checkItemEnough(itemInfo: GoodsInfo): boolean {
            let mInfo = this._allBagItemDataArr.get(itemInfo.itemID);
            if (!mInfo) {
                return false;
            }
            if (mInfo.goodsInfo.itemNum < itemInfo.itemNum) {
                return false;
            }
            return true;
        }
        public static getLackNum(itemInfo: GoodsInfo): number {
            let mInfo = this._allBagItemDataArr.get(itemInfo.itemID);
            if (!mInfo) {
                return itemInfo.itemNum;
            }
            if (mInfo.goodsInfo.itemNum < itemInfo.itemNum) {
                return itemInfo.itemNum - mInfo.goodsInfo.itemNum;
            }
            return 0;
        }
        public static getAllItems(): MaterialBagInfo[] {
            return this._allBagItemDataArr.getValues();
        }

        /**获取还能存放多少个 */
        public static getCanStoreNum() {
            let nowNum = MaterialBagManager.getAllItems().reduce((sum, value) => {
                if (value.xlsInfo.show == 0) return sum + value.goodsInfo.itemNum;
                else return sum;
            }, 0);
            return Math.max(clientCore.LocalInfo.pkgSize - nowNum, 0);
        }
        public static getItemNum(id: number): number {
            let item = this._allBagItemDataArr.get(id);
            if (id == 820001) {
                return BuildQueueManager.allEnergy;
            }
            return item ? item.goodsInfo.itemNum : 0;
        }
        public static refreshData(arr: pb.IMts[]) {
            for (let info of arr) {
                let item = this._allBagItemDataArr.get(info.mtsId);
                if (!item) {
                    let goodsInfo = new GoodsInfo(info.mtsId, info.mtsCnt);
                    this._allBagItemDataArr.add(info.mtsId, { goodsInfo: goodsInfo, xlsInfo: this._xlsInfo.get(info.mtsId) });
                }
                else {
                    item.goodsInfo.itemNum = info.mtsCnt;
                }
            }
            // 检查是否有可以跳转的
            Dispatch.distribute(arr);
        }
        /**获取已拥有的对应食材类型的所有食材id 
         * @param type 1:食材 2：辅料
        */
        public static getFoodByType(type: number) {
            if (type < 1 || type > 2) return [];
            return _.filter(this._xlsInfo.getValues(), (o) => { return o.foodMaterial == type }).map((o) => { return o.itemId });
        }

        /**获取所有可以显示出来的材料id */
        public static getCanShowMtr() {
            return _.filter(this._xlsInfo.getValues(), (o) => { return o.show == 0 }).map((o) => { return o.itemId });
        }
    }
}