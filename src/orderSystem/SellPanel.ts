// namespace orderSystem {
//     export class SellPanel extends ui.orderSystem.OrderSellModuleUI {

//         private _initInfo: Promise<any>;
//         private _dataList: SellData[];
//         // private _tipsPanel: materialTips.MaterialTipsPanel;
//         private _flag: boolean;

//         constructor() {
//             super();
//             // this.addPreLoad(xls.load(xls.sellBase));
//             // this.addPreLoad(xls.load(xls.manageBuildingId));
//             // this.addPreLoad(xls.load(xls.manageBuildingFormula));
//             // this._initInfo = net.sendAndWait(new pb.cs_get_sell_order_info());
//             // this.addPreLoad(this._initInfo);
//             this.itemlist.vScrollBarSkin = '';
//             this.itemlist.itemRender = SellRender;
//             this.itemlist.dataSource = [];
//         }

//         init(d: any) {
//             super.init(d);
//             Laya.timer.frameLoop(15, this, this.refreshCountdown);
//         }

//         private refreshCountdown() {
//             let renderList: SellRender[] = this.itemlist.cells as SellRender[];
//             let nowTime: number = Math.ceil(new Date().getTime() / 1000);
//             let flag: boolean = false;
//             for (let i: number = 0; i < renderList.length; i++) {
//                 renderList[i].refreshTime(nowTime) && (flag = true);
//             }
//             if (flag && !this._flag) {
//                 this._flag = true;
//                 net.sendAndWait(new pb.cs_get_sell_order_info()).then((data: pb.sc_get_sell_order_info) => {
//                     this.getInfo(data.sellOrder);
//                 });
//             }
//         }

//         public onPreloadOver() {
//             // this._tipsPanel = new materialTips.MaterialTipsPanel();
//             // this._tipsPanel.visible = false;
//             // this.itemlist.addChild(this._tipsPanel);
//             net.sendAndWait(new pb.cs_get_sell_order_info({})).then((data: pb.sc_get_sell_order_info) => {
//                 this.getInfo(data.sellOrder);
//             });
//         }

//         public getInfo(data: pb.ISellOrder[]) {
//             this._flag = false;
//             this._dataList = [];
//             for (let i: number = 0; i < data.length; i++) {
//                 this._dataList.push(new SellData(data[i]));
//             }
//             this._dataList.sort(this.sortOrder);
//             this.itemlist.array = this._dataList;
//         }

//         public sortOrder(a: SellData, b: SellData): number {
//             return b.data.isBuff - a.data.isBuff;
//         }

//         private onRefreshAll() {
//             net.sendAndWait(new pb.cs_refresh_all_sell_order()).then((data: pb.sc_refresh_all_sell_order) => {
//                 this.getInfo(data.sellOrder);
//             });
//         }

//         private refreshOne(oldId: number, order: pb.ISellOrder) {
//             for (let i: number = 0; i < this._dataList.length; i++) {
//                 if (this._dataList[i].config.id == oldId) {
//                     if (order && order.sellOrderId) {
//                         this._dataList[i] = new SellData(order);
//                     } else {
//                         this._dataList.splice(i, 1);
//                     }
//                 }
//             }
//             this._dataList.sort(this.sortOrder);
//             this.itemlist.refresh();
//         }

//         private clickRender(e: Laya.Event, index: number) {
//             if (e.type == Laya.Event.CLICK) {
//                 let id: number = this._dataList[index].data.sellOrderId;
//                 if (e.target.name == "btnRefresh") {
//                     net.sendAndWait(new pb.cs_refresh_sell_order({ sellOrderId: id })).then((data: pb.sc_refresh_sell_order) => {
//                         this.refreshOne(data.oldSellOrderId, data.sellOrder);
//                     });
//                 }
//                 else if (e.target.name == "btnSell1") {
//                     net.sendAndWait(new pb.cs_sell_order({ sellOrderId: id })).then((data: pb.sc_sell_order) => {
//                         let goodsList: clientCore.GoodsInfo[] = [];
//                         for (let i: number = 0; i < data.rewardItem.length; i++) {
//                             goodsList.push(new clientCore.GoodsInfo(data.rewardItem[i].id, data.rewardItem[i].cnt));
//                         }
//                         alert.showReward(goodsList, "");
//                         this.refreshOne(data.oldSellOrderId, data.sellOrder);
//                     })
//                 }
//                 else if (e.target.name == "btnSell0") {
//                     net.sendAndWait(new pb.cs_sell_order({ sellOrderId: id })).then((data: pb.sc_sell_order) => {
//                         let goodsList: clientCore.GoodsInfo[] = [];
//                         for (let i: number = 0; i < data.rewardItem.length; i++) {
//                             goodsList.push(new clientCore.GoodsInfo(data.rewardItem[i].id, data.rewardItem[i].cnt));
//                         }
//                         alert.showReward(goodsList, "");
//                         this.refreshOne(data.oldSellOrderId, data.sellOrder);
//                     })
//                 }
//                 else if (e.target.name == "icon") {
//                     let data: SellData = this._dataList[index];
//                     let render: Laya.Box = this.itemlist.getCell(index);
//                     // this._tipsPanel.x = render.x - 200;
//                     // this._tipsPanel.y = render.y;
//                     // this._tipsPanel.setItemId(data.config.orderContents.v1);
//                     alert.showFWords('tips需要提取出来')
//                     this.callLater(() => {
//                         this.stage.on(Laya.Event.MOUSE_DOWN, this, this.hideTips);
//                     });
//                 }
//             }
//         }

//         private hideTips(e: Laya.Event) {
//             if (e.target.name == "icon") return;
//             this.callLater(() => {
//                 this.stage.off(Laya.Event.MOUSE_DOWN, this, this.hideTips);
//             });
//             // this._tipsPanel.visible = false;
//         }

//         public addEventListeners() {
//             this.btnRefreshAll.on(Laya.Event.CLICK, this, this.onRefreshAll);
//             this.itemlist.mouseHandler = Laya.Handler.create(this, this.clickRender, null, false);
//             EventManager.on(globalEvent.MATERIAL_CHANGE, this, this.itemNumChange);
//         }
//         private itemNumChange(e: Laya.Event) {
//             this.itemlist.refresh();
//         }
//         public removeEventListeners() {
//             this.btnRefreshAll.offAll();
//         }

//         public destroy() {
//             Laya.timer.clear(this, this.refreshCountdown);
//             this.itemlist.mouseHandler.recover();
//             this.itemlist.destroy();
//             super.destroy();
//         }
//     }
// }