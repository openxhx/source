namespace happinessFlavour {
    /**
     * 2021.12.10
     * 神秘的雪堆
     * happinessFlavour.MysticSnowdriftPanel
    */
    export class MysticSnowdriftPanel extends ui.happinessFlavour.panel.MysticSnowdriftPanelUI {
        private exchangePanel: SnowdriftExchangePanel;
        constructor() {
            super();
        }

        show() {
            clientCore.Logger.sendLog('2021年12月10日活动', '【活动】神秘的雪堆', '打开主活动面板');
            this.addEventListeners();
        }

        hide() {
            this.removeSelf();
        }

        //帮助说明
        private onRule() {
            alert.showRuleByID(1223);
        }

        //兑换材料
        private async onExchange() {
            if (!this.exchangePanel) {
                clientCore.LoadingManager.showSmall();
                await res.load("atlas/happinessFlavour/ExchangePanel.atlas", Laya.Loader.ATLAS);
                await res.load("unpack/happinessFlavour/ExchangePanel/bg1.png");
                await res.load(`unpack/happinessFlavour/ExchangePanel/2110550_${clientCore.LocalInfo.sex}.png`);
                clientCore.LoadingManager.hideSmall();
                this.exchangePanel = new SnowdriftExchangePanel();
                this.exchangePanel.init({ suitId: 2110550, startId: 3008, endId: 3015, iconId: 9900278 });
            }
            clientCore.Logger.sendLog('2021年12月10日活动', '【活动】神秘的雪堆', '点击兑换奖励');
            clientCore.DialogMgr.ins.open(this.exchangePanel);
        }

        //前往排行榜
        private goRank() {
            clientCore.Logger.sendLog('2021年12月10日活动', '【活动】神秘的雪堆', '点击排行榜');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("eventRank.EventRankModule", null, { openWhenClose: "happinessFlavour.HappinessFlavourModule", openData: "2" });
        }

        //制作雪堆
        private onMake() {
            clientCore.Logger.sendLog('2021年12月10日活动', '【活动】神秘的雪堆', '点击前往制作');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("snowdriftGame.FindBattlePanel");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.goRank);
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.onMake);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onExchange);
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
    }

}