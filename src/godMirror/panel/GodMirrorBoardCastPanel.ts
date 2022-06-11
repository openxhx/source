namespace godMirror {
    const TIME = [30, 60, 300, 1800, 3600];
    export class GodMirrorBoardCastPanel extends ui.godMirror.panel.GodMirrorBoardCastPanelUI {

        private _selectidx: number = 0;
        private _type: number;
        show(type: number) {
            this._type = type;
            this._selectidx = 0;
            this.txtNum.text = '1';
            this.updateView();
            clientCore.DialogMgr.ins.open(this);
        }

        onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private updateView() {
            let single = xls.get(xls.godMirror).get(1).regularPublic[0];
            let num = parseInt(this.txtNum.text);
            this.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(single.v1);
            this.txtNeed.text = '共需要' + num * single.v2;
            for (let i = 0; i < 5; i++) {
                this['img_' + i].skin = i == this._selectidx ? 'godMirror/tuo_yuan_1.png' : 'godMirror/tuo_yuan_1_fu_ben_2.png';
            }
        }

        private onChange(diff: number) {
            let num = parseInt(this.txtNum.text);
            this.txtNum.text = Math.max(0, diff + num).toString();
            this.updateView();
        }

        private onSure() {
            let single = xls.get(xls.godMirror).get(1).regularPublic[0];
            let needNum = parseInt(this.txtNum.text) * single.v2
            let needId = single.v1;
            let needName = clientCore.ItemsInfo.getItemName(needId);
            let enough = clientCore.ItemsInfo.getItemNum(single.v1);
            if (enough) {
                alert.showSmall(`确定要花费${needNum}个${needName}进行${this.txtNum.text}次宣传吗？`, { callBack: { caller: this, funArr: [this.sure] } })
            }
            else {
                if (needId == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, this.sure));
                }
                else if (needId == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall('灵豆不足，是否补充?', { callBack: { caller: this, funArr: [this.gotoMoney] } })
                }
                else {
                    alert.showFWords(`${needName}不足`);
                }
            }
        }

        private sure() {
            net.sendAndWait(new pb.cs_flora_of_mirror_add_pub({
                imageInfo: clientCore.LocalInfo.uid + '_' + this._type,
                times: parseInt(this.txtNum.text),
                limitTime: TIME[this._selectidx]
            })).then((data: pb.sc_flora_of_mirror_add_pub) => {
                this.onClose();
                alert.showFWords('宣传成功');
            })
        }

        private gotoMoney() {
            clientCore.ToolTip.gotoMod(50);
        }

        private onSelect(idx: number) {
            this._selectidx = idx;
            this.updateView();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onChange, [1]);
            BC.addEvent(this, this.btnSub, Laya.Event.CLICK, this, this.onChange, [-1]);
            for (let i = 0; i < 5; i++) {
                BC.addEvent(this, this['img_' + i], Laya.Event.CLICK, this, this.onSelect, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}