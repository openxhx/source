namespace market {
    export class ShowPanel extends ui.market.panel.ShowPanelUI {
        sideClose: boolean = true;
        constructor() { super(); }
        show(): void {
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
    }
}