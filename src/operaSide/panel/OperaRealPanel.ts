namespace operaSide {
    export class OperaRealPanel extends ui.operaSide.panel.OperaRealPanelUI {
        private _canReal: boolean = true;;
        constructor() {
            super();
            this.txtHtml.style.width = 693;
            this.txtHtml.style.font = '汉仪中圆简';
            this.txtHtml.style.fontSize = 20;
            this.txtHtml.innerHTML = util.StringUtils.getColorText3('* 实体套装将参考绮丽神祇套装{(只限女性)}，与虚拟套装可能会有差别以实际为准，我们将身高体重信息提供给制作方后开始制作，{预计制作周期为2个月}<br>* (奖励无法邮寄至港澳台及海外地区)', '#e2c2ac', '#dad223');
            this.txtPhone.restrict = this.txtHeight.restrict = this.txtWeight.restrict = '0-9';
        }

        show(canReal: boolean) {
            this._canReal = canReal;
            this.boxAds.visible = true;
            this.boxInput.visible = false;
            let info = clientCore.OperaSideManager.instance.realNameInfo;
            if (info) {
                this.txtAdress.text = info?.address ? info.address : '';
                this.txtName.text = info?.name ? info.name : '';
                this.txtPhone.text = info?.phone ? info.phone : '';
                this.txtHeight.text = info?.height ? info.height : '';
                this.txtWeight.text = info?.weight ? info.weight : '';
            }
            clientCore.DialogMgr.ins.open(this);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onSure() {
            if (!clientCore.OperaManager.isFinalFightEnd) {
                alert.showFWords('榜单结算后才可以提交');
                return
            }
            if (this.txtPhone.text.length != 11) {
                alert.showFWords('请填写11位手机号')
                return;
            }
            clientCore.OperaSideManager.instance.setRealNameInfo(this.txtName.text, this.txtAdress.text, this.txtPhone.text, this.txtHeight.text, this.txtWeight.text).then(() => {
                this.onClose();
            })
        }

        private onChangeInput() {
            if (!this._canReal) {
                alert.showFWords('不符合获奖条件');
            }
            else {
                this.boxInput.visible = true;
                this.boxAds.visible = false;
            }
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.onChangeInput);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}