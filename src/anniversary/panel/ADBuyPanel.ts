namespace anniversary {
    export class ADBuyPanel extends ui.anniversary.panel.ADBuyPanelUI {
        private _sign: number;
        private reward1: xls.eventExchange;
        private rewardId: number[] = [39, 40, 41];
        private readonly coinId: number = 1511008;
        private curMoney: number[];
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }

        public show() {
            this.curMoney = clientCore.UIManager.getCurMoney();
            this.reward1 = xls.get(xls.eventExchange).get(2177);
            clientCore.UIManager.setMoneyIds([this.coinId, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            let model = clientCore.CManager.getModel(this._sign) as AnniversaryModel;
            for (let i: number = 1; i < 5; i++) {
                let reward: xls.pair[];
                let isBuy: boolean = false;
                if (i == 1) {
                    reward = clientCore.LocalInfo.sex == 1 ? this.reward1.femaleProperty : this.reward1.maleProperty;
                    isBuy = model.adBuyStatus > 0;
                } else {
                    let config = clientCore.RechargeManager.getShopInfo(this.rewardId[i - 2]);
                    reward = clientCore.LocalInfo.sex == 1 ? config.rewardFamale : config.rewardMale;
                    isBuy = model.adRmbBuyStatus[i - 2] > 0;
                }
                if (isBuy) {
                    this["labCount" + i].text = "本周剩余：0/1";
                } else {
                    this["labCount" + i].text = "本周剩余：1/1";
                }
                this["btnBuy" + i].disabled = isBuy;
                for (let j: number = 0; j < reward.length; j++) {
                    this["txt_" + i + "_" + reward[j].v1].value = reward[j].v2;
                }
            }
        }

        private async buy(flag: number) {
            let model = clientCore.CManager.getModel(this._sign) as AnniversaryModel;
            if (flag == 1) {
                if (model.adBuyStatus == 1) return;
                await net.sendAndWait(new pb.cs_common_exchange({ activityId: 47, exchangeId: 2177 })).then((data: pb.sc_common_exchange) => {
                    alert.showReward(data.item);
                    model.adBuyStatus = 1;
                    this.labCount1.text = "本周剩余：0/1";
                    this.btnBuy1.disabled = true;
                })
            } else {
                if (model.adRmbBuyStatus[flag - 2] == 1) return;
                await clientCore.RechargeManager.pay(this.rewardId[flag - 2]).then((data) => {
                    alert.showReward(data.items);
                    model.adRmbBuyStatus[flag - 2]++;
                    this["labCount" + flag].text = "本周剩余：0/1";
                    this["btnBuy" + flag].disabled = true;
                });
            }
            await util.RedPoint.reqRedPointRefresh(11801);
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
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.buy, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.buy, [2]);
            BC.addEvent(this, this.btnBuy3, Laya.Event.CLICK, this, this.buy, [3]);
            BC.addEvent(this, this.btnBuy4, Laya.Event.CLICK, this, this.buy, [4]);
        }

        destroy() {
            if (this.curMoney.length > 0) {
                clientCore.UIManager.setMoneyIds(this.curMoney);
            } else {
                clientCore.UIManager.releaseCoinBox();
            }
            this.reward1 = null;
            BC.removeEvent(this);
            super.destroy();
        }
    }
}