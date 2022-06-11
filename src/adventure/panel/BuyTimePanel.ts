namespace adventure {
    export class BuyTimePanel extends ui.adventure.panel.BuyTimesPanelUI {
        constructor() {
            super()
            this.sideClose = true;
        }

        /**
         * @param type 1活动  2秘闻录
         */
        show(type: number) {
            this.updateView();
        }

        private updateView() {
            let info = clientCore.AdventureManager.instance.getMwlCntInfo();
            this.txtCost.text = info.buyPrice.toString();
            let totalBuyTime = info.canBuyTime;
            this.txtTimes.text = `${info.buyTime}/${totalBuyTime}`;
            let leafNum = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
            this.btnSure.disabled = leafNum < info.buyPrice || info.buyTime >= totalBuyTime;
        }

        private async onSure() {
            await clientCore.AdventureManager.instance.buyMwlTimes();
            this.event(Laya.Event.CHANGED);
            this.updateView();
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