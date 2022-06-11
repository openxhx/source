namespace twinkleShop {
    /**
     * 闪耀变身店
     * twinkleShop.TwinkleShopModule
     */
    export class TwinkleShopModule extends ui.twinkleShop.TwinkleShopModuleUI {
        sideClose: boolean = true;
        constructor() { super(); }
        init(data: number): void {
            super.init(data);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnSuilt, Laya.Event.CLICK, this, this.onClick, [1]);
            BC.addEvent(this, this.btnCloth, Laya.Event.CLICK, this, this.onClick, [2]);
            BC.addEvent(this, this.btnItem, Laya.Event.CLICK, this, this.onClick, [3]);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private onClick(type: number): void {
            clientCore.ModuleManager.closeAllOpenModule();
            switch (type) {
                case 1: //闪耀套装
                    clientCore.Logger.sendLog('活动', '闪耀变身之旅', '点击闪耀套装按钮');
                    clientCore.ModuleManager.open('familyTailor.FamilyTailorModule', { type: 3, lv: this._data });
                    break;
                case 2: //闪耀部件
                    clientCore.Logger.sendLog('活动', '闪耀变身之旅', '点击闪耀散件按钮');
                    clientCore.ModuleManager.open('sellStore.SellStoreModule', 'twinkleStore');
                    break;
                case 3: //闪耀道具
                    clientCore.Logger.sendLog('活动', '闪耀变身之旅', '点击闪耀道具按钮');
                    clientCore.ModuleManager.open('commonShop.CommonShopModule', 8);
                    break;
                default:
                    break;
            }
        }
    }
}