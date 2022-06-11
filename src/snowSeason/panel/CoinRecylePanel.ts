namespace snowSeason {
    export class CoinRecylePanel extends ui.snowSeason.panel.CoinRecylePanelUI {
        constructor() {
            super();
            this.sideClose = false;
        }

        public setData(index:number) {
        }

        onClose() {
            BC.removeEvent(this);
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.okBtn, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }

    }