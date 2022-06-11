namespace dungeonsSearch {
    export class DungeonsGamePanel extends ui.dungeonsSearch.panel.DungeonsGamePanelUI {
        private _sign: number;
        private _rulePanel: GameRulePanel;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }

        public showInfo() {
            if (!this._rulePanel) this._rulePanel = new GameRulePanel(this._sign);
            this.imgUp.gray = clientCore.FlowerPetInfo.petType < 1;
            let model = clientCore.CManager.getModel(this._sign) as DungeonsSearchModel;
            this.btnChallenge.disabled = model.gameCnt >= 3;
            this.labTimes.text = "挑战次数:" + (3 - model.gameCnt) + "/" + 3;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnChallenge, Laya.Event.CLICK, this, this.gameStart);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
        }

        private gameStart() {
            clientCore.Logger.sendLog('2020年7月24日活动', '【小游戏】火焰方块', '点击进行小游戏');
            this.close();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("dragBlockGame.DragBlockGameModule", { modelType: "activity", openType: "dungeonsSearch", stageId: 60111, gameId: 3900001 }, { openWhenClose: "dungeonsSearch.DungeonsSearchModule" });
        }

        private showRule() {
            clientCore.Logger.sendLog('2020年7月24日活动', '【小游戏】火焰方块', '查看游戏规则');
            this._rulePanel.showInfo();
            clientCore.DialogMgr.ins.open(this._rulePanel);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._rulePanel?.destroy();
            this._rulePanel = null;
        }
    }
}