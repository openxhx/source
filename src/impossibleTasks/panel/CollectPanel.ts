namespace impossibleTasks {
    /**
     * 收集花露小游戏入口
     */
    export class CollectPanel extends ui.impossibleTasks.panel.CollectPanelUI {
        private _sign: number;

        private _model: ImpossibleTasksModel;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }

        init(data: any = null) {
            this.imgUp.gray = clientCore.FlowerPetInfo.petType < 1;
            this._model = clientCore.CManager.getModel(this._sign) as ImpossibleTasksModel;
            this.btnChallenge.disabled = this._model.gameTimes >= this._model.gameTimesMax;
            this.labTimes.text = "挑战次数:" + (this._model.gameTimesMax - this._model.gameTimes) + "/" + this._model.gameTimesMax;
        }

        private showRule() {
            this.event("ON_OPEN_COLLECTRULE");
        }

        private gameStart() {
            if (!this._model.isCanGame) {
                alert.showFWords('今日游戏次数已达上限~');
                return;
            }
            this.close();
            this.event("ON_GAMESTART");
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnChallenge, Laya.Event.CLICK, this, this.gameStart);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
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