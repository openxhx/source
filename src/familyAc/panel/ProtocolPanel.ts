namespace familyAc.panel {
    /**
     * 创建家族协议书
     */
    export class ProtocolPanel extends ui.familyAc.panel.ProtocolPanelUI implements clientCore.IDialog {

        private _agreeHandler: Laya.Handler;

        constructor() { super(); }

        show(handler: Laya.Handler): void {
            clientCore.DialogMgr.ins.open(this);
            this._agreeHandler = handler;
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        init(): void {
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnAgree, Laya.Event.CLICK, this, this.onAgree);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._agreeHandler && this._agreeHandler.recover();
            this._agreeHandler = null;
            super.destroy();
        }

        private onAgree(): void {
            this._agreeHandler && this._agreeHandler.run();
            this.hide();
        }
    }
}