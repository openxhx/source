namespace adventureAct {
    import AdventureActManager = clientCore.AdventureActManager;
    export class BuyTimePanel extends ui.adventureAct.panel.BuyTimesPanelUI {
        private _isMoney: boolean
        constructor() {
            super()
            this.sideClose = true;
        }

        show(isMoney: boolean = false) {
            this._isMoney = isMoney
            this.updateView();
        }

        private updateView() {
            let info = this._isMoney ? AdventureActManager.instance.getMoneyCntInfo() : AdventureActManager.instance.getCntInfo();
            this.txtCost.text = info.buyPrice.toString();
            let totalBuyTime = info.canBuyTime;
            this.txtTimes.text = `${info.buyTime}/${totalBuyTime}`;
            let leafNum = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
            this.btnSure.disabled = leafNum < info.buyPrice || info.buyTime >= totalBuyTime;
        }

        private async onSure() {
            if (this._isMoney)
                await AdventureActManager.instance.buyMoneyTimes();
            else
                await AdventureActManager.instance.buyTimes();
            this.updateView();
            this.event(Laya.Event.CHANGED);
        }

        private onCancle() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.onCancle);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}