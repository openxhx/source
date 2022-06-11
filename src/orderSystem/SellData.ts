// namespace orderSystem {
//     export class SellData {

//         private _config: xls.sellBase;
//         private _data: pb.ISellOrder;
//         public overtime: number;

//         constructor(data: pb.ISellOrder) {
//             this._config = xls.get(xls.sellBase).get(data.sellOrderId);
//             this._data = data;
//             this.overtime = Math.ceil(new Date().getTime()/1000)+data.excesstime;
//         }

//         public get config() {
//             return this._config;
//         }

//         public get data() {
//             return this._data;
//         }
//     }
// }