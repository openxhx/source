namespace summerDream {
    export class ActBuy1Panel extends ui.summerDream.panel.SDActBuy1UI {
        //2580-2588
        public otherPanel: ActBuy2Panel;
        private buyId1: number;
        private buyId2: number;
        private suit1: number = 2110389;
        private suit2: number = 2110390;
        private handId: number;
        constructor() {
            super();
            this.imgHand1.visible = this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgHand2.visible = this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.labHand.text = clientCore.LocalInfo.sex == 1 ? "甜品梦茶杯兔" : "甜品梦兔耳伞";
            this.handId = clientCore.LocalInfo.sex == 1 ? 125962 : 125961;
            if (clientCore.FlowerPetInfo.petType == 3) {
                this.buyId1 = 2649;
                this.buyId2 = 2655;
            } else if (clientCore.FlowerPetInfo.petType > 0) {
                this.buyId1 = 2647;
                this.buyId2 = 2653;
            } else {
                this.buyId1 = 2645;
                this.buyId2 = 2651;
            }
            this.initUI();
            this.addEventListeners();
            this.otherPanel = new ActBuy2Panel();
            this.otherPanel.otherPanel = this;
            this.otherPanel.visible = false;
        }

        private initUI() {
            this.labCost10.text = "" + xls.get(xls.eventExchange).get(2645).cost[0].v2;
            this.labCost11.text = "" + xls.get(xls.eventExchange).get(2647).cost[0].v2;
            this.labCost13.text = "" + xls.get(xls.eventExchange).get(2649).cost[0].v2;
            this.labCost20.text = "" + xls.get(xls.eventExchange).get(2651).cost[0].v2;
            this.labCost21.text = "" + xls.get(xls.eventExchange).get(2653).cost[0].v2;
            this.labCost23.text = "" + xls.get(xls.eventExchange).get(2655).cost[0].v2;
            this.setUI();
        }

        private setUI() {
            //深森隐仙套装
            let have1 = clientCore.SuitsInfo.getSuitInfo(this.suit1).allGet;
            this.imgGot1.visible = have1;
            this.boxBuy1.visible = !have1;
            //邦尼的甜品梦套装
            let have2 = clientCore.SuitsInfo.getSuitInfo(this.suit2).allGet;
            this.imgGot2.visible = have2;
            this.boxBuy2.visible = !have2;
            //手持
            let have3 = clientCore.ItemsInfo.checkHaveItem(this.handId);
            this.imgGot3.visible = have3;
            this.btnGet.visible = have1 && have2 && !have3;
        }

        show() {
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年6月4日活动', '【付费】夏夜如梦', '打开深森隐仙面板');
            this.visible = true;
            if (!this.otherPanel.parent) {
                this.parent.addChild(this.otherPanel);
            }
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.visible = false;
            this.otherPanel.visible = false;
        }

        private closeClick() {
            EventManager.event("SUMMER_DREAM_CLOSE_ACTIVITY");
            this.hide();
        }

        /**展示套装详情 */
        private onTryClick(index: number) {
            let id = index == 1 ? this.suit1 : this.suit2;
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", id);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1160);
        }

        /**购买 */
        private buyGoods(idx: number) {
            let configId = idx == 1 ? this.buyId1 : this.buyId2;
            let off = idx == 1 ? this.imgGot2.visible : this.imgGot1.visible;
            if (off) configId++;
            let price = xls.get(xls.eventExchange).get(configId).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            if (have < price) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            alert.showSmall(`是否花费${price}灵豆购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_summer_night_buy_cloth({ period: 6, idxs: [configId], getFlag: 0 })).then((msg: pb.sc_summer_night_buy_cloth) => {
                            alert.showReward(msg.items);
                            this.setUI();
                        })
                    }]
                }
            })
        }

        /**打开面板1 */
        private showPanel1() {
            this.visible = false;
            this.otherPanel.show();
        }

        /**领取头像框 */
        private getGift() {
            net.sendAndWait(new pb.cs_summer_night_buy_cloth({ period: 6, idxs: [], getFlag: 1 })).then((msg: pb.sc_summer_night_buy_cloth) => {
                alert.showReward(msg.items);
                this.imgGot3.visible = true;
                this.btnGet.visible = false;
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnPanel1, Laya.Event.CLICK, this, this.showPanel1);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.buyGoods, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.buyGoods, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            this.otherPanel = null;
            super.destroy();
        }
    }
}