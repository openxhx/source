/// <reference path="MainUIBase.ts" />
namespace clientCore {

    export class AnswerMainUI extends MainUIBase {

        private _ui: ui.main.answer.AnswerMainUIUI;

        constructor() { super(); }
        public setUp() {
            if (this._ui) return;
            this._ui = new ui.main.answer.AnswerMainUIUI();
            this.resizeView();
        }
        public open() {
            this.showUserInfo();
            this.addEvents();
            UIManager.showTalk();
            LayerManager.uiLayer.addChild(this._ui);
        }
        public close() {
            this.removeEvents();
            this._ui.removeSelf();
        }

        private addEvents(): void {
            BC.addEvent(this, this._ui.btnBack, Laya.Event.CLICK, this, this.onExit);
            BC.addEvent(this, this._ui.btnExchange, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this._ui.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, EventManager, globalEvent.STAGE_RESIZE, this, this.resizeView);
        }

        private removeEvents(): void {
            BC.removeEvent(this);
        }

        public showUserInfo() {
            this._ui.imgFrame.skin = clientCore.LocalInfo.frameImgUrl;
            this._ui.imgHead.skin = clientCore.LocalInfo.headImgUrl;
            this._ui.imgExp.width = clientCore.LocalInfo.getLvInfo().expPercent * 167;
            this._ui.levelTxt.changeText(clientCore.LocalInfo.userLv + "");
            this._ui.nameTxt.changeText(clientCore.LocalInfo.userInfo.nick);
        }

        private resizeView(): void {
            // let len: number = this._ui.numChildren;
            // for (let i: number = 0; i < len; i++) {
            //     let element: Laya.Sprite = this._ui.getChildAt(i) as Laya.Sprite;
            //     element.x > 450 && (element.x += LayerManager.OFFSET);
            // }
            this._ui.btnRule.x += LayerManager.OFFSET;
            this._ui.btnExchange.x += LayerManager.OFFSET;
            this._ui.btnBack.x += Laya.stage.width - Laya.stage.designWidth;
        }

        private onExit(): void {
            MapManager.enterHome(clientCore.LocalInfo.uid);
        }

        private onExchange(): void {
            ModuleManager.open('answerReward.AnswerRewardModule');
        }

        private onRule(): void {
            ModuleManager.open('answer.AnswerRuleModule');
        }
    }
}