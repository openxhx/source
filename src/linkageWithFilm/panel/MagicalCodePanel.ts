namespace linkageWithFilm {
    /**
     * 神奇密码
     */
    export class MagicalCodePanel extends ui.linkageWithFilm.panel.MagicalCodePanelUI {
        private _codeData: xls.commonPassWord[];
        constructor() {
            super();
            this.txtCode.restrict = "0-9a-zA-Z";
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closePanel);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.txtCode, Laya.Event.MOUSE_DOWN, this, this.focusOn);
        }
        private focusOn() {
            this.txtCode.focus;
            if (this.txtCode.text == "点击输入兑换码领取奖励")
                this.txtCode.text = "";
        }
        private getReward() {
            let code = this.txtCode.text;
            let index = _.findIndex(this._codeData, (o) => { return o.passWord == code });
            net.sendAndWait(new pb.cs_exchange_magic_passwd({ passwd: this.txtCode.text })).then((data: pb.sc_exchange_magic_passwd) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewards));
            });
        }

        private closePanel() {
            clientCore.DialogMgr.ins.close(this);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}