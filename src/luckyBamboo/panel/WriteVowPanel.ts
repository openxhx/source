namespace luckyBamboo {
    export class WriteVowPanel extends ui.luckyBamboo.panel.WriteVowPanelUI {
        constructor() {
            super();
            this.sideClose = true;
            this.labInput.maxChars = 30;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        /**确认内容 */
        private sureContent() {
            EventManager.event("VOW_WRITE_BACK", this.labInput.text);
            this.onClose();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureContent);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.labInput.text = "";
            super.destroy();
        }
    }
}