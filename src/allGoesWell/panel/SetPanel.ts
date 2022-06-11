namespace allGoesWell {
    export class SetPanel extends ui.allGoesWell.panel.SetTangyuanPanelUI {
        private setArr: number[];
        private curNum: number[];
        private curSetIndex: number;
        constructor() {
            super();
            this.sideClose = true;
        }

        init() {
            this.setArr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.curNum = [0, 0, 0];
            this.curSetIndex = 0;
            for (let i = 1; i <= 9; i++) {
                this.setWanSkin(i);
            }
        }

        show() {
            this.init();
            this.setTangyuanNum();
            clientCore.Logger.sendLog('2022年2月11日活动','【主活动】顺心如意·元宵','打开制作食盒面板');
            clientCore.DialogMgr.ins.open(this);
        }

        private setTangyuanNum() {
            this.labCnt1.text = "" + clientCore.ItemsInfo.getItemNum(9900303);
            this.labCnt2.text = "" + clientCore.ItemsInfo.getItemNum(9900304);
            this.labCnt3.text = "" + clientCore.ItemsInfo.getItemNum(9900305);
        }

        private setTangyuan(type: number) {
            if (this.curSetIndex >= 9) {
                alert.showFWords("食盒已放满~");
                return;
            }
            if (this.curNum[type - 1] >= 3) {
                alert.showFWords("该类元宵已放满3个~");
                return;
            }
            let num = parseInt(this["labCnt" + type].text);
            if (num <= 0) {
                alert.showFWords("存货不足，请先制作~");
                return;
            }
            this.setArr[this.curSetIndex] = type;
            this.curSetIndex++;
            this.curNum[type - 1]++;
            this.setWanSkin(this.curSetIndex);
            this.onNumberChange(type, -1);
        }

        private cancelSet() {
            if (this.curSetIndex <= 0) {
                alert.showFWords("礼盒已清空~");
                return;
            }
            this.curSetIndex--;
            let type = this.setArr[this.curSetIndex];
            this.setArr[this.curSetIndex] = 0;
            this.curNum[type - 1]--;
            this.setWanSkin(this.curSetIndex + 1);
            this.onNumberChange(type, 1);
        }

        private async sureSet() {
            if (this.curSetIndex < 9) {
                alert.showFWords("礼盒还未填满~");
                return;
            }
            this.mouseEnabled = false;
            let control = clientCore.CManager.getControl(this.sign) as AllGoesWellControl;
            await control.setTangyuan(this.setArr);
            this.mouseEnabled = true;
            this.onCloseClick();
            clientCore.DialogMgr.ins.open(new SetTipPanel());
        }

        private onNumberChange(index: number, flag: number) {
            let curNum = parseInt(this["labCnt" + index].text);
            this["labCnt" + index].text = (curNum + flag).toString();
        }

        private setWanSkin(index: number) {
            let type = this.setArr[index - 1];
            this["wan" + index].skin = `allGoesWell/wan_${type}.png`;
            if (index <= 3) this["wan" + index].height = type == 0 ? 104 : 109;
            else if (index <= 6) this["wan" + index].height = type == 0 ? 110 : 115;
            else this["wan" + index].height = type == 0 ? 115 : 132;
        }

        onCloseClick() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnSet1, Laya.Event.CLICK, this, this.setTangyuan, [1]);
            BC.addEvent(this, this.btnSet2, Laya.Event.CLICK, this, this.setTangyuan, [2]);
            BC.addEvent(this, this.btnSet3, Laya.Event.CLICK, this, this.setTangyuan, [3]);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.cancelSet);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureSet);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        clean() {
            this.setArr = null;
            this.curNum = null;
            this.destroy();
        }
    }
}