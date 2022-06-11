namespace orderSystem {
    export class OrderBaseDB {
        private _list: Array<xls.orderBase>;
        private _map: util.HashMap<xls.orderBase>

        constructor(config: util.HashMap<xls.orderBase>) {
            this._list = config.getValues();
            this._map = config;
        }

        public get length(): number {
            return this._list.length;
        }

        public getOrderList(): Array<xls.orderBase> {
            return this._list;
        }

        public getOrderById(id: number): xls.orderBase {
            return this._map.get(id);
        }
    }
}