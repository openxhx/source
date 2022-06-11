namespace snowSeason {
    /**
     * 直购，特惠价
     */
    export class TimeBuyPanel extends ui.snowSeason.panel.TimeBuyPanelUI {

        private leftTime: number = 0;
        private giftIdArr1: number[] = [1000165, 2110558];
        private waiting: boolean = false;
        private eventId: number[] = [3,4];
        private chargeId: number[] = [53 , 59 , 52];
        private timeArr: number[] = [];
        private giftArr: number[] = [9900277 , 9900003 , 9900277 , 1000165 , 9900277 , 2110558 , 3800066];
        private count:number = 5;

        constructor() {
            super();
            this.addEventListeners();
        }

        private async initUI() {
            let now: number = clientCore.ServerManager.curServerTime;
            await net.sendAndWait(new pb.cs_funny_candy_info({})).then((data: pb.sc_funny_candy_info) => {
                SnowSeasonModel.instance.startTime = data.time;
                this.leftTime = 60 * 60 - (now - SnowSeasonModel.instance.startTime);
            });
            await net.sendAndWait(new pb.cs_time_cloister_pay_product_times()).then((msg: pb.sc_time_cloister_pay_product_times) => {
                this.leftTxt.text = "剩余：" + msg.times[this.eventId[1] - 1];
                this.buyBtn2.disabled = msg.times[this.eventId[1] - 1] <= 0;
                this.timeArr = msg.times;
            });

            if (this.leftTime > 0 && this.timeArr[this.eventId[0] - 1] == 0) {

            } else {
                this.gift0.visible = false;
                this.gift1.x = 50;
                this.gift1.y = 210;
                this.gift2.x = 630;
                this.gift2.y = 210;
            }
            for (let i: number = 0; i < 7; i++) {
                clientCore.ToolTip.addTips(this["icon" + i], { id: this.giftArr[i] });
            }
            this.icon3.skin = clientCore.ItemsInfo.getItemIconUrl(this.giftArr[3]);
            this.icon5.skin = clientCore.ItemsInfo.getItemIconUrl(this.giftArr[5]);
            this.icon6.skin = clientCore.ItemsInfo.getItemIconUrl(this.giftArr[6]);
            Laya.timer.loop(1000, this, this.refreshTime);
            this.setUI();
        }

        setUI() {
            this.buyBtn0.visible = this.timeArr[this.eventId[0] - 1] == 0;
            this.state0.visible = this.timeArr[this.eventId[0] - 1] > 0;
            this.buyBtn1.visible = clientCore.ItemsInfo.getItemNum(this.giftIdArr1[0]) == 0;
            this.state1.visible = clientCore.ItemsInfo.getItemNum(this.giftIdArr1[0]) > 0;
            this.buyBtn2.visible = !clientCore.SuitsInfo.checkHaveSuits(this.giftIdArr1[1]);
            this.state2.visible = clientCore.SuitsInfo.checkHaveSuits(this.giftIdArr1[1]);
        }

        refreshTime() {
            if(this.leftTime >= 0){
                this.leftTime--;
                if (this.leftTime <= 0) {
                    this.timeTxt.text = "已过期";
                    this.buyBtn0.visible = false;
                } else {
                    this.timeTxt.text = `${util.StringUtils.getDateStr2(this.leftTime)}后过期`;
                }
            }
            if(this.count > 0){
                this.count--;
            }else{
                this.count = 5;
                net.sendAndWait(new pb.cs_time_cloister_pay_product_times()).then((msg: pb.sc_time_cloister_pay_product_times) => {
                    this.leftTxt.text = "剩余：" + msg.times[this.eventId[1] - 1];
                    this.buyBtn2.disabled = msg.times[this.eventId[1] - 1] <= 0;
                })
            }
        }

        async show() {
            clientCore.UIManager.setMoneyIds([SnowSeasonModel.instance.coinid, 0]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年12月24日活动', '【付费】初雪的季节', '打开限时礼包面板');
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
            //let event: xls.rechargeEvent = xls.get(xls.rechargeEvent).get(id);
            let value: number = await clientCore.LimitRechargeManager.instance.gettimes(key);
            // net.sendAndWait(new pb.cs_common_buy_times_check({ id: this.chargeId[index] })).then((msg: pb.sc_common_buy_times_check) => {
            //     if (msg.flag) {
            //         clientCore.RechargeManager.pay(this.chargeId[index]).then((data) => {
            //             alert.showReward(data.items);
            //             if (index == 0) {
            //                 clientCore.LimitRechargeManager.instance.settimes(key, value + 1);
            //                 this.timeArr[this.eventId[0] - 1] = 1;
            //             }
            //             this.waiting = false;
            //             this.setUI()
            //         }).catch(() => {
            //             this.waiting = false;
            //         });
            //     } else {
            //         alert.showFWords("购买次数已到上限");
            //     }
            // });
            clientCore.RechargeManager.pay(this.chargeId[index]).then((data) => {
                alert.showReward(data.items);
                if (index == 0) {
                    clientCore.LimitRechargeManager.instance.settimes(key, value + 1);
                    this.timeArr[this.eventId[0] - 1] = 1;
                }
                this.waiting = false;
                this.setUI()
            }).catch(() => {
                this.waiting = false;
            });
        }

        addEventListeners() {
            BC.addEvent(this, this.buyBtn0, Laya.Event.CLICK, this, this.onBuy, [0]);
            BC.addEvent(this, this.buyBtn1, Laya.Event.CLICK, this, this.onBuy, [1]);
            BC.addEvent(this, this.buyBtn2, Laya.Event.CLICK, this, this.onBuy, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.refreshTime);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }

    }
}