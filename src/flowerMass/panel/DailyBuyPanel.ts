namespace flowerMass {

    export class DailyBuyPanel extends ui.flowerMass.panel.DailyBuyPanelUI {
        private suitId: number = 2100359;
        private otherId: number = 4005565;
        private coinId: number = 9900316;
        private curDay: number;
        private curShowDay: number;
        private cost:number = 0;
        /**
         * 购买配置
         * @param id 唯一id
         * @param type 购买类型:0人民币,1活动代币
         * @param tag 标签:0无标签，1免费，2特惠
         * @param buyId 商品id
         */
        private config: { id: number, type: number, tag: number, buyId: number }[] = [
            { id: 0, type: 0, tag: 0, buyId: 55 },
            { id: 1, type: 1, tag: 1, buyId: 3182 },
            { id: 2, type: 0, tag: 0, buyId: 57 },
            { id: 3, type: 1, tag: 2, buyId: 3183 },
            { id: 4, type: 0, tag: 0, buyId: 60 },
            { id: 5, type: 1, tag: 1, buyId: 3184 },
            { id: 6, type: 1, tag: 2, buyId: 3185 },
            { id: 7, type: 0, tag: 0, buyId: 62 },
            { id: 8, type: 1, tag: 2, buyId: 3186 },
            { id: 9, type: 0, tag: 0, buyId: 66 },
        ]
        constructor() {
            super();
            this.imgSuit.skin = `unpack/flowerMass/${this.suitId}_${clientCore.LocalInfo.sex}.png`;
            this.listDay.renderHandler = new Laya.Handler(this, this.dayRender);
            this.listDay.mouseHandler = new Laya.Handler(this, this.dayClick);
            this.listOther.renderHandler = new Laya.Handler(this, this.itemRender);
            this.listOther.mouseHandler = new Laya.Handler(this, this.itemClick);
            this.addEventListeners();
        }

        show(box: any) {
            clientCore.Logger.sendLog('2021年4月15日活动', '【付费】小花仙集合啦', '打开每日特惠面板');
            this.curDay = (util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) - util.TimeUtil.formatTimeStrToSec("2022-4-15 00:00:00")) / util.TimeUtil.DAYTIME;
            this.curShowDay = this.curDay > 9 ? 9 : this.curDay;
            this.listDay.array = this.config;
            this.setDayInfo();
            this.checkSuit();
            clientCore.UIManager.setMoneyIds([this.coinId , 0]);
            clientCore.UIManager.showCoinBox();
            box.addChild(this);
            EventManager.event(CHANGE_TIME, "time_15_28");
        }

        private dayRender(item: ui.flowerMass.render.DailyItemUI) {
            let config: { id: number, type: number, tag: number, buyId: number } = item.dataSource;
            item.day.text = config.id+15 + "";
            item.select.visible = config.id == this.curShowDay;
            item.di.skin = `flowerMass/DailyBuyPanel/day_${config.id == this.curDay ? "cur" : (config.id < this.curDay ? "past" : "future")}.png`;
            if (config.tag > 0) item.tip.skin = `flowerMass/DailyBuyPanel/${config.tag == 1 ? "mian_fei" : "te_hui"}.png`;
            else item.tip.skin = "";
        }

        private dayClick(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let config: { id: number, type: number, tag: number, buyId: number } = this.listDay.getItem(index);
                if (this.curShowDay == config.id) return;
                this.curShowDay = config.id;
                this.setDayInfo();
                this.listDay.refresh();
            }
        }

        private itemRender(item: ui.flowerMass.render.DailyRewardUI) {
            this.setRewardInfo(item, item.dataSource);
        }

        private itemClick(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                this.showTips(this.listOther.getCell(index), this.listOther.getItem(index).v1);
            }
        }

        private setRewardInfo(item: ui.flowerMass.render.DailyRewardUI, reward: xls.pair) {
            item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            item.num.text = reward.v2.toString();
        }

        private clothClick() {
            this.showTips(this.itemCloth, this.itemCloth.dataSource.v1);
        }

        private showTips(item: any, id: number) {
            clientCore.ToolTip.showTips(item, { id: id });
        }

        private setDayInfo() {
            if (this.curShowDay > this.curDay) {
                this.boxItem.visible = false;
                this.imgWait.visible = true;
            } else {
                let reward: xls.pair[];
                let config = this.config[this.curShowDay];
                let cost: xls.pair;
                if (config.type == 0) {
                    let goods = clientCore.RechargeManager.getShopInfo(config.buyId);
                    reward = clientCore.LocalInfo.sex == 1 ? goods.rewardFamale : goods.rewardMale;
                    cost = { v1: 0, v2: goods.cost };
                } else {
                    let goods = xls.get(xls.eventExchange).get(config.buyId);
                    reward = clientCore.LocalInfo.sex == 1 ? goods.femaleProperty : goods.maleProperty;
                    cost = goods.cost[0];
                }
                this.itemCloth.dataSource = reward[0];
                this.setRewardInfo(this.itemCloth, reward[0]);
                if (xls.get(xls.itemCloth).has(reward[0].v1)) {
                    this.listHeart.repeatX = clientCore.ClothData.getCloth(reward[0].v1).xlsInfo.quality;
                    this.btnGet.visible = !clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
                } else {
                    this.listHeart.repeatX = clientCore.ItemsInfo.getItemQuality(reward[0].v1);
                    let cloth = xls.get(xls.itemBag).get(reward[0].v1).include[0].v1;
                    this.btnGet.visible = !clientCore.ItemsInfo.checkHaveItem(cloth);
                }
                this.listOther.array = reward.slice(1);
                if (this.btnGet.visible) {
                    if (cost.v1 == 0) {
                        this.labRmb.value = cost.v2 + " y";
                        this.labRmb.visible = true;
                        this.labCoin.visible = this.costIcon.visible = false;
                    } else if (cost.v2 == 0) {
                        this.labRmb.value = "l q";
                        this.labRmb.visible = true;
                        this.labCoin.visible = this.costIcon.visible = false;
                    } else {
                        this.labCoin.value = cost.v2.toString();
                        this.labRmb.visible = false;
                        this.labCoin.visible = this.costIcon.visible = true;
                    }
                }
                this.boxItem.visible = true;
                this.imgWait.visible = false;
            }
        }

        private buy() {
            let config = this.config[this.curShowDay];
            if (config.type == 0) {
                clientCore.RechargeManager.pay(config.buyId).then((data) => {
                    this.cost = 0;
                    alert.showReward(data.items);
                    this.setDayInfo();
                    this.checkSuit();
                });
            } else {
                let goods = xls.get(xls.eventExchange).get(config.buyId);
                let cost = goods.cost[0];
                this.cost = cost.v2;
                if (cost.v2 == 0) {
                    this.sureBuy(config.buyId);
                } else {
                    let have = clientCore.ItemsInfo.getItemNum(cost.v1);
                    if (have < cost.v2) {
                        alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(cost.v1)}不足,是否前往补充?`, { callBack: { funArr: [() => { FlowerMassModel.instance.openCoinGiftBuy() }], caller: this  } });
                        return;
                    }
                    this.btnGet.visible = false;
                    alert.showSmall(`是否花费${cost.v2}${clientCore.ItemsInfo.getItemName(cost.v1)}购买所选商品?`, {
                        callBack: {
                            caller: this, funArr: [() => {
                                this.sureBuy(config.buyId);
                            }, () => {
                                this.btnGet.visible = true;
                            }]
                        }
                    })
                }
            }
        }

        private sureBuy(id: number) {
            this.btnGet.visible = false;
            net.sendAndWait(new pb.cs_common_exchange({ activityId: FlowerMassModel.instance.activityId, exchangeId: id })).then((msg: pb.sc_common_exchange) => {
                alert.showReward(msg.item);
                this.setDayInfo();
                this.checkSuit();
                FlowerMassModel.instance.coinCost(this.cost);
            })
        }

        private checkSuit() {
            if (clientCore.ItemsInfo.checkHaveItem(this.suitId) && !clientCore.ItemsInfo.checkHaveItem(this.otherId)) {
                this.ani1.play(0, true);
            }
        }

        /**试穿套装 */
        private trySuit(i: number) {
            if (i == 0) {
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
            } else {
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.otherId);
            }
        }

        private onOverDay() {
            this.curDay++;
            this.listDay.refresh();
        }

        private getReward() {
            this.ani1.play(0, false);
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: 3, activityId: FlowerMassModel.instance.activityId, index: 1 })).then((msg: pb.sc_common_recharge_buy) => {
                alert.showReward(msg.items);
            })
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        private onDetail() {
            alert.showRuleByID(1226);
        }

        addEventListeners() {
            EventManager.on(globalEvent.ON_OVER_DAY, this, this.onOverDay);
            BC.addEvent(this, this.itemCloth, Laya.Event.CLICK, this, this.clothClick);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit, [0]);
            //BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.trySuit, [1]);
            BC.addEvent(this, this.boxReward, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.buy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
        }

        removeEventListeners() {
            EventManager.off(globalEvent.ON_OVER_DAY, this, this.onOverDay);
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}