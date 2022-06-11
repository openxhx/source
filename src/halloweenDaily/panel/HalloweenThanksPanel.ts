namespace halloweenDaily {
    export class HalloweenThanksPanel extends ui.halloweenDaily.HalloweenThanksPanelUI {
        constructor() {
            super();
            this.sideClose = false;
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
        }

        closeAll() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
        }

        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.closeAll);
        }

        removeEventListeners() {
            BC.removeEvent(this, this, Laya.Event.CLICK, this, this.closeAll);
        }
    }
}