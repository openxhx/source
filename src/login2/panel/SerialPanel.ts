namespace login2.panel {
    /**
     * 验证码
     */
    export class SerialPanel extends ui.login2.panel.SerialUI {

        private _suc: Function; //验证成功

        public sideClose = false;

        constructor() { super(); }

        public show(suc): void {
            clientCore.DialogMgr.ins.open(this);
            this._suc = suc;
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        public destroy(): void {
            super.destroy();
            this._suc = null;
        }

        /** 检测验证码*/
        private onSure(): void {
            net.sendAndWait(new pb.cs_user_use_invitation_code({ code: this.input.text })).then((msg: pb.sc_user_use_invitation_code) => {
                this._suc();
                this.hide();
            });
        }
    }
}