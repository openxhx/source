
// namespace orderSystem {
//     export class SellRender extends ui.orderSystem.render.orderSellItemRenderUI {

//         private _itemIcon: Laya.Image;
//         private _itemInfo: SellData;
//         private str0: string = '<span style="font-weight:bold;font:17px Source Han Serif SC Heavy" color="#{0}">{1}</span>';
//         private str1: string = '<span style="font-weight:bold;font:17px Source Han Serif SC Heavy" color="#4d2408}">/{0}</span>';

//         constructor() {
//             super();
//             this.icon.addChild(this._itemIcon = new Laya.Image());
//             this.icon.mouseEnabled = true;
//             this._itemIcon.on(Laya.Event.LOADED, this, this.onComplete);
//             this._itemIcon.scale(.7, .7);
//             this._itemIcon.name = "icon";
//             this._itemIcon.mouseEnabled = true;
//             this.bg1.visible = this.btnSell1.visible = this.label1.visible = false;
//             this.txtProgress.innerHTML = '<span style="font-weight:bold;font:17px Source Han Serif SC Heavy" color="#4d2408">0/12</span>';
//             this.txtProgress.style.align = "center";
//         }

//         public set dataSource(value: SellData) {
//             if (value) {
//                 this._itemInfo = value;
//                 this._itemIcon.skin = clientCore.ItemsInfo.getItemIconUrl(value.config.orderContents.v1);
//                 this.bg0.visible = this.label0.visible = value.data.isBuff == 0;
//                 this.bg1.visible = this.label1.visible = !this.bg0.visible;
//                 if (value.data.isBuff > 0) {
//                     this.txtProgress.x = 33;
//                     this.txtProgress.y = 42;
//                 } else {
//                     this.txtProgress.x = 30;
//                     this.txtProgress.y = 39;
//                 }
//                 if (value.config.orderReword.length == 1) {
//                     this.cost0.y = 210;
//                     this.cost1.visible = false;
//                     this.txtCost0.text = value.config.orderReword[0].v2 + "";
//                     this.mcBackIcon_0.skin = clientCore.ItemsInfo.getItemIconUrl(value.config.orderReword[0].v1);
//                 } else {
//                     this.cost0.y = 197;
//                     this.cost1.visible = true;
//                     this.txtCost0.text = value.config.orderReword[0].v2 + "";
//                     this.txtCost1.text = value.config.orderReword[1].v2 + "";
//                     this.mcBackIcon_0.skin = clientCore.ItemsInfo.getItemIconUrl(value.config.orderReword[0].v1);
//                     this.mcBackIcon_1.skin = clientCore.ItemsInfo.getItemIconUrl(value.config.orderReword[1].v1);
//                 }
//                 let itemNum: number = clientCore.MaterialBagManager.getItemNum(value.config.orderContents.v1);
//                 let needNum: number = value.config.orderContents.v2;
//                 let str0: string;
//                 if (itemNum >= needNum) {
//                     str0 = this.str0.replace("{0}", "08E203").replace("{1}", needNum + "");
//                     this.btnSell1.visible = true;
//                     this.btnSell0.visible = false;
//                 } else {
//                     str0 = this.str0.replace("{0}", "E20303").replace("{1}", itemNum + "");
//                     this.btnSell1.visible = false;
//                     this.btnSell0.visible = true;
//                 }
//                 this.imgDouble.visible = value.data.isBuff > 0;
//                 let str1: string = this.str1.replace("{0}", value.config.orderContents.v2 + "");
//                 this.txtProgress.innerHTML = str0 + str1;
//             }
//         }

//         public get orderId(): number {
//             return this._itemInfo.config.id;
//         }

//         public refreshTime(nowTime: number): boolean {
//             if (this._itemInfo) {
//                 let dtime: number = Math.max(this._itemInfo.overtime - nowTime, 0);
//                 this.changeCountDown(dtime);
//                 if (dtime <= 0) return true;
//             }
//             return false;
//         }

//         private changeCountDown(time: number) {
//             let str: string = "";
//             let hour: number = Math.floor(time / 3600);
//             time -= 3600 * hour;
//             let minute: number = Math.floor(time / 60);
//             time -= 60 * minute;
//             if (hour > 0) {
//                 str += hour > 9 ? hour : "0" + hour;
//                 str += ":";
//             }
//             str += minute > 9 ? minute : "0" + minute;
//             str += ":";
//             str += time > 9 ? time : "0" + time;
//             this.txtCountdown.text = "剩余时间：" + str;
//         }

//         private onComplete() {
//             this._itemIcon.x = ((170 - this._itemIcon.width * .7) >> 1) + 46;
//             this._itemIcon.y = ((170 - this._itemIcon.height * .7) >> 1) + 29;
//         }

//         public destroy() {
//             Laya.timer.clear(this, this.refreshTime);
//         }
//     }
// }