namespace godMirror {
    export class GodMirrorSupportPanel extends ui.godMirror.panel.GodMirrorSupportPanelUI {
        private _num: number;
        private _singlePrice: number;
        private _singleId: number;
        private _maxNum: number;
        show() {
            this._num = 1;
            this.txtBuyNum.restrict = '0-9'
            clientCore.DialogMgr.ins.open(this);
            this._singleId = xls.get(xls.godMirror).get(1).redPrice.v1;
            this._singlePrice = xls.get(xls.godMirror).get(1).redPrice.v2;
            this.txtSinglePrice.text = this._singlePrice.toString();
            this.mcTokenImg1.skin = this.mcTokenImg2.skin = clientCore.ItemsInfo.getItemIconUrl(this._singleId);
            this.updateNum();
        }

        private onChange(diff: number) {
            this._num = Math.max(0, this._num + diff);
            this.updateNum();
        }

        private updateNum() {
            let myCoinNum = clientCore.ItemsInfo.getItemNum(this._singleId);
            this._maxNum = Math.floor(myCoinNum / this._singlePrice);
            this._num = _.clamp(this._num, 1, this._maxNum);
            this.txtBuyNum.text = this._num.toString();
            this.txtTotalPrice.text = (this._num * this._singlePrice).toString();
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
            this.event(Laya.Event.END);
        }

        private onSure() {
            let have = clientCore.ItemsInfo.getItemNum(this._singleId);
            let need = parseInt(this.txtTotalPrice.text);
            if (have < need) {
                alert.showSmall('灵豆不足,是否前往补充?', { callBack: { caller: this, funArr: [this.goMoney] } })
                return;
            }
            alert.showSmall(`确定要花费${need}个${clientCore.ItemsInfo.getItemName(this._singleId)}进行${this._num}次宣传吗？`, {
                callBack: {
                    caller: this, funArr: [this.sure]
                }
            });
        }

        private goMoney() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ToolTip.gotoMod(50);
        }

        private sure() {
            this.event(Laya.Event.COMPLETE, this._num);
            clientCore.DialogMgr.ins.close(this);
        }

        private onChanged() {
            if (this.txtBuyNum.text == '')
                this.txtBuyNum.text = '0'
            let input = parseInt(this.txtBuyNum.text);
            this._num = _.clamp(input, 1, this._maxNum);
            this.updateNum();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.mcAdd, Laya.Event.CLICK, this, this.onChange, [1]);
            BC.addEvent(this, this.mcReduce, Laya.Event.CLICK, this, this.onChange, [-1]);
            BC.addEvent(this, this.txtBuyNum, Laya.Event.INPUT, this, this.onChanged);
            BC.addEvent(this, this.mcMax, Laya.Event.CLICK, this, this.onChange, [99999999]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}