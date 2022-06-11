namespace spirittree {
    export class SpirittreeInfoPanel extends ui.spirittree.panel.infoPanelUI {

        constructor() {
            super();
            this.sideClose = true;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        public addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        public removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}