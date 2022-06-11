namespace clientCore {
    export class CollocationManager {
        public static isGetData: boolean = false;   //是否已经获取过数据
        private static _itemNumHashMap: util.HashMap<number>;

        public static setUp(): Promise<any> {
            if (CollocationManager.isGetData) {
                return;
            }
            this._itemNumHashMap = new util.HashMap();
            return Promise.resolve(net.sendAndWait(new pb.cs_get_all_unlock_appreciation_ornaments()).then((data: pb.sc_get_all_unlock_appreciation_ornaments) => {
                CollocationManager.isGetData = true;
                data.ids.map((id) => {
                    this._itemNumHashMap.add(id, 1);
                })
            }));
        }

        /**获取指定装饰道具的数量 */
        public static getItemNum(id: number): number {
            if(!this._itemNumHashMap) return 0;
            let item = this._itemNumHashMap.get(id);
            return item ? item : 0;
        }

        public static refreshData(arr: number[]) {
            if (!this._itemNumHashMap) {
                return;
            }
            for (let id of arr) {
                this._itemNumHashMap.add(id, 1);
            }
        }
    }
}