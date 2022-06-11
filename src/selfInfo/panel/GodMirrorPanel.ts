namespace selfInfo {
    export class GodMirrorPanel extends ui.selfInfo.panel.GodMirrorPanelUI {
        private _infoArr: pb.IMirrorRankInfo[];
        show(infoArr: pb.IMirrorRankInfo[]) {
            this._infoArr = infoArr;
            for (let i = 0; i < 2; i++) {
                this['img_' + i].skin = clientCore.LocalInfo.sex == 1 ? 'selfInfo/godMirrorFemale.png' : 'selfInfo/godMirrorMale.png';
                this['txt_' + i].text = '热度:' + infoArr[i].hot;
            }
            clientCore.DialogMgr.ins.open(this);
        }

        private onBtnClick(idx: number) {
            let info = this._infoArr[idx];
            clientCore.ModuleManager.open('godMirror.GodMirrorInfoModule', info.userid + '_' + info.type);
        }

        addEventListeners() {
            for (let i = 0; i < 2; i++) {
                BC.addEvent(this, this['btn_' + i], Laya.Event.CLICK, this, this.onBtnClick, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}