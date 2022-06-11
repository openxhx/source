namespace clientCore {
    /**
     * 合成管理
     */
    export class MergeManager {
        constructor() { }

        /**
         * 合成
         * @param itemId 将要合成的物品ID
         */
        public static async merge(itemId: number): Promise<void> {
            let array: xls.commonMerge[] = xls.get(xls.commonMerge).getValues();
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.commonMerge = array[i];
                if (element && element.mergeRequire.v1 == itemId) {
                    if (element.unique == 1) {
                        let isMerge: boolean = await this.mergeHistory(element.mergeId);
                        if (isMerge) {
                            element.mergeId == 1 && alert.showFWords('你已经拥有莫拉格斯了哟！'); //这里西蒙兑换特殊处理
                            return;
                        }
                    }
                    net.sendAndWait(new pb.cs_common_merge_item({ id: element.mergeId })).then((msg: pb.sc_common_merge_item) => { alert.showReward(clientCore.GoodsInfo.createArray([msg.item])); })
                    return;
                }
            }
        }


        public static mergeHistory(mergeId: number): Promise<boolean> {
            return net.sendAndWait(new pb.cs_get_common_merge_history()).then((msg: pb.sc_get_common_merge_history) => {
                return Promise.resolve(msg.flag[msg.flag.length - mergeId] == "1");
            })
        }
    }
}