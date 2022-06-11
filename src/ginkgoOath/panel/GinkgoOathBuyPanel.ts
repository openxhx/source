namespace ginkgoOath {
    export class GinkgoOathBuyPanel extends ui.ginkgoOath.panel.GinkgoOathBuyPanelUI {
        private _sign: number;
        private reward0: xls.eventExchange;
        private reward1: xls.eventExchange;
        private rewardId: number[] = [39, 40, 41];
        private readonly coinId: number = 1511012;
        private curMoney: number[];
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
            this.panel.hScrollBarSkin = "";
        }

        public show() {
            this.curMoney = clientCore.UIManager.getCurMoney();
            this.reward0 = xls.get(xls.eventExchange).get(2319);
            this.reward1 = xls.get(xls.eventExchange).get(2318);
            clientCore.UIManager.setMoneyIds([this.coinId, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            let model = clientCore.CManager.getModel(this._sign) as GinkgoOathModel;
            for (let i: number = 0; i < 5; i++) {
                let reward: xls.pair[];
                let isBuy: boolean = false;
                if (i == 0) {
                    reward = clientCore.LocalInfo.sex == 1 ? this.reward0.femaleProperty : this.reward0.maleProperty;
                    isBuy = model.adBuyDaily > 0;
                } else if (i == 1) {
                    reward = clientCore.LocalInfo.sex == 1 ? this.reward1.femaleProperty : this.reward1.maleProperty;
                    isBuy = model.adBuyStatus > 0;
                } else {
                    let config = clientCore.RechargeManager.getShopInfo(this.rewardId[i - 2]);
                    reward = clientCore.LocalInfo.sex == 1 ? config.rewardFamale : config.rewardMale;
                    isBuy = model.adRmbBuyStatus[i - 2] > 0;
                }
                if (isBuy) {
                    this["lab_count" + i].text = i == 0 ? "今日剩余：0/1" : "本周剩余：0/1";
                } else {
                    this["lab_count" + i].text = i == 0 ? "今日剩余：1/1" : "本周剩余：1/1";;
                }
                this["btn_buy" + i].disabled = isBuy;
                for (let j: number = 0; j < reward.length; j++) {
                    this["txt_count_" + i + "_" + reward[j].v1].value = reward[j].v2;
                }
            }
        }

        private async buy(flag: number) {
            let model = clientCore.CManager.getModel(this._sign) as GinkgoOathModel;
            if (flag == 0) {
                if (model.adBuyDaily == 1) return;
                await net.sendAndWait(new pb.cs_common_exchange({ activityId: 92, exchangeId: 2319 })).then((data: pb.sc_common_exchange) => {
                    alert.showReward(data.item);
                    model.adBuyDaily = 1;
                    clientCore.MedalManager.setMedal([{ id: MedalDailyConst.GINKGOOATH_DAILY_GIFT, value: 1 }]);
                    this.lab_count0.text = "今日剩余：0/1";
                    this.btn_buy0.disabled = true;
                })
            } else if (flag == 1) {
                if (model.adBuyStatus == 1) return;
                await net.sendAndWait(new pb.cs_common_exchange({ activityId: 92, exchangeId: 2318 })).then((data: pb.sc_common_exchange) => {
                    alert.showReward(data.item);
                    model.adBuyStatus = 1;
                    this.lab_count1.text = "本周剩余：0/1";
                    this.btn_buy1.disabled = true;
                })
            } else {
                if (model.adRmbBuyStatus[flag - 2] == 1) return;
                await clientCore.RechargeManager.pay(this.rewardId[flag - 2]).then((data) => {
                    alert.showReward(data.items);
                    model.adRmbBuyStatus[flag - 2]++;
                    this["lab_count" + flag].text = "本周剩余：0/1";
                    this["btn_buy" + flag].disabled = true;
                });
            }
            await util.RedPoint.reqRedPointRefresh(19301);
            clientCore.UIManager.refreshMoney();
        }

        private onClose() {
            if (this.curMoney.length > 0) {
                clientCore.UIManager.setMoneyIds(this.curMoney);
            } else {
                clientCore.UIManager.releaseCoinBox();
            }
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btn_close, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btn_buy0, Laya.Event.CLICK, this, this.buy, [0]);
            BC.addEvent(this, this.btn_buy1, Laya.Event.CLICK, this, this.buy, [1]);
            BC.addEvent(this, this.btn_buy2, Laya.Event.CLICK, this, this.buy, [2]);
            BC.addEvent(this, this.btn_buy3, Laya.Event.CLICK, this, this.buy, [3]);
            BC.addEvent(this, this.btn_buy4, Laya.Event.CLICK, this, this.buy, [4]);
        }

        destroy() {
            if (this.curMoney?.length > 0) {
                clientCore.UIManager.setMoneyIds(this.curMoney);
            } else {
                clientCore.UIManager.releaseCoinBox();
            }
            this.reward0 = null;
            this.reward1 = null;
            BC.removeEvent(this);
            super.destroy();
        }
    }
}