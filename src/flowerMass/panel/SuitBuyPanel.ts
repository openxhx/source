namespace flowerMass {
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
    export class SuitBuyPanel extends ui.flowerMass.panel.SuitBuyPanelUI {
        private cfg: SuitBuyData;
        constructor(data: SuitBuyData) {
            super();
            this.cfg = data;
            this.addEventListeners();
        }

        private async setLimitInfo() {
            await FlowerMassModel.instance.getSuitLeftCnt();
            this.labCnt.text = FlowerMassModel.instance.leftCntMap.get(this.cfg.suit).toString();
            this.line.y = FlowerMassModel.instance.leftCntMap.get(this.cfg.suit) > 0 ? 69 : 101;
        }

        private setUI() {
            //左套装
            let haveSuit = clientCore.ItemsInfo.checkHaveItem(this.cfg.suit);
            this.buyBox.visible = !haveSuit;
            this.labCnt.visible = !haveSuit;
            //赠品
            let haveGift ;
            if(this.cfg.stage != 3){
                 haveGift = clientCore.ItemsInfo.checkHaveItem(this.cfg.giftId[0]);
            }else{
                 haveGift = clientCore.UserHeadManager.instance.getOneInfoById(this.cfg.giftId[0]).have;
            }
            this.btnLing.visible = haveSuit && !haveGift;
            this.imgLing.visible = haveSuit && haveGift;
            this.setTab();
        }

        setTab(){
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (curTime < util.TimeUtil.formatTimeStrToSec("2022-5-6 00:00:00")) {
                if (this.cfg.stage == 1) {
                    this.tab_di1.skin = "flowerMass/SuitBuyPanel/di0.png";
                    this.tab_di2.skin = "flowerMass/SuitBuyPanel/di1.png"
                    this.tab_name1.skin = "flowerMass/SuitBuyPanel/po_bing_xue_rong0.png";
                    this.tab_name2.skin = "flowerMass/SuitBuyPanel/hua_lang_xie_hou1.png";
                } else {
                    this.tab_di1.skin = "flowerMass/SuitBuyPanel/di1.png";
                    this.tab_di2.skin = "flowerMass/SuitBuyPanel/di0.png"
                    this.tab_name1.skin = "flowerMass/SuitBuyPanel/po_bing_xue_rong1.png";
                    this.tab_name2.skin = "flowerMass/SuitBuyPanel/hua_lang_xie_hou0.png";
                }
            }else{
                if (this.cfg.stage == 2) {
                    this.tab_di1.skin = "flowerMass/SuitBuyPanel/di0.png";
                    this.tab_di2.skin = "flowerMass/SuitBuyPanel/di1.png"
                    this.tab_name1.skin = "flowerMass/SuitBuyPanel/gao_ta_xue_zhe0.png";
                    this.tab_name2.skin = "flowerMass/SuitBuyPanel/po_bing_xue_rong1.png";
                } else {
                    this.tab_di1.skin = "flowerMass/SuitBuyPanel/di1.png";
                    this.tab_di2.skin = "flowerMass/SuitBuyPanel/di0.png"
                    this.tab_name1.skin = "flowerMass/SuitBuyPanel/gao_ta_xue_zhe1.png";
                    this.tab_name2.skin = "flowerMass/SuitBuyPanel/po_bing_xue_rong0.png";
                }
            }
            this.imgSuit1.skin = `unpack/flowerMass/${this.cfg.suit}_1.png`;
            this.imgSuit2.skin = `unpack/flowerMass/${this.cfg.suit}_2.png`;
            this.gift.skin = `flowerMass/SuitBuyPanel/gift${this.cfg.stage}.png`;
            this.giftName.skin = `flowerMass/SuitBuyPanel/gift_name${this.cfg.stage}.png`;
            this.tip.skin = `flowerMass/SuitBuyPanel/tip${this.cfg.stage}.png`;
            this.price.skin = `flowerMass/SuitBuyPanel/di_price${this.cfg.stage}.png`;
            this.suitName.skin = `flowerMass/SuitBuyPanel/suit_name${this.cfg.stage}.png`;
            this.tab2.visible = false;
        }

        show(box: any) {
            if(this.cfg.stage == 1){
                clientCore.Logger.sendLog('2022年4月22日活动', '【付费】小花仙集合啦', '打开直购精选-画廊邂逅面板');
            }else if(this.cfg.stage == 2){
                clientCore.Logger.sendLog('2022年4月29日活动', '【付费】小花仙集合啦', '打开直购精选-破冰雪融面板');
            }else{
                clientCore.Logger.sendLog('2022年5月6日活动', '【付费】小花仙集合啦', '打开直购精选-高塔学者面板');
            }
            this.setUI();
            clientCore.UIManager.setMoneyIds([this.cfg.coinId, 0]);
            clientCore.UIManager.showCoinBox();
            this.setLimitInfo();
            EventManager.event(CHANGE_TIME, this.cfg.time);
            box.addChild(this);
            this.btnTry1.visible = this.cfg.stage != 3;
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
            let configId = this.cfg.baseBuyId;
            await FlowerMassModel.instance.getSuitLeftCnt();
            let leftCnt = FlowerMassModel.instance.leftCntMap.get(this.cfg.suit);
            this.labCnt.text = leftCnt.toString();
            if (leftCnt > 0) {
                configId++;
            }
            this.line.y = leftCnt > 0 ? 69 : 101;
            let coin = xls.get(xls.eventExchange).get(configId).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(configId).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                if (coin == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { FlowerMassModel.instance.openCoinGiftBuy() }], caller: this } });
                }
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_common_recharge_buy({ stage: (this.cfg.index), activityId: FlowerMassModel.instance.activityId, idxs: [configId] })).then((msg: pb.sc_common_recharge_buy) => {
                            alert.showReward(msg.items);
                            FlowerMassModel.instance.coinCost(price);
                            // this.imgGot.visible = true;
                            this.setUI();
                        })
                    }]
                }
            })
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: (this.cfg.index), activityId: FlowerMassModel.instance.activityId, index: 1 })).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.imgLing.visible = true;
                this.btnLing.visible = false;
                clientCore.UserHeadManager.instance.refreshAllHeadInfo();
            })
        }

        private changePanel(i: number) {
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            if (curTime < util.TimeUtil.formatTimeStrToSec("2022-5-6 00:00:00")) {
                if (i == 1) {
                    if (this.cfg.stage == 1) {
                        EventManager.event(CHANGE_PANEL, subpanel.suitBuy1);
                    }
                } else {
                    if (this.cfg.stage == 2) {
                        EventManager.event(CHANGE_PANEL, subpanel.suitBuy);
                    }
                }
            }else{
                if (i == 1) {
                    if (this.cfg.stage == 2) {
                        EventManager.event(CHANGE_PANEL, subpanel.suitBuy2);
                    }
                } else {
                    if (this.cfg.stage == 3) {
                        EventManager.event(CHANGE_PANEL, subpanel.suitBuy1);
                    }
                }
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnLing, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onTryClick, [0]);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buyGoods);
            BC.addEvent(this, this.tab1, Laya.Event.CLICK, this, this.changePanel, [1]);
            BC.addEvent(this, this.tab2, Laya.Event.CLICK, this, this.changePanel, [2]);
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