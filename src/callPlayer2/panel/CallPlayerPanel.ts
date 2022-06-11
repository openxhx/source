namespace callPlayer2 {
    export class CallPlayerPanel extends ui.callPlayer2.panel.CallPlayerPanelUI {
        private _model: CallPlayer2Model;
        constructor(sign: number) {
            super();
            this.sideClose = true;
            this.labInput.restrict = "0-9";
            this._model = clientCore.CManager.getModel(sign) as CallPlayer2Model;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        /**提交密码 */
        private submitCode() {
            net.sendAndWait(new pb.cs_watch_and_pick_up_the_light_two_write_uid({ uid: Number(this.labInput.text) })).then(() => {
                this._model.haveInvite = true;
                EventManager.event("ID_WRITE_BACK");
                this.onClose();
                alert.showSmall("邀请人填写成功！");
            });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.submitCode);
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