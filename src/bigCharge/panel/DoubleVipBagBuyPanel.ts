namespace bigCharge {
    /**
     * 直购，两件都是根据花宝等级折扣,可以打包
     * 云霄梦境\玉兰生香
     */
    export class DoubleVipBagBuyPanel extends ui.bigCharge.panel.DoubleVipBagBuyPanelUI {
        private baseBuyId1: number = 2832;
        private baseBuyId2: number = 2829;
        private baseBuyId3: number = 2835;
        private buyId1: number;
        private buyId2: number;
        private buyId3: number;
        private suit1: number = 2110471;
        private suit2: number = 2100321;
        private giftId: number = 300124;
        private ruleId: number = 1149;

        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            if (clientCore.FlowerPetInfo.petType == 3) {
                this.buyId1 = this.baseBuyId1 + 2;
                this.buyId2 = this.baseBuyId2 + 2;
                this.buyId3 = this.baseBuyId3 + 2;
            } else if (clientCore.FlowerPetInfo.petType > 0) {
                this.buyId1 = this.baseBuyId1 + 1;
                this.buyId2 = this.baseBuyId2 + 1;
                this.buyId3 = this.baseBuyId3 + 1;
            } else {
                this.buyId1 = this.baseBuyId1;
                this.buyId2 = this.baseBuyId2;
                this.buyId3 = this.baseBuyId3;
            }
            this.initUI();
            this.addEventListeners();
        }

        private initUI() {
            let xlsConfig = xls.get(xls.eventExchange);
            this.labPrice1_0.text = "" + xlsConfig.get(this.baseBuyId1).cost[0].v2;
            this.labPrice1_1.text = "" + xlsConfig.get(this.baseBuyId1 + 1).cost[0].v2;
            this.labPrice1_3.text = "" + xlsConfig.get(this.baseBuyId1 + 2).cost[0].v2;
            this.labPrice2_0.text = "" + xlsConfig.get(this.baseBuyId2).cost[0].v2;
            this.labPrice2_1.text = "" + xlsConfig.get(this.baseBuyId2 + 1).cost[0].v2;
            this.labPrice2_3.text = "" + xlsConfig.get(this.baseBuyId2 + 2).cost[0].v2;
            this.labPrice3_0.text = "" + xlsConfig.get(this.baseBuyId3).cost[0].v2;
            this.labPrice3_1.text = "" + xlsConfig.get(this.baseBuyId3 + 1).cost[0].v2;
            this.labPrice3_3.text = "" + xlsConfig.get(this.baseBuyId3 + 2).cost[0].v2;
            this.icon1_0.skin = this.icon1_1.skin = this.icon1_3.skin = this.icon2_0.skin = this.icon2_1.skin = this.icon2_3.skin = this.icon3_0.skin = this.icon3_1.skin = this.icon3_3.skin = clientCore.ItemsInfo.getItemIconUrl(BigChargeModel.instance.coinid);
            this.setUI();
        }


        private setUI() {
            //左套装
            let have1 = clientCore.SuitsInfo.getSuitInfo(this.suit1).allGet;
            this.imgGot1.visible = have1;
            this.boxBuy1.visible = !have1;
            //右套装
            let have2 = clientCore.SuitsInfo.getSuitInfo(this.suit2).allGet;
            this.imgGot2.visible = have2;
            this.boxBuy2.visible = !have2;
            //打包
            this.boxBuy3.visible = !have1 && !have2;
            //赠品
            // let have3: boolean = clientCore.ItemsInfo.checkHaveItem(this.giftId);
            let have3 = clientCore.MapItemsInfoManager.instance.getAllDecorationNumByid(this.giftId) > 0;//家园装饰
            this.imgGot3.visible = have3;
            this.btnGet.visible = have1 && have2 && !have3;
            // this.isHasGift(this.giftId).then(have3 => {
            //     this.imgGot3.visible = have3;
            //     this.btnGet.visible = have1 && have2 && !have3;
            // });
        }

        async show() {
            clientCore.UIManager.setMoneyIds([BigChargeModel.instance.coinid]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年8月20日活动', '【付费】夏日终曲第八期', '打开玉兰生香面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**展示套装详情 */
        private onTryClick(index: number) {
            let id = index == 1 ? this.suit1 : this.suit2;
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", id);
        }

        /**预览背景秀 */
        private onTryGift() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', {id: this.giftId, condition: '', limit: ''});
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**购买 */
        private buyGoods(idx: number) {
            let configId = idx == 1 ? this.buyId1 : (idx == 2 ? this.buyId2 : this.buyId3);
            let coin = xls.get(xls.eventExchange).get(configId).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(configId).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                if (coin == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", {
                        callBack: {
                            funArr: [() => {
                                clientCore.ToolTip.gotoMod(50);
                            }], caller: this
                        }
                    });
                } else {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, {
                        callBack: {
                            funArr: [BigChargeModel.instance.coinNotEnough],
                            caller: this
                        }
                    });
                }
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_summer_recharge_buy({
                            stage: 8,
                            idxs: [configId]
                        })).then((msg: pb.sc_summer_recharge_buy) => {
                            alert.showReward(msg.items);
                            BigChargeModel.instance.coinCost(price);
                            this.setUI();
                        })
                    }]
                }
            })
        }

        /**
         * 是否已经领取了赠品
         */
        private async isHasGift(id: number): Promise<boolean> {
            return new Promise<boolean>(resolve => {
                net.sendAndWait(new pb.cs_summer_recharge_reward_check({id: id})).then((msg: pb.sc_summer_recharge_reward_check) => {
                    resolve(msg.flag == 1);
                }).catch(e => {
                    resolve(false);
                });
            });
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_summer_recharge_get_extra_reward({type: 13})).then((msg: pb.sc_summer_recharge_get_extra_reward) => {
                alert.showReward(msg.items);
                this.imgGot3.visible = true;
                this.btnGet.visible = false;
            });
        }

        /**打开复出直购 */
        private openOther() {
            EventManager.event('BIG_CHARGE_SHOW_EVENT_PANEL', panelType.vipBagBuy);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onTryGift);
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.buyGoods, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.buyGoods, [2]);
            BC.addEvent(this, this.btnBuy3, Laya.Event.CLICK, this, this.buyGoods, [3]);
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}