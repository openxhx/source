namespace market {

    export class TipPanel extends ui.market.panel.TipPanelUI {
        constructor() {
            super();
            this.html.style.leading = 5;
            this.html.style.width = 365;
            this.html.style.height = 130;
            this.html.style.width = 365;
            this.html1.style.width = 421;
            this.html2.style.width = 556;
            this.html3.style.width = 366;
        }

        show(): void {
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }
    }
}