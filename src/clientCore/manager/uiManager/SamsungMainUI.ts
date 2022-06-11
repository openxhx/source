
/// <reference path="MainUIBase.ts" />
namespace clientCore{
    export class SamsungMainUI extends MainUIBase {
        private _mainUI: ui.main.samsung.SamsungMainUIUI;
        constructor() {
            super();
        }
        public setUp() {
            this._mainUI = new ui.main.samsung.SamsungMainUIUI();
            this._mainUI.mouseThrough = true;
        }
        public open() {
            this.resizeView();
            this.addEvents();
            UIManager.showTalk();
            LayerManager.uiLayer.addChild(this._mainUI);
        }
        public close() {

        }
        public isHide(): boolean {
            return false;
        }
        public hide() {
        }
        public show() {
        }
        public showUserInfo() {

        }
        public getHomeBtnState(): number {
            return 0;
        }
        private addEvents(): void{
            BC.addEvent(this, this._mainUI.btnTask, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this._mainUI.btnCloth, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this._mainUI.btnMap, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this._mainUI.btnShop, Laya.Event.CLICK, this, this.onClick);
        }
        private removeEvents(): void{

        }
        private onClick(e: Laya.Event): void{
            switch(e.currentTarget){
                case this._mainUI.btnCloth:
                    ModuleManager.open('clothChange.ClothChangeModule');
                    break;
                case this._mainUI.btnTask:
                    ModuleManager.open('task.TaskModule');
                    break;
                case this._mainUI.btnMap:
                    ModuleManager.open("worldMap.WorldMapModule");
                    break;
                case this._mainUI.btnShop:
                    ModuleManager.open("shoppingMall.ShoppingMallModule");
                    break;
            }
        }

        private resizeView(): void{
            let len: number = this._mainUI.numChildren;
            for(let i:number=0; i<len; i++){
                let node: Laya.Sprite = this._mainUI.getChildAt(i) as Laya.Sprite;
                node.x += LayerManager.OFFSET * 2;
            }
        }
    }
}