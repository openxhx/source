namespace samsungShop{
    /**
     * 购买
     */
    export class BuyPanel extends ui.samsungShop.BuyPanelUI{
        private _handler: Laya.Handler;
        constructor(){ super(); }

        show(data: ShopData, handler: Laya.Handler): void{
            this._handler = handler;
            this.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(data.xlsData.itemId);
            this.imgCost1.skin = this.imgCost2.skin = clientCore.ItemsInfo.getItemIconUrl(data.xlsData.cost.v1);
            this.txName.changeText(data.xlsData.name);
            this.txLast.changeText(data.xlsData.cost.v2 + '');
            this.txNow.changeText(Math.floor(data.xlsData.cost.v2 * 1.2) + '');
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._handler = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        onSure(): void{
            this._handler?.run();
            this.hide();
        }
    }
}