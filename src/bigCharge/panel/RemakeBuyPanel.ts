namespace bigCharge {
    /**
     * 直购
     * 复出直购
     */
    export class RemakeBuyPanel extends ui.bigCharge.panel.RemakeBuyPanelUI {
        private suitIds: number[] = [2100177, 2100269, 2110204, 2100189, 2100203, 2100174, 2100208, 2110029, 2100206, 2100256, 2100257, 2100233, 2110175, 2110214, 2100265, 2100261, 2110050, 2100167, 2110169, 2100250, 2100195, 2100198, 2100085, 2100240, 2100142, 2110060, 2100197, 2100229, 2110183, 2100212, 2100237, 2100201, 2100207, 2110014];
        private buyIds: number[] = [2864, 2866, 2870, 2872, 2817, 2819, 2821, 2823, 2825, 2827, 2805, 2807, 2809, 2811, 2786, 2788, 2790, 2765, 2767, 2769, 2750, 2752, 2754, 2736, 2738, 2740, 2716, 2718, 2720, 2688, 2690, 2692, 2694, 2696];
        private offItem: number = 9900195;
        private ruleId: number = 1195;
        private coin: number;
        constructor() {
            super();
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.suitRender);
            this.initUI();
            this.addEventListeners();
        }

        private initUI() {
            this.list.array = this.buyIds;
        }

        private suitRender(item: ui.bigCharge.render.RemakeSuitItemUI) {
            let config = xls.get(xls.eventExchange).get(item.dataSource);
            let offConfig = xls.get(xls.eventExchange).get(config.id + 1);
            let suit = config.femaleProperty[0].v1;
            this.coin = config.cost[0].v1;
            item.iconCost.skin = item.iconCost1.skin = clientCore.ItemsInfo.getItemIconUrl(config.cost[0].v1);
            item.iconOff.skin = clientCore.ItemsInfo.getItemIconUrl(this.offItem);
            item.imgSuit.skin = pathConfig.getSuitImg(suit, clientCore.LocalInfo.sex);
            item.btnBuy.disabled = item.imgGot.visible = clientCore.SuitsInfo.checkHaveSuits(suit);
            item.labPrice.text = '原价:' + config.cost[0].v2;
            item.labOff.text = '折扣价:' + offConfig.cost[0].v2;
            item.labSuit.text = clientCore.SuitsInfo.getSuitInfo(suit).suitInfo.name;
            item.labIndex.text = (this.buyIds.indexOf(config.id) + 1) + "/" + this.buyIds.length;
            BC.addEvent(this, item.btnBuy, Laya.Event.CLICK, this, this.buyGoods, [config.id]);
        }

        show() {
            clientCore.UIManager.setMoneyIds([this.offItem, BigChargeModel.instance.coinid]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年7月2日活动', '【付费】暑假大充', '打开绝版复出直购面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**展示套装详情 */
        private onTryClick(index: number) {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suitIds[index - 1]);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**购买 */
        private buyGoods(id: number) {
            let configId = clientCore.ItemsInfo.checkHaveItem(this.offItem) ? id + 1 : id;
            let coin = xls.get(xls.eventExchange).get(configId).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(configId).cost[0].v2;
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
                        net.sendAndWait(new pb.cs_summer_recharge_buy({ stage: 1, idxs: [configId] })).then((msg: pb.sc_summer_recharge_buy) => {
                            alert.showReward(msg.items);
                            BigChargeModel.instance.coinCost(price);
                            this.list.refresh();
                        })
                    }]
                }
            })
        }

        /**打开复出直购 */
        private openOther() {
            EventManager.event('BIG_CHARGE_SHOW_EVENT_PANEL', panelType.remakeDraw);
        }

        private onScroll() {
            if (!this.list) return;
            let scroll = this.list.scrollBar;
            this.tipLeft.visible = scroll.value / scroll.max > 0.1;
            this.tipRight.visible = scroll.value / scroll.max < 0.9;
        }

        addEventListeners() {
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
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