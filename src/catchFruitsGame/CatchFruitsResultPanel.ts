namespace catchFruitsGame {
    export class CatchFruitsResultPanel extends ui.catchDrop.CatchDropResultPanelUI {
        private _blurBg: Laya.Sprite;
        private _blackBg: Laya.Sprite;

        constructor() {
            super();
            this._blurBg = clientCore.LayerManager.createScreenShot();
            this._blackBg = util.DisplayUtil.createMask();
            this._blackBg.x = this._blurBg.x = -clientCore.LayerManager.mainLayer.x;
            this.addChildAt(this._blackBg, 0);
            this.addChildAt(this._blurBg, 0);
            BC.addEvent(this, this._blackBg, Laya.Event.CLICK, this, this.onBack);
        }

        show(score: number) {
            clientCore.DialogMgr.ins.open(this);
            if (clientCore.FlowerPetInfo.petType > 0) {
                score += Math.ceil(score / 2);
            }
            this.txtScore.text = score.toString();
            this.item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(9900027);
            this.item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(9900027);
            this.item.num.value = score.toString();
            let npcId = 1410003;
            this.imgRole.skin = pathConfig.getRoleUI(npcId);
            let scale = xls.get(xls.characterId).get(npcId).showNpc;
            this.imgRole.scaleX = scale ? -this.imgRole.scaleY : this.imgRole.scaleY;
            this.txtName.text = xls.get(xls.characterId).get(npcId).name;
            this.txtTalk.text = _.find(xls.get(xls.characterVoice).getValues(), (o) => { return o.characterId == npcId && o.oggId == 'battleWin' })?.voiceText ?? '';
            this.imgVip.visible = clientCore.FlowerPetInfo.petType > 0;
        }

        private onBack() {
            clientCore.ToolTip.gotoMod(172);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }


    }
}