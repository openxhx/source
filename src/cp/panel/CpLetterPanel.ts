namespace cp {
    export class CpLetterPanel extends ui.cp.panel.LetterPanelUI {
        private _type: 'apply' | 'notice';

        show(type: 'apply' | 'notice', senderNick: string, ringId: number) {
            this._type = type;
            clientCore.DialogMgr.ins.open(this);
            this.btnSend.visible = type == 'apply';
            this.btnNo.visible = this.btnOk.visible = type == 'notice';
            this.imgLetter.skin = pathConfig.getCpLetterImg(ringId);
            this.imgSender.visible = this.txtReciver.visible = this.txtSender.visible = type == 'notice';
            this.txtContent.text = xls.get(xls.cpRing).get(ringId)?.content ?? '';
            if (type == 'notice') {
                this.txtReciver.text = clientCore.LocalInfo.userInfo.nick + ':';
                this.txtSender.text = 'by.' + senderNick;
            }
        }


        private onSend() {
            this.event(Laya.Event.START);
            clientCore.DialogMgr.ins.close(this);
        }

        private onOk() {
            this.event(Laya.Event.START);
            clientCore.DialogMgr.ins.close(this);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
            if (this._type == 'apply') {
                this.event(Laya.Event.END);
            }
        }

        private onNo() {
            clientCore.DialogMgr.ins.close(this);
            this.event(Laya.Event.END);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.onSend);
            BC.addEvent(this, this.btnOk, Laya.Event.CLICK, this, this.onOk);
            BC.addEvent(this, this.btnNo, Laya.Event.CLICK, this, this.onNo);
        }
    }
}