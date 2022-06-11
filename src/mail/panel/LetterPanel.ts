namespace mail.panel {
    /**
     * 邀请函删除
     */
    export class LetterPanel extends ui.mail.panel.LetterPanelUI {

        /** 确认删除*/
        private _handler: Laya.Handler;

        constructor() { super(); }

        show(handler: Laya.Handler): void {
            this._handler = handler;
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void {
            this._handler && this._handler.recover();
            this._handler = null;
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onSure(): void {
            this._handler && this._handler.run();
            this.hide();
        }
    }
}