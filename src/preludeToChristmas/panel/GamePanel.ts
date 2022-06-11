namespace preludeToChristmas {
    export class GamePanel extends ui.preludeToChristmas.panel.GamePanelUI {
        private _sign: number;

        private _model: PreludeToChristmasModel;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any = null) {
            this._model = clientCore.CManager.getModel(this._sign) as PreludeToChristmasModel;

            this.labNum.text = (this._model.gameTimesMax - this._model.gameTimes) + "/" + this._model.gameTimesMax;
            this.imgUp.gray = clientCore.FlowerPetInfo.petType < 1;
        }

        private onGame(): void {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open('hitStar2.HitStarGameModule', { modelType: "activity", openType: "preludeToChristmas", stageId: 60129, gameId: 3209001 }, { openWhenClose: "preludeToChristmas.PreludeToChristmasModule" });
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onDetail(): void {
            alert.showRuleByID(this._model.ruleById2);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.onGame);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = null;
            super.destroy();
        }
    }
}