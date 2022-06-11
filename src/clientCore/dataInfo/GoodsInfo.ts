namespace clientCore {
    export interface IGoodsInfo {
        itemID: number;
        itemNum: number;
    }
    /**
     * 奖励信息接口，可将不同格式的奖励信息转换为 id，num的数组
     * @public itemID 物品id
     * @public itemNum 物品数量
     */
    export class GoodsInfo implements IGoodsInfo {
        public itemID: number;
        public itemNum: number;
        constructor(id?: number, num?: number) {
            this.itemID = id;
            this.itemNum = num;
        }

        static create(pair: xls.pair): GoodsInfo;

        static create(item: pb.IItem): GoodsInfo;

        static create(obj: any): any {
            if (obj instanceof xls.pair) {
                return new GoodsInfo(obj.v1, obj.v2);
            }
            else if (obj instanceof pb.Item) {
                return new GoodsInfo(obj.id, obj.cnt);
            }
            else if (obj.hasOwnProperty('v1') && obj.hasOwnProperty('v2')) {
                return new GoodsInfo(obj.v1, obj.v2);
            }
        }

        static createArray(pairArr: xls.pair[], mergeSameId?: boolean): GoodsInfo[];
        static createArray(itemArr: pb.IItem[], mergeSameId?: boolean): GoodsInfo[];
        static createArray(itemInfoArr: pb.IItemInfo[], mergeSameId?: boolean): GoodsInfo[];
        static createArray(obj: any[], mergeSameId: boolean = false): any {
            let arr: GoodsInfo[] = [];
            if (obj.length > 0) {
                if (obj[0] instanceof xls.pair) {
                    arr = _.map(obj, (o) => {
                        return new GoodsInfo(o.v1, o.v2);
                    });

                }
                else if (obj[0] instanceof pb.Item) {
                    arr = _.map(obj, (o) => {
                        return new GoodsInfo(o.id, o.cnt);
                    });
                }
                else if (obj[0] instanceof pb.ItemInfo) {
                    arr = _.map(obj, (o) => {
                        return new GoodsInfo(o.itemId, o.itemCnt);
                    });
                }
                else if (obj[0].hasOwnProperty('v1') && obj[0].hasOwnProperty('v2')) {
                    arr = _.map(obj, (o) => {
                        return new GoodsInfo(o.v1, o.v2);
                    });
                }
                else if (obj[0] instanceof clientCore.GoodsInfo) {
                    return obj;
                }
                else {
                    return obj;
                }
            }
            if (mergeSameId) {
                let uniq = new util.HashMap<GoodsInfo>();
                for (const o of arr) {
                    if (uniq.has(o.itemID)) {
                        uniq.get(o.itemID).itemNum += o.itemNum;
                    }
                    else {
                        uniq.add(o.itemID, o);
                    }
                }
                return uniq.getValues();
            }
            else {
                return arr;
            }
        }

    }
}