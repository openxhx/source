namespace buySevenGift {
    /**
     * 烛影摇华强弹
     */
    export class BuySevenGiftAd extends ui.buySevenGift.BuySevenGiftAlertUI {
        constructor() {
            super();
        }

        init() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
        }

        private goModule() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("buySevenGift.BuySevenGiftModule");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goModule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.MedalManager.setMedal([{ id: MedalConst.BUY_SEVEN_GIFT_OPEN, value: 1 }]);
            super.destroy();
        }
    }
}