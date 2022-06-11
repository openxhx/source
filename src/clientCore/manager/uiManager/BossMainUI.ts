/// <reference path="MainUIBase.ts" />
namespace clientCore {

    export class BossMainUI extends MainUIBase {

        private _ui: core.BaseModule;

        public setUp(): void {
            this._ui = new window['boss']['BossModule'];
            this._ui.init(null);
            this._ui.addEventListeners();
            this._ui.popupOver();
        }
        public open(): void {
            LayerManager.uiLayer.addChild(this._ui);
            UIManager.showTalk();
            UIManager.imgHideUI.visible = false;
        }
        public close(): void {
            this._ui?.destroy();
            this._ui = null;
        }
    }
}