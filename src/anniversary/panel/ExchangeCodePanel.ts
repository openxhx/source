namespace anniversary {
    export class ExchangeCodePanel extends ui.anniversary.panel.ExchangeCodePanelUI {
        constructor() {
            super();
            this.sideClose = true;
            this.labCode.restrict = "0-9a-zA-Z";
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        /**提交密码 */
        private submitCode() {
            net.sendAndWait(new pb.cs_exchange_magic_passwd({ passwd: this.labCode.text })).then((data: pb.sc_exchange_magic_passwd) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewards));
            });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.submitCode);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.labCode.text = "";
            super.destroy();
        }
    }
}