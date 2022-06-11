namespace elfEnergy {
    export class ElfDetailPanel extends ui.elfEnergy.panel.EnergyDetailPanelUI {
        constructor() {
            super();
            this.sideClose = true;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}