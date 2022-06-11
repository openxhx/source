namespace answer {
    export class AnswerRuleModule extends ui.answer.game.RulePanelUI {
        constructor() { super(); }
        init(): void {
            let isAnswerMap: boolean = clientCore.MapInfo.mapID == 23;
            this.btnGo.disabled = isAnswerMap;
            this.btnExchange.visible = !isAnswerMap;
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goActivity);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.goExchange);
            BC.addEvent(this, EventManager, globalEvent.CLSOE_ANSWER_MODULE, this, this.destroy);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        popupOver(): void {
            clientCore.Logger.sendLog('2020年8月21日活动', '【活跃活动】心有灵夕', '打开活动面板');
        }

        private goActivity(): void {
            if (!clientCore.AnswerMgr.checkActivity()) {
                alert.showFWords('不在活动时间内！');
                return;
            }
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.MapManager.enterActivityMap(23);
        }

        private goExchange(): void {
            clientCore.ModuleManager.open('answerReward.AnswerRewardModule');
        }
    }
}