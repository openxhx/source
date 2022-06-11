namespace library {
    /**
     * 规则
     */
    export class RulePanel extends ui.library.panel.RulePanelUI {

        public sideClose = false;

        constructor() { super(); }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        show(): void {
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}