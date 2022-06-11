namespace shop {
    export class ShopDB {
        private _list: Array<xls.shop>;
        private _map: util.HashMap<xls.shop>

        constructor(config: util.HashMap<xls.shop>) {
            //过滤plantShopView字段
            this._list = _.filter(config.getValues(), o => o.plantShopView == 1);
            this._map = config;
        }

        public getListbyType(type: number): Array<xls.shop> {
            let list: xls.shop[] = [];
            this._list.forEach((item) => {
                //建筑,种子 需要把已买过的过滤掉
                let needFilter = item.type == 1 && clientCore.MapItemsInfoManager.instance.checkHasSomeById(item.itemId);
                if (item.type == type && !needFilter) {
                    list.push(item);
                }
            });
            return list;
        }

        public getItemById(id: number): xls.shop {
            return this._map.get(id);
        }

        public static parseUnlockInfo(info: xls.pair) {
            let str = '';
            switch (info.v1) {
                case 1:
                    str = clientCore.LocalInfo.userLv < info.v2 ? '角色等级达到' + info.v2 : '';
                    break;
                case 2:
                    break;
                case 3:
                    str = clientCore.LocalInfo.treeLv < info.v2 ? '精灵树等级' + info.v2 : '';
                    break;
                default:
                    break;
            }
            return str;
        }
    }
}