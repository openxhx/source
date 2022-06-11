namespace afternoonTime {
    /**
     * 11.26
     * 主活动感恩午后时光
     * afternoonTime.CookPanel
     */
    export class CookPanel extends ui.afternoonTime.panel.CookPanelUI {
        private ruleId: number = 1219;

        constructor() {
            super();
            this.sideClose = true;
        }

        init() {
            clientCore.UIManager.setMoneyIds([9900267]);
            clientCore.UIManager.showCoinBox();

        }

        onPreloadOver() {

        }

        addEventListeners() {
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.goMake);
            BC.addEvent(this, this.btnGive, Laya.Event.CLICK, this, this.goGive);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.goExchange);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }

        private onRule() {
            alert.showRuleByID(this.ruleId);
        }

        private goMake() {
            this.destroy();
            clientCore.Logger.sendLog('2021年11月26日活动', '【活动】感恩午后时光露娜', '点击主面板上的制作饼干');
            clientCore.ModuleManager.open("afternoonTime.MakeCookPanel");
        }

        private goGive() {
            if (clientCore.ItemsInfo.getItemNum(9900267) > 0) {
                this.destroy();
                net.sendAndWait(new pb.cs_thanks_afternoon_give_cookie()).then((data: pb.sc_thanks_afternoon_give_cookie) => {
                    clientCore.Logger.sendLog('2021年11月26日活动', '【活动】感恩午后时光露娜', '点击主面板上的前往交换');
                    clientCore.MapManager.enterWorldMap(11, new Laya.Point(1400, 1000));
                });
            } else {
                alert.showSmall("你当前还没有饼干蓝哦~快去制作饼干吧！");
            }

        }

        private goExchange() {
            this.destroy();
            clientCore.Logger.sendLog('2021年11月26日活动', '【活动】感恩午后时光露娜', '点击主面板上的兑换奖励');
            clientCore.ModuleManager.open('afternoonTime.ExchangePanel', { suitId: 2110531, startId: 2986, endId: 2994 });
        }



    }
}