namespace happinessFlavour {
    /**
     * 2021.12.3
     * 可可爱爱小礼物
     * happinessFlavour.LovelyGiftPanel
    */
    export class LovelyGiftPanel extends ui.happinessFlavour.panel.LovelyGiftPanelUI {
        constructor() {
            super();
        }

        show() {
            clientCore.Logger.sendLog('2021年12月3日活动', '【活动】可可爱爱小礼物', '打开主活动面板');
            this.addEventListeners();
            this.ani1.play(0,true);
            this.ani2.play(0,true);
        }

        hide() {
            this.removeSelf();
        }

        destroy() {
            this.ani1.clear();
            this.ani2.clear();
            this.removeEventListeners();
            super.destroy();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.onMake);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        private onRule() {
            alert.showRuleByID(1222);
        }

        private onGet() {
            clientCore.Logger.sendLog('2021年12月3日活动', '【活动】可可爱爱小礼物', '点击获得材料');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("happinessFlavour.LovelyGiftGetPanel");
        }

        private onMake() {
            clientCore.Logger.sendLog('2021年12月3日活动', '【活动】可可爱爱小礼物', '点击制作礼物');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("happinessFlavour.LovelyGiftMakePanel");
        }

    }

}