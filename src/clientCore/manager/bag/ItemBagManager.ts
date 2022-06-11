namespace clientCore {
    /**
     * 3号背包
     */
    export interface ItemBagInfo {
        goodsInfo: IGoodsInfo;//服务器给的数据
        xlsInfo: xls.itemBag;//表中信息
    }

    export class ItemBagManager {
        private static _allBagItemDataArr: util.HashMap<ItemBagInfo>;
        private static _xlsInfo: util.HashMap<xls.itemBag>;
        private static _redItemHash: util.HashMap<number>;//是否需要展示红点 k:id v:上次展示红点时该id的数量
        private static _itemNumAHashMap:util.HashMap<number>;
        public static setUp(): Promise<any> {
            this._xlsInfo = xls.get(xls.itemBag);
            this._allBagItemDataArr = new util.HashMap();
            this._redItemHash = new util.HashMap();
            this._itemNumAHashMap = new util.HashMap();
            return Promise.resolve(net.sendAndWait(new pb.cs_get_all_item()).then((data: pb.sc_get_all_item) => {
                this._allBagItemDataArr.clear();
                data.itemInfo.map((v) => {
                    let goodsInfo = new GoodsInfo(v.itemId, v.itemCnt);
                    this._itemNumAHashMap.add(v.itemId,v.itemCnt);
                    if (goodsInfo.itemNum > 0) {
                        if (this._xlsInfo.has(v.itemId)) {
                            this._allBagItemDataArr.add(v.itemId, { goodsInfo: goodsInfo, xlsInfo: this._xlsInfo.get(v.itemId) });
                            if (this._xlsInfo.get(v.itemId).event == 2) {
                                this._redItemHash.add(v.itemId, 0);
                            }
                        }
                        else {
                            console.log(v.itemId + '在itemBag中不存在');
                        }
                    }
                    if (v.itemId > 9900000) {
                        MoneyManager.add(v.itemId, v.itemCnt);
                    }
                })
            }));
        }
        /**当前是否要展示红点 */
        public static needShowRed(id: number) {
            if (this._redItemHash.has(id)) {
                return this._redItemHash.get(id) < this.getItemNum(id);
            }
            return false;
        }
        /**点击后去掉红点（红点记录为当前数量） */
        public static cancleRed(id: number) {
            if (this._redItemHash.has(id)) {
                this._redItemHash.add(id, this.getItemNum(id));
            }
        }
        /**判断是否有可用道具红点 */
        public static checkHasItemRed() {
            for (const id of this._redItemHash.getKeys()) {
                if (this._redItemHash.get(id) < this.getItemNum(parseInt(id)))
                    return true;
            }
            return false
        }
        /**获取道具背包里的数量 */
        public static getItemNum(id: number): number {
            let item = this._allBagItemDataArr.get(id);
            return item ? item.goodsInfo.itemNum : 0;
        }

        public static getFairyNum(id: number) {
            return  this._itemNumAHashMap.get(id);
            // if(this._allBagItemDataArr.has(id)){
            //     return this._allBagItemDataArr.get(id).goodsInfo.itemNum;
            // }
            // return null;
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
        public static getAllItems(): ItemBagInfo[] {
            return this._allBagItemDataArr.getValues();
        }

        public static getItemsData(ids: number[]): ItemBagInfo[] {
            return _.map(ids, (id) => {
                let item = this._allBagItemDataArr.get(id);
                //没有的话 返回一个数量为0的对象
                if (!item) {
                    item = { goodsInfo: { itemID: id, itemNum: 0 }, xlsInfo: this._xlsInfo.get(id) };
                }
                return item;
            })
        }

        public static getItemsByEvent(event: number): ItemBagInfo[] {
            let all = this._allBagItemDataArr.getValues();
            return _.filter(all, (info) => {
                if (info.xlsInfo && info.xlsInfo.event == event) {
                    return info;
                }
            });
        }

        public static getItemsByKind(type: number): ItemBagInfo[] {
            let all = this._allBagItemDataArr.getValues();
            return _.filter(all, (info) => {
                if (info.xlsInfo && info.xlsInfo.kind == type) {
                    return info;
                }
            });
        }

        public static refreshData(arr: pb.IItemInfo[]) {
            for (let info of arr) {
                let item = this._allBagItemDataArr.get(info.itemId);
                if (!item) {
                    let goodsInfo = new GoodsInfo(info.itemId, info.itemCnt);
                    this._allBagItemDataArr.add(info.itemId, { goodsInfo: goodsInfo, xlsInfo: this._xlsInfo.get(info.itemId) });
                }
                else {
                    item.goodsInfo.itemNum = info.itemCnt;
                }
                if (info.itemCnt == 0) { //change by chen In 7.28.2019
                    // if (item.goodsInfo && item.goodsInfo.itemNum == 0) {
                    this._allBagItemDataArr.remove(info.itemId);
                }
                if (info.itemId > 9900000) {
                    MoneyManager.add(info.itemId, info.itemCnt);
                }
            }
        }
    }
}