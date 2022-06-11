namespace catHelp {
    export class CatHelpModule extends ui.catHelp.CatHelpModuleUI {
        constructor() {
            super();
        }

        init() {
            this.btnBuy.visible = !clientCore.SuitsInfo.checkHaveSuits(2100267);
        }

        private buySuit() {
            this.btnBuy.visible = false;
            clientCore.RechargeManager.pay(41).then((data) => {
                alert.showReward(data.items);
            }).catch(() => {
                this.btnBuy.visible = true;
            });
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(1197);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showHelp);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}