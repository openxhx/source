namespace happinessFlavour {
    /**
     * 12.17
     * happinessFlavour.SantaClausPanel
     */
    export class SantaClausPanel extends ui.happinessFlavour.panel.SantaClausPanelUI {
        private exchangePanel: SnowdriftExchangePanel;
        constructor() {
            super();
        }
        show() {
            clientCore.Logger.sendLog('2021年12月17日活动', '【活动】圣诞爱德文老人', '打开主活动面板');
            this.addEventListeners();
        }

        hide() {
            this.removeSelf();
        }
        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this.btnHide, Laya.Event.CLICK, this, this.onHideGift);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.exchangePanel?.destroy();
            this.exchangePanel = null;
            this.removeEventListeners();
            super.destroy();
        }
        //帮助说明
        private onRule() {
            alert.showRuleByID(1224);
        }

        //兑换材料
        private async onExchange() {
            if (!this.exchangePanel) {
                clientCore.LoadingManager.showSmall();
                await res.load("atlas/happinessFlavour/ExchangePanel.atlas", Laya.Loader.ATLAS);
                await res.load("unpack/happinessFlavour/ExchangePanel/bg1.png");
                await res.load(`unpack/happinessFlavour/ExchangePanel/2110552_${clientCore.LocalInfo.sex}.png`);
                clientCore.LoadingManager.hideSmall();
                this.exchangePanel = new SnowdriftExchangePanel();
                this.exchangePanel.init({ suitId: 2110552, startId: 3030, endId: 3037, iconId: 9900280 });
            }
            clientCore.Logger.sendLog('2021年12月17日活动', '【活动】圣诞爱德文老人', '点击兑换奖励');
            clientCore.DialogMgr.ins.open(this.exchangePanel);
        }

        private onHideGift() {
            clientCore.Logger.sendLog('2021年12月17日活动', '【活动】圣诞爱德文老人', '点击前往藏礼盒');
            let levelNum = Math.floor(Math.random() * 6);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("hideGiftGame.HideGiftGameModule", levelNum);
        }

    }
}