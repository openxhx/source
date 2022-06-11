namespace summerDream {
    export class ActBuy2Panel extends ui.summerDream.panel.SDActBuy2UI {
        //2635,2636,2637,2638
        //2639,2640,2641
        private buyId1: number;
        private buyId2: number;
        private suit1: number = 2110291;
        private suit2: number = 2110384;
        private stageId: number = 1100079;
        public otherPanel: ActBuy1Panel;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            if (clientCore.LocalInfo.srvUserInfo.regtime < util.TimeUtil.formatTimeStrToSec('2020-6-1 00:00:00')) {
                this.buyId1 = 2644;
            } else if (clientCore.LocalInfo.srvUserInfo.regtime < util.TimeUtil.formatTimeStrToSec('2020-8-1 00:00:00')) {
                this.buyId1 = 2638;
            } else if (clientCore.LocalInfo.srvUserInfo.regtime < util.TimeUtil.formatTimeStrToSec('2020-11-1 00:00:00')) {
                this.buyId1 = 2637;
            } else if (clientCore.LocalInfo.srvUserInfo.regtime < util.TimeUtil.formatTimeStrToSec('2021-2-1 00:00:00')) {
                this.buyId1 = 2636;
            } else {
                this.buyId1 = 2635;
            }
            if (clientCore.FlowerPetInfo.petType == 3) {
                this.buyId2 = 2641;
            } else if (clientCore.FlowerPetInfo.petType > 0) {
                this.buyId2 = 2640;
            } else {
                this.buyId2 = 2639;
            }
            this.initUI();
            this.addEventListeners();
        }

        private initUI() {
            this.labCosr0.text = "" + xls.get(xls.eventExchange).get(2635).cost[0].v2;
            this.labCost1.text = "" + xls.get(xls.eventExchange).get(this.buyId1).cost[0].v2;
            this.labCostV0.text = "" + xls.get(xls.eventExchange).get(2639).cost[0].v2;
            this.labCostV1.text = "" + xls.get(xls.eventExchange).get(2640).cost[0].v2;
            this.labCostV3.text = "" + xls.get(xls.eventExchange).get(2641).cost[0].v2;

            this.setUI();
        }

        private setUI() {
            //暖心熏衣茶
            let have1 = clientCore.SuitsInfo.getSuitInfo(this.suit1).allGet;
            this.imgGot1.visible = have1;
            this.boxBuy1.visible = !have1;
            //莲灯荷语套装
            let have2 = clientCore.SuitsInfo.getSuitInfo(this.suit2).allGet;
            this.imgGot2.visible = have2;
            this.boxBuy2.visible = !have2;
            //背景秀
            let have3 = clientCore.ItemsInfo.checkHaveItem(this.stageId);
            this.imgGot3.visible = have3;
            this.btnGet.visible = have1 && have2 && !have3;
        }

        show() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【付费】夏夜如梦', '打开莲灯荷语面板');
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

        /**预览舞台和背景秀 */
        private preBgStage() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.stageId, condition: '', limit: '' });
        }

        /**展示套装详情 */
        private onTryClick(index: number) {
            let suitId = index == 1 ? this.suit1 : this.suit2;
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", suitId);
        }

        /**帮助说明 */
        private showRule(id: number) {
            alert.showRuleByID(id);
        }

        /**购买 */
        private buyGoods(idx: number) {
            let goodsId = idx == 1 ? this.buyId1 : this.buyId2;
            let price = xls.get(xls.eventExchange).get(goodsId).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            if (have < price) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            alert.showSmall(`是否花费${price}灵豆购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_summer_night_buy_cloth({ period: 5, idxs: [goodsId], getFlag: 0 })).then((msg: pb.sc_summer_night_buy_cloth) => {
                            alert.showReward(msg.items);
                            this.setUI();
                        })
                    }]
                }
            })
        }

        /**领取舞台 */
        private getGift() {
            net.sendAndWait(new pb.cs_summer_night_buy_cloth({ period: 5, idxs: [], getFlag: 1 })).then((msg: pb.sc_summer_night_buy_cloth) => {
                alert.showReward(msg.items);
                this.imgGot3.visible = true;
                this.btnGet.visible = false;
            })
        }

        private showPanel2() {
            this.visible = false;
            this.otherPanel.show();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule, [1171]);
            BC.addEvent(this, this.btnOff, Laya.Event.CLICK, this, this.showRule, [1173]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.buyGoods, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.buyGoods, [2]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTryStage, Laya.Event.CLICK, this, this.preBgStage);
            BC.addEvent(this, this.btnPanel, Laya.Event.CLICK, this, this.showPanel2);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            this.otherPanel.destroy();
            this.otherPanel = null;
            super.destroy();
        }
    }
}