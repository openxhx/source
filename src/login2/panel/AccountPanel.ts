

namespace login2.panel {
    /**
     * 账号展示
     */
    export class AccountPanel extends ui.login2.panel.AccountUI {

        public sideClose = false;

        constructor() { super(); }

        public show(accountId: number, passWd: string): void {
            clientCore.DialogMgr.ins.open(this);
            this.txAccount.changeText(accountId + "");
            this.txPasswd.changeText(passWd);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnLogin, Laya.Event.CLICK, this, this.hide);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}