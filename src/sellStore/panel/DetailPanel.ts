namespace sellStore {
    export class DetailPanel implements ISellStorePanel {
        private _mainUI: ui.sellStore.panel.DetailPanelUI;
        private _parent: SellStoreModule;
        private _suitId: number = -1;
        private _suitHaveFlag: boolean = false;
        init(parent: SellStoreModule) {
            this._mainUI = new ui.sellStore.panel.DetailPanelUI();
            this._parent = parent;
            this._parent.addChild(this._mainUI);
            this._mainUI.btnClose.on(Laya.Event.CLICK, this, this.onClose);
            this._mainUI.list.vScrollBarSkin = '';
            this._mainUI.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this._mainUI.btnBuy.on(Laya.Event.CLICK, this, this.onBuy);
            EventManager.on(SellStoreEvent.EV_NEED_REFRESH_LIST, this, this.suitBuySucc);
        }
        private suitBuySucc(e: Laya.Event) {
            this.showClothHaveState();
            this._mainUI.list.refresh();
        }

        private onListRender(cell: Laya.Box, idx: number) {
            let id = cell.dataSource as number;
            cell.getChildByName('boxImg').getChildAt(0)['skin'] = clientCore.ItemsInfo.getItemIconUrl(id);
            cell.getChildByName('txtType')['text'] = SellStoreModel.instance.xlsCloth.get(id).name;
            cell.getChildByName("mcHave")["visible"] = this._suitHaveFlag;
        }

        private onBuy() {
            SellStoreModel.instance.buySelectSuit(this._suitId);
        }

        show(d: any) {
            this._parent.addChild(this._mainUI);
            if (this._suitId != SellStoreModel.instance.selectSuit) {
                this._suitId = SellStoreModel.instance.selectSuit;
                let storeInfo = SellStoreModel.instance.getStoreInfoByClothId([this._suitId])[0];
                let suitInfo = clientCore.SuitsInfo.getSuitInfo(this._suitId);
                this._mainUI.txtDes.text = suitInfo.suitInfo.describe;

                let final1 = 0;
                let final2 = 0;
                let price = SellStoreModel.instance.calcuFinalPriceById(this._suitId);
                final1 += price[0].v2;
                if (price.length > 1)
                    final2 += price[1].v2;
                this._mainUI.txtCoin1.text = final1.toString();
                this._mainUI.txtCoin2.text = final2.toString();

                this.showClothHaveState();
                this._mainUI.list.dataSource = suitInfo.clothes;
            }
        }
        private showClothHaveState() {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this._suitId);
            if (suitInfo.allGet) {
                this._mainUI.mcSuitBuyCon.visible = false;
                this._mainUI.mcSuitHaveState.visible = true;
                this._suitHaveFlag = true;
            }
            else {
                this._mainUI.mcSuitBuyCon.visible = true;
                this._mainUI.mcSuitHaveState.visible = false;
            }
        }
        hide() {
            this._parent.removeChild(this._mainUI);
        }

        private onClose() {
            EventManager.event(SellStoreEvent.EV_DETAIL_PANEL, false);
        }

        destory() {
            this._mainUI.btnBuy.off(Laya.Event.CLICK, this, this.onBuy);
        }
    }
}