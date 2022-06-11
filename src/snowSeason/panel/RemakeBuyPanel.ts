namespace snowSeason {
    /**
     * 直购
     * 复出直购
     */
    export class RemakeBuyPanel extends ui.snowSeason.panel.RemakeBuyPanelUI {
        private suitIds: xls.pair[] = [
            { v1: 0, v2: 2110064 }, { v1: 0, v2: 2110114 },
            { v1: 0, v2: 2110127 }, { v1: 1, v2: 2110324 },
            { v1: 1, v2: 2110328 }, { v1: 1, v2: 2110252 }, { v1: 1, v2: 2110145 },
            { v1: 1, v2: 2110323 }, { v1: 0, v2: 2110075 }, { v1: 0, v2: 2110132 }, { v1: 1, v2: 2100267 },
            { v1: 1, v2: 2100295 }, { v1: 1, v2: 2100273 }, { v1: 0, v2: 2110134 }, { v1: 0, v2: 2110133 }, { v1: 0, v2: 2110090 }];
        private buyIds: number[] = [3075, 3076, 3058, 3059, 3041, 3044, 3047, 3025, 3028, 3029, 3038, 3016, 3020, 3019, 3023, 3024];
        private ruleId: number = 1195;
        private buyIdsNew: xls.pair[] = [];
        private leftCntMap: util.HashMap<number>;
        private tempArr: number[] = [];

        constructor() {
            super();
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.suitRender);
            this.addEventListeners();
        }

        private refreshUI() {
            this.buyIdsNew = [];
            this.tempArr = [];
            if (!this.leftCntMap) this.leftCntMap = new util.HashMap();
            net.sendAndWait(new pb.cs_common_recharge_panel({ activityId: SnowSeasonModel.instance.activityId })).then((msg: pb.sc_common_recharge_panel) => {
                for (let i = 0; i < msg.leftNumArrs.length; i++) {
                    this.leftCntMap.add(msg.leftNumArrs[i].suitId, msg.leftNumArrs[i].leftNum);
                }
                for (let i = this.suitIds.length - 1; i >= 0; i--) {
                    if (clientCore.ItemsInfo.checkHaveItem(this.suitIds[i].v2)) {
                        this.buyIdsNew.push({ v1: this.buyIds[i], v2: this.leftCntMap.get(this.suitIds[i].v2) });
                        this.tempArr.push(this.buyIds[i]);
                    } else {
                        this.buyIdsNew.unshift({ v1: this.buyIds[i], v2: this.leftCntMap.get(this.suitIds[i].v2) });
                        this.tempArr.unshift(this.buyIds[i]);
                    }
                }
                this.buyIdsNew.unshift({ v1: 0, v2: 0 });
                this.tempArr.unshift(0);
                this.buyIdsNew.push({ v1: 0, v2: 0 });
                this.tempArr.push(0);
                this.list.array = this.buyIdsNew;
                this.list.selectedIndex = -1;
            });
        }

        private suitRender(item: ui.snowSeason.render.RemakeSuitItemUI) {
            if (item.dataSource.v1 == 0) {
                item.visible = false;
                return;
            }
            item.scaleX = item.scaleY = 1.3 - 0.4 * Math.abs(item.x - 315 - this.list.scrollBar.value) / 315;
            let buyInfo = this.suitIds[this.buyIds.indexOf(item.dataSource.v1)].v1;
            let config = xls.get(xls.eventExchange).get(item.dataSource.v1);
            let suit = config.femaleProperty[0].v1;
            item.imgSuit.skin = pathConfig.getSuitImg(suit, clientCore.LocalInfo.sex);
            item.btnBuy.disabled = item.imgGot.visible = clientCore.SuitsInfo.checkHaveSuits(suit);
            item.labSuit.text = clientCore.SuitsInfo.getSuitInfo(suit).suitInfo.name;

            item.labIndex.text = (this.tempArr.indexOf(config.id)) + "/" + (this.buyIdsNew.length - 2);
            item.numTxt.text = item.dataSource.v2 + "";
            if (buyInfo == 0) {
                item.buyBox0.visible = true;
                item.buyBox1.visible = false;
                item.costTxt0.text = config.cost[0].v2 + "";
            } else {
                item.buyBox1.visible = true;
                item.buyBox0.visible = false;
                item.costTxt1.text = config.cost[0].v2 + "";
                item.costTxt2.text = xls.get(xls.eventExchange).get(item.dataSource.v1 + 1).cost[0].v2 + "";
                item.costTxt3.text = xls.get(xls.eventExchange).get(item.dataSource.v1 + 2).cost[0].v2 + "";
            }
            BC.addEvent(this, item.btnBuy, Laya.Event.CLICK, this, this.buyGoods, [config.id]);
        }

        show() {
            clientCore.UIManager.setMoneyIds([SnowSeasonModel.instance.coinid]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年12月24日活动', '【付费】初雪的季节', '打开雪花小铺-复出直购面板');
            this.refreshUI();
            Laya.timer.loop(5000, this, this.refreshUI);
            this.changeBox.visible = false;
            this.arrow.skin = "snowSeason/RemakeBuyPanel/up.png";
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            Laya.timer.clear(this, this.refreshUI);
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
            let configId;
            if (this.suitIds[this.buyIds.indexOf(id)].v1 == 0) {
                configId = id;
            } else {
                if (clientCore.FlowerPetInfo.petType == 3) {
                    configId = id + 2;
                } else if (clientCore.FlowerPetInfo.petType > 0) {
                    configId = id + 1;
                } else {
                    configId = id;
                }
            }
            let coin = xls.get(xls.eventExchange).get(configId).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(configId).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                if (coin == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [SnowSeasonModel.instance.coinNotEnough], caller: this } });
                }
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 2, activityId: SnowSeasonModel.instance.activityId, idxs: [configId] })).then((msg: pb.sc_common_recharge_buy) => {
                            alert.showReward(msg.items);
                            this.refreshUI();
                        })
                    }]
                }
            })
        }

        private onScroll() {
            if (!this.list) return;
            let scroll = this.list.scrollBar;
            this.tipLeft.visible = scroll.value / scroll.max > 0.1;
            this.tipRight.visible = scroll.value / scroll.max < 0.9;
            this.list.selectedIndex++;
        }

        private openChange() {
            // if (this.changeBox.visible) {
            //     this.arrow.skin = "snowSeason/RemakeBuyPanel/up.png";
            //     this.changeBox.visible = false;
            // } else {
            //     this.arrow.skin = "snowSeason/RemakeBuyPanel/down.png";
            //     this.changeBox.visible = true;
            // }
            EventManager.event('SnowSeason_SHOW_EVENT_PANEL', panelType.turnTableDrawNew2);
        }

        private openOther(i: number) {
            if (i == 1) {
                EventManager.event('SnowSeason_SHOW_EVENT_PANEL', panelType.turnTableDrawNew2);
            } else {
                EventManager.event('SnowSeason_SHOW_EVENT_PANEL', panelType.turnTableDrawNew);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openChange);
            // BC.addEvent(this, this.btn0, Laya.Event.CLICK, this, this.openOther, [1]);
            // BC.addEvent(this, this.btn1, Laya.Event.CLICK, this, this.openOther, [2]);
            // BC.addEvent(this, this.tipLeft, Laya.Event.CLICK, this, this.openOther, [1]);
            // BC.addEvent(this, this.tipRight, Laya.Event.CLICK, this, this.openOther, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.leftCntMap.clear();
            this.leftCntMap = null;
            this.removeEventListeners();
            super.destroy();
        }
    }
}