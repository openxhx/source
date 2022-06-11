namespace yearSong {
    export class CoinRecylePanel extends ui.yearSong.panel.CoinRecylePanelUI {
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
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.okBtn, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }

    }