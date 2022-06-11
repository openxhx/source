namespace bigCharge {
    /**
     * 直购，一件根据花宝打折，一件打包
     * 巫铃祈舞
     */
    export class VipBagBuyPanel extends ui.bigCharge.panel.VipBagBuyPanelUI {
        private baseBuyId1: number = 2860;
        private baseBuyId2: number = 2863;
        private buyId1: number;
        private buyId2: number;
        private suit1: number = 2110474;
        private suit2: number = 2100328;
        private giftId: number = 1000071;
        private ruleId: number = 1155;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.buyId2 = this.baseBuyId2;
            if (clientCore.FlowerPetInfo.petType == 3) {
                this.buyId1 = this.baseBuyId1 + 2;
            } else if (clientCore.FlowerPetInfo.petType > 0) {
                this.buyId1 = this.baseBuyId1 + 1;
            } else {
                this.buyId1 = this.baseBuyId1;
            }
            this.initUI();
            this.addEventListeners();
        }

        private initUI() {
            let xlsConfig = xls.get(xls.eventExchange);
            this.labPrice2.text = "" + xlsConfig.get(this.baseBuyId2).cost[0].v2;
            this.labPrice1_0.text = "" + xlsConfig.get(this.baseBuyId1).cost[0].v2;
            this.labPrice1_1.text = "" + xlsConfig.get(this.baseBuyId1 + 1).cost[0].v2;
            this.labPrice1_3.text = "" + xlsConfig.get(this.baseBuyId1 + 2).cost[0].v2;
            this.icon2_0.skin = this.icon2_1.skin = this.icon1_0.skin = this.icon1_1.skin = this.icon1_3.skin = clientCore.ItemsInfo.getItemIconUrl(BigChargeModel.instance.coinid);
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
            //赠品
            let have3 = clientCore.ItemsInfo.checkHaveItem(this.giftId);
            this.imgGot3.visible = have3;
            this.btnGet.visible = have1 && have2 && !have3;
        }

        async show() {
            clientCore.UIManager.setMoneyIds([BigChargeModel.instance.coinid]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年8月27日活动', '【付费】夏日终曲第九期', '打开甜心恶魔面板');
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
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.giftId, condition: '', limit: '' });
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**购买 */
        private buyGoods(idx: number) {
            let configId = idx == 1 ? this.buyId1 : this.buyId2;
            let coin = xls.get(xls.eventExchange).get(configId).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(configId).cost[0].v2;
            // if (this.imgGot1.visible || this.imgGot2.visible) price -= 150;
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                if (coin == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [BigChargeModel.instance.coinNotEnough], caller: this } });
                }
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_summer_recharge_buy({ stage: 5, idxs: [configId] })).then((msg: pb.sc_summer_recharge_buy) => {
                            alert.showReward(msg.items);
                            BigChargeModel.instance.coinCost(price);
                            this.setUI();
                        })
                    }]
                }
            })
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_summer_recharge_get_extra_reward({ type: 14 })).then((msg: pb.sc_summer_recharge_get_extra_reward) => {
                alert.showReward(msg.items);
                this.imgGot3.visible = true;
                this.btnGet.visible = false;
            })
        }

        /**打开复出直购 */
        private openOther() {
            EventManager.event('BIG_CHARGE_SHOW_EVENT_PANEL', panelType.doubleVipBagBuy);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onTryGift);
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.buyGoods, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.buyGoods, [2]);
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