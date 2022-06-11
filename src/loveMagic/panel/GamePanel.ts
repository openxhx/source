namespace loveMagic {
    export class GamePanel extends ui.loveMagic.panel.GamePanelUI {

        private _model: LoveMagicModel;

        constructor() {
            super();
            this.sideClose = true;
        }
        
        public show(sign: number) {
            clientCore.Logger.sendLog('2021年4月9日活动', '【游戏】甜甜圈冒险', '打开游戏面板');
            this._model = clientCore.CManager.getModel(sign) as LoveMagicModel;
            this.labChallengeCount.text = "挑战次数:" + (this._model.MAX_GAME_COUNT - this._model.collectTimes) + "/" + this._model.MAX_GAME_COUNT;
            clientCore.DialogMgr.ins.open(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnChallenge, Laya.Event.CLICK, this, this.gameStart);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
        }

        private gameStart() {
            if(this._model.collectTimes >= this._model.MAX_GAME_COUNT){
                alert.showFWords('今日游戏次数已达上限哦~');
                return;
            }
            this.close();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("rotateJump.RotateJumpGameModule", { modelType: "activity", openType: "loveMagic", stageId: 60134, gameId: 3500001 },{openWhenClose: 'loveMagic.LoveMagicModule',openData: 1});
        }

        private showRule() {
            alert.showRuleByID(1013);
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