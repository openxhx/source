namespace chrysanthemumAlcohol {
    export class GamePanle2 extends ui.chrysanthemumAlcohol.panel.GamePanel2UI {
        private _sign: number;

        private _model: ChrysanthemumAlcoholModel;
        private _control: ChrysanthemumAlcoholControl;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any = null) {
            this._model = clientCore.CManager.getModel(this._sign) as ChrysanthemumAlcoholModel;
            this._control = clientCore.CManager.getControl(this._sign) as ChrysanthemumAlcoholControl;

            this.labNum.text = (this._model.gameTimesMax2 - this._model.gameTimes2) + "/" + this._model.gameTimesMax2;
        }

        private onGame(): void {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open('fingerGame.FingerGameModule', { modelType: "activity", openType: "chrysanthemumAlcohol", stageId: 60125, gameId: 3900005 }, { openWhenClose: "chrysanthemumAlcohol.ChrysanthemumAlcoholWorkshopModule" });
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onDetail(): void {
            alert.showRuleByID(this._model.ruleById3);
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
            this._model = this._control = null;
            super.destroy();
        }
    }
}