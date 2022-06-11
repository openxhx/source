namespace lostDream {
    /**
     * 挑战熊
     */
    export class GamePanel extends ui.lostDream.panel.GamePanelUI {

        private cnt: number; //挑战次数（花宝+1）
        private _model: LostDreamModel;

        constructor() { super(); }

        show(sign: number): void {
            clientCore.DialogMgr.ins.open(this);
            this._model = clientCore.CManager.getModel(sign) as LostDreamModel;
            let isPet: boolean = false;
            this.cnt = 3;
            this.txCnt.changeText(`挑战次数：${this._model.gameCnt}/${this.cnt}${isPet ? '(+1)' : ''}`)
            this.imgPet.visible = false;
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.gameBtn, Laya.Event.CLICK, this, this.onGame);
            BC.addEvent(this, this.imgPet, Laya.Event.CLICK, this, this.onPet);
            BC.addEvent(this, this.quaBtn, Laya.Event.CLICK, this, this.onRule);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._model = null;
            super.destroy();
        }
        private onGame(): void {
            if (this._model.gameCnt <= 0) {
                alert.showFWords('今日挑战已达上限~');
                return;
            }
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('linkGame.LinkGame515CopyModule', { modelType: "activity", openType: "lostDream", stageId: 60104, gameId: 3399999 }, { openWhenClose: "lostDream.LostDreamModule" });
        }
        private onPet(): void {
            if (this.imgPet.gray) {
                clientCore.DialogMgr.ins.close(this, false);
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open('flowerPet.FlowerPetModule');
            }
        }
        private onRule(): void {
            alert.showRuleByID(1006);
        }
    }
}