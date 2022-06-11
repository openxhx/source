namespace moneyShop {
    export class DawnTipsPanel extends ui.moneyShop.panel.DawnTipsPanelUI {
        private _moneyIds: number[];
        show() {
            this._moneyIds = _.compact(clientCore.UIManager.commonMoney.listMoney.dataSource.slice());
            clientCore.DialogMgr.ins.open(this);
            clientCore.UIManager.setMoneyIds([1540001].concat(this._moneyIds));
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
            clientCore.UIManager.setMoneyIds(this._moneyIds);
        }

        private onGo1() {
            let quickInfo = new alert.QuickBuyInfo(9900068);
            quickInfo.maxCanBuyNum = 1;
            alert.alertQuickBuy(9900068, 1, false);
        }

        private onGo2() {
            clientCore.ToolTip.gotoMod(52)
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnGo1, Laya.Event.CLICK, this, this.onGo1);
            BC.addEvent(this, this.btnGo2, Laya.Event.CLICK, this, this.onClose);
        }


        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}