namespace playground {
    export class PreviewPanel extends ui.playground.panel.PreviewPanelUI {
        private _control: PlaygroundControl;
        private _rewardCnt: number;
        constructor() {
            super();
            let isMale: boolean = clientCore.LocalInfo.sex != 1;
            for (let i: number = 1; i <= 2; i++) {
                this['man_' + i].visible = isMale;
                this['woman_' + i].visible = !isMale;
                this['face_' + i].visible = clientCore.LocalInfo.sex == i;
            }
            this.imgShow.visible = false;
        }
        show(sign: number): void {
            this._rewardCnt = xls.get(xls.gardenCommonData).get(1).clothNumber;
            this._control = clientCore.CManager.getControl(sign) as PlaygroundControl;
            this.updateReward();
            for (let i: number = 1; i <= 2; i++) {
                let cloth: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(PlaygroundConst['CLOTH_' + i]);
                this['txCnt_' + i].changeText('已获得：' + cloth.hasCnt + "/" + cloth.clothes.length);
            }
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.box, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTry, [2]);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private onTry(index: number): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", PlaygroundConst['CLOTH_' + index]);
        }
        private onReward(): void {
            this._control.getCloth(new Laya.Handler(this, () => {
                this.updateReward();
                let cloth: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(PlaygroundConst.CLOTH_2);
                this.txCnt_2.changeText('已获得：' + cloth.hasCnt + "/" + cloth.clothes.length);
            }));
        }
        private updateReward(): void {
            let freeReward = clientCore.LocalInfo.sex == 1 ? xls.get(xls.gardenCommonData).get(1).freeClothFemale[0] : xls.get(xls.gardenCommonData).get(1).freeClothMale[0];
            let isGet: boolean = clientCore.ItemsInfo.checkHaveItem(freeReward);
            let info: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(PlaygroundConst.CLOTH_2);
            this.btnReward.disabled = info.hasCnt != this._rewardCnt || isGet;
            this.r_tip.visible = !this.btnReward.disabled;
            this.proTxt.changeText(info.hasCnt + "/" + Math.max(this._rewardCnt, info.hasCnt));
            this.descTxt.changeText(info.hasCnt < this._rewardCnt ? '集齐奖励' : isGet ? '已领取' : '领取');
        }
    }
}