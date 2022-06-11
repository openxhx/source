namespace alert {
    export class AlertBuyTimesPanel extends ui.alert.panel.AlertBuyTimesPanelUI {
        private _okHanlder: Laya.Handler;

        show(obj: { nowTime: number, maxTime: number, coinNum: number, coinId: number, buyNum: number, buyId: number, sureHanlder: Laya.Handler, noIcon?: string }) {
            this.txtTimes.text = obj.nowTime + '/' + obj.maxTime;
            if (obj.noIcon) {
                this.boxHaveIcon.visible = false;
                this.labNoIcon.text = obj.noIcon;
            } else {
                this.boxHaveIcon.visible = true;
                this.labNoIcon.text = "";
                this.txtCost.text = obj.coinNum.toString();
                this.txtBuyNum.text = obj.buyNum.toString();
                this.imgNeedIcon.skin = clientCore.ItemsInfo.getItemIconUrl(obj.coinId);
                this.imgBuyIcon.skin = clientCore.ItemsInfo.getItemIconUrl(obj.buyId);
            }
            this._okHanlder = obj.sureHanlder;
            clientCore.DialogMgr.ins.open(this);
        }

        private onSure() {
            this._okHanlder?.run();
            this.onClose();
        }

        onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._okHanlder = null;
        }
    }
}