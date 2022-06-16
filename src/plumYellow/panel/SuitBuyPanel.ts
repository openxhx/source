namespace plumYellow {
    export class SuitBuyData {
        public baseBuyId: number;
        public suit: number;
        public ruleId: number;
        public coinId: number;
        public giftId: number[];
        public stage: number;
        public time: string;
        public index: number
        constructor(baseBuyId: number, suit: number, ruleId: number, coinId: number, giftId: number[], stage: number, time: string, index: number) {
            this.baseBuyId = baseBuyId;
            this.suit = suit;
            this.ruleId = ruleId;
            this.coinId = coinId;
            this.giftId = giftId;
            this.stage = stage;
            this.time = time;
            this.index = index;
        }
    }
    /**
     * 套装直购，单套
     */
    export class SuitBuyPanel extends ui.plumYellow.panel.SuitBuyPanelUI {
        private cfg: SuitBuyData;
        private giftArr:number[] = [145284 , 145297];
        constructor(data: SuitBuyData) {
            super();
            this.cfg = data;
            this.addEventListeners();
            this.imgSuit1.skin = `res/rechargeCloth/${this.cfg.suit}_1.png`;
            this.imgSuit2.skin = `res/rechargeCloth/${this.cfg.suit}_2.png`;
        }

        private setUI() {
            //左套装
            let haveSuit = clientCore.ItemsInfo.checkHaveItem(this.cfg.suit);
            this.buyBox.visible = !haveSuit;
            //赠品
            let haveGift;
            haveGift = clientCore.ItemsInfo.checkHaveItem(this.cfg.giftId[0]);
            this.btnLing.visible = haveSuit && !haveGift;
            this.line.visible = clientCore.FlowerPetInfo.petType > 0;
            haveGift = clientCore.ItemsInfo.checkHaveItem(this.giftArr[clientCore.LocalInfo.sex-1]);
            this.getBtn.visible = haveSuit && !haveGift;
            this.gift1.skin = `plumYellow/SuitBuyPanel/gift_${clientCore.LocalInfo.sex}.png`
        }

        show(box: any) {
            clientCore.Logger.sendLog('2022年6月10日活动', '【付费】梅子黄时', '打开春逝夏至-见习爱神面板');
            this.setUI();
            clientCore.UIManager.setMoneyIds([this.cfg.coinId, 0]);
            clientCore.UIManager.showCoinBox();
            EventManager.event(CHANGE_TIME, this.cfg.time);
            box.addChild(this);
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**展示套装详情 */
        private onTryClick(i: number) {
            if (i == 0) {
                clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.cfg.suit);
            } else {
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.cfg.giftId, condition: '' });
            }
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.cfg.ruleId);
        }

        /**购买 */
        private async buyGoods() {
            let configId;
            if (clientCore.FlowerPetInfo.petType == 3) {
                configId =this.cfg.baseBuyId + 2;
            } else if (clientCore.FlowerPetInfo.petType > 0) {
                configId =this.cfg.baseBuyId + 1;
            } else {
                configId =this.cfg.baseBuyId;
            }
            let coin = xls.get(xls.eventExchange).get(configId).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(configId).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                if (coin == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { PlumYellowModel.instance.openCoinGiftBuy() }], caller: this } });
                }
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_common_recharge_buy({ stage: (this.cfg.stage), activityId: PlumYellowModel.instance.activityId, idxs: [configId] })).then((msg: pb.sc_common_recharge_buy) => {
                            alert.showReward(msg.items);
                            PlumYellowModel.instance.coinCost(price);
                            // this.imgGot.visible = true;
                            this.setUI();
                        })
                    }]
                }
            })
        }

        /**领取赠品 */
        private getGift(i:number) {
            if(i == 0){
                net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: (this.cfg.stage), activityId: PlumYellowModel.instance.activityId, index: this.cfg.index })).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                    alert.showReward(msg.items);
                    this.btnLing.visible = false;
                })
            }else{
                net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: (this.cfg.stage), activityId: PlumYellowModel.instance.activityId, index: 2 })).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                    alert.showReward(msg.items);
                    this.getBtn.visible = false;
                })
            }
        }

        private changePanel() {
            EventManager.event(CHANGE_PANEL, subpanel.suitBuy1);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnLing, Laya.Event.CLICK, this, this.getGift , [0]);
            BC.addEvent(this, this.getBtn, Laya.Event.CLICK, this, this.getGift , [1]);
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onTryClick, [0]);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buyGoods);
            BC.addEvent(this, this.otherBtn, Laya.Event.CLICK, this, this.changePanel);
            //BC.addEvent(this, this.tab1, Laya.Event.CLICK, this, this.changePanel, [1]);
            //BC.addEvent(this, this.tab2, Laya.Event.CLICK, this, this.changePanel, [2]);
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