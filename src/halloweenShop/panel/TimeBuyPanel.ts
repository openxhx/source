namespace halloweenShop {
    /**
     * 直购，特惠价
     */
    export class TimeBuyPanel extends ui.halloweenShop.panel.TimeBuyPanelUI {

        private leftTime: number = 0;
        private giftIdArr1: number[] = [142823, 142834];
        private waiting: boolean = false;
        private haveTimer: Boolean = false;
        private eventId: number[] = [9, 10, 11];
        private timeArr: number[] = [];
        private giftArr: xls.pair[] = [{ v1: 9900260, v2: 10 }, { v1: 9900003, v2: 10 }, { v1: 9900260, v2: 80 }, { v1: 142823, v2: 1 }, { v1: 142825, v2: 1 }, { v1: 9900260, v2: 80 }, { v1: 300144, v2: 1 }];

        constructor() {
            super();
            this.addEventListeners();
        }

        private async initUI() {
            this.giftArr[3].v1 = clientCore.LocalInfo.sex == 1 ? 142823 : 142834;
            this.giftArr[4].v1 = clientCore.LocalInfo.sex == 1 ? 142825 : 142836;
            let now: number = clientCore.ServerManager.curServerTime;
            await net.sendAndWait(new pb.cs_funny_candy_info({})).then((data: pb.sc_funny_candy_info) => {
                HalloweenShopModel.instance.startTime = data.time;
                this.leftTime = 60 * 60 - (now - HalloweenShopModel.instance.startTime);
            });
            this.timeArr = await clientCore.LimitRechargeManager.instance.getInfo();
            if (this.leftTime > 0 && this.timeArr[this.eventId[0] - 1] == 0) {
                this.haveTimer = true;
                Laya.timer.loop(1000, this, this.refreshTime);
            } else {
                this.gift0.visible = false;
                this.gift2.x = 50;
                this.gift2.y = 210;
                this.gift1.x = 630;
                this.gift1.y = 210;
            }
            for (let i: number = 0; i < 7; i++) {
                clientCore.ToolTip.addTips(this["item" + i], { id: this.giftArr[i].v1 });
                clientCore.GlobalConfig.setRewardUI(this["item" + i], { id: this.giftArr[i].v1, cnt: this.giftArr[i].v2, showName: true });
            }
            this.setUI();
        }

        setUI() {
            this.buyBtn0.visible = this.timeArr[this.eventId[0] - 1] == 0;
            this.state0.visible = this.timeArr[this.eventId[0] - 1] > 0;
            this.buyBtn2.visible = this.timeArr[this.timeArr.length - 3] == 0;
            this.state2.visible = this.timeArr[this.timeArr.length - 3] > 0;
            this.buyBtn1.visible = clientCore.ItemsInfo.getItemNum(this.giftIdArr1[clientCore.LocalInfo.sex - 1]) == 0;
            this.state1.visible = clientCore.ItemsInfo.getItemNum(this.giftIdArr1[clientCore.LocalInfo.sex - 1]) > 0;
        }

        refreshTime() {
            this.leftTime--;
            if (this.leftTime <= 0) {
                Laya.timer.clear(this, this.refreshTime);
                this.haveTimer = false;
                this.timeTxt.text = "已过期";
                this.buyBtn0.visible = false;
            } else {
                this.timeTxt.text = `${util.StringUtils.getDateStr2(this.leftTime)}后过期`;
            }
        }

        async show() {
            clientCore.UIManager.setMoneyIds([HalloweenShopModel.instance.coinid, 0]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年11月5日活动', '【付费】搞怪糖果商城', '打开限时礼包面板');
            this.initUI();
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        async onBuy(index: number) {
            if (this.waiting) return;
            this.waiting = true;
            let id = this.eventId[index];
            let key: number = id - 1;
            let event: xls.rechargeEvent = xls.get(xls.rechargeEvent).get(id);
            let value: number = await clientCore.LimitRechargeManager.instance.gettimes(key);
            net.sendAndWait(new pb.cs_common_buy_times_check({ id: event.chargeId })).then((msg: pb.sc_common_buy_times_check) => {
                if (msg.flag) {
                    clientCore.RechargeManager.pay(event.chargeId).then((data) => {
                        alert.showReward(data.items);
                        if (index == 0) {
                            clientCore.LimitRechargeManager.instance.settimes(key, value + 1);
                            this.timeArr[this.eventId[0] - 1] = 1;
                        }
                        if (index == 2) {
                            clientCore.LimitRechargeManager.instance.settimes(this.timeArr.length - 3, 1);
                        }
                        this.waiting = false;
                        this.setUI()
                    }).catch(() => {
                        this.waiting = false;
                    });
                } else {
                    alert.showFWords("购买次数已到上限");
                }
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.buyBtn0, Laya.Event.CLICK, this, this.onBuy, [0]);
            BC.addEvent(this, this.buyBtn1, Laya.Event.CLICK, this, this.onBuy, [1]);
            BC.addEvent(this, this.buyBtn2, Laya.Event.CLICK, this, this.onBuy, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            if (this.haveTimer) {
                Laya.timer.clear(this, this.refreshTime);
            }
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }

    }
}