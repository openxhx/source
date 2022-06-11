namespace dungeonsSearch {
    export class GameRulePanel extends ui.dungeonsSearch.panel.DungeonsRulePanelUI {
        private _sign: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }

        public showInfo() {
            let model = clientCore.CManager.getModel(this._sign) as DungeonsSearchModel;
            this.btnStart.disabled = model.gameCnt >= 3;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.gameStart);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        private gameStart() {
            clientCore.Logger.sendLog('2020年7月24日活动', '【小游戏】火焰方块', '点击进行小游戏');
            this.close();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("dragBlockGame.DragBlockGameModule", { modelType: "activity", openType: "dungeonsSearch", stageId: 60111, gameId: 3900001 }, { openWhenClose: "dungeonsSearch.DungeonsSearchModule" });
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}