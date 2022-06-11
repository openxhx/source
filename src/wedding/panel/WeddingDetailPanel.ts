namespace wedding {
    export class WeddingDetailPanel extends ui.wedding.panel.WeddingDetailPanelUI {
        show() {
            clientCore.DialogMgr.ins.open(this);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}