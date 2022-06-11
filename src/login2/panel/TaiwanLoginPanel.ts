namespace login2.panel {
    /**
     * 台湾版登录
     */
    export class TaiwanLoginPanel extends ui.login2.panel.TaiwanLoginUI {
        constructor() { super(); }

        show(): void {
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnGoogle, Laya.Event.CLICK, this, this.onClick, [1]);
            BC.addEvent(this, this.btnFacebook, Laya.Event.CLICK, this, this.onClick, [2]);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onClick(type: number): void {
            EventManager.event(globalEvent.TAIWAN_LOGIN, type);
        }
    }
}