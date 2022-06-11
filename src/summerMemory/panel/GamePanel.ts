namespace summerMemory {
    export class GamePanel extends ui.summerMemory.panel.GamePanelUI {
        private _sign: number;
        private _achivePanel: AchievePanel;
        constructor() {
            super();
            this.sideClose = true;
            this._achivePanel = new AchievePanel();
        }

        public setInfo(sign: number) {
            this._sign = sign;
            this._achivePanel.setInfo(this._sign);
            this.imgUp.gray = clientCore.FlowerPetInfo.petType < 1;
            let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
            this.labCount.text = "剩余挑战次数:" + (model.MAX_GAME_COUNT - model._gameTimes) + "/" + model.MAX_GAME_COUNT;
        }

        private openAchive() {
            clientCore.Logger.sendLog('2021年5月21日活动', '【游戏】捞金鱼', '打开成就面板');
            clientCore.DialogMgr.ins.open(this._achivePanel);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnAchieve, Laya.Event.CLICK, this, this.openAchive);
            BC.addEvent(this, this.btnChallenge, Laya.Event.CLICK, this, this.gameStart);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        private gameStart() {
            let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
            if (model._gameTimes >= model.MAX_GAME_COUNT) {
                alert.showFWords("今日挑战次数已用完~");
                return;
            }
            clientCore.Logger.sendLog('2021年5月21日活动', '【游戏】捞金鱼', '进入游戏');
            // clientCore.ModuleManager.closeAllOpenModule();
            // clientCore.ModuleManager.open("rotateJump.RotateJumpGameModule", { modelType: "activity", openType: "dayWithRabbit", stageId: 60105, gameId: 3500001 });
            clientCore.ToolTip.gotoMod(268);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._achivePanel.destroy();
            super.destroy();
        }
    }
}