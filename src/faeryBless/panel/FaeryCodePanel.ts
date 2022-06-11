namespace faeryBless {
    /**
     * 页游联动神奇密码
     */
    export class FaeryCodePanel extends ui.faeryBless.panel.MagicCodePanelUI {
        constructor() {
            super();
            this.labInput.restrict = "0-9a-zA-Z";
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closePanel);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.getReward);
        }

        private getReward() {
            let code = this.labInput.text;
            net.sendAndWait(new pb.cs_exchange_magic_passwd({ passwd: code })).then((data: pb.sc_exchange_magic_passwd) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewards));
            });
        }

        private closePanel() {
            this.labInput.text = "";
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}