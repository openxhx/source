/// <reference path="MainUIBase.ts" />
namespace clientCore {

    export class OrchardMainUI extends MainUIBase {

        private _ui: ui.main.orchard.OrchardMainUIUI;

        constructor() { super(); }
        public setUp() {
            if (this._ui) return;
            this._ui = new ui.main.orchard.OrchardMainUIUI();
            this.resizeView();
        }
        public open() {
            this.addEvents();
            UIManager.showTalk();
            LayerManager.uiLayer.addChild(this._ui);
        }
        public close() {
            this.removeEvents();
            this._ui.removeSelf();
        }

        private addEvents(): void {
            BC.addEvent(this, this._ui.btnClose, Laya.Event.CLICK, this, this.onExit);
            BC.addEvent(this, this._ui.btnRule, Laya.Event.CLICK, this, this.onRule);
        }

        private removeEvents(): void {
            BC.removeEvent(this);
        }

        private resizeView(): void {
            this._ui.btnRule.x += 2*LayerManager.OFFSET;
        }

        private onExit(): void {
            if(OrchardMgr.start)return; //游戏开始了 不可以退出
            MapManager.enterHome(clientCore.LocalInfo.uid);
        }

        private onRule(): void {
            //打开活动规则
            alert.showRuleByID(1142);
        }
    }
}