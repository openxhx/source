namespace cp {
    export class CpDivorceAlert extends ui.cp.panel.DivorceAlertPanelUI {

        constructor() {
            super();
            this.txtHtml1.style.width = this.txtHtml2.style.width = 530;
        }
        show(info: pb.ICpInfo) {
            this.txtNick.text = info.userBase.nick;
            clientCore.DialogMgr.ins.open(this);
        }

        onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private sureDivorce() {
            clientCore.CpManager.instance.replyDivorce(1).then(() => {
                this.onClose();
            })
        }

        private refuseDivorce() {
            clientCore.CpManager.instance.replyDivorce(2).then(() => {
                this.onClose();
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureDivorce);
            BC.addEvent(this, this.btnNo, Laya.Event.CLICK, this, this.refuseDivorce);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}