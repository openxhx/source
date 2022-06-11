namespace springOverture {
    /**
     * 暮色曙光
     * 套装直购，单套
     */
    export class SuitBuyPanel extends ui.springOverture.panel.SuitBuyPanelUI {
        private baseBuyId: number = 3175;
        private suit: number = 2110623;
        private ruleId: number = 1145;
        private coinId: number = 9900284;
        private giftId: number = 3500117;
        constructor() {
            super();
            this.addEventListeners();
        }

        private async setLimitInfo() {
            await SpringOvertureModel.instance.getSuitLeftCnt();
            this.labCnt.text = "限量：" + SpringOvertureModel.instance.leftCntMap.get(this.suit).toString();
        }

        private setUI() {
            //左套装
            let haveSuit = clientCore.ItemsInfo.checkHaveItem(this.suit);
            this.buyBox.visible = !haveSuit;
            //赠品
            let haveGift = clientCore.ItemsInfo.checkHaveItem(this.giftId);
            this.btnLing.visible = haveSuit && !haveGift;
            this.imgLing.visible = haveSuit && haveGift;
        }

        show(box: any) {
            clientCore.Logger.sendLog('2022年3月18日活动', '【付费】春日序曲', '打开暮色曙光-化兽学院面板');
            this.setUI();
            clientCore.UIManager.setMoneyIds([this.coinId]);
            clientCore.UIManager.showCoinBox();
            this.setLimitInfo();
            EventManager.event(CHANGE_TIME, "time_18_31");
            box.addChild(this);
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**展示套装详情 */
        private onTryClick() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suit);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**购买 */
        private async buyGoods() {
            let configId = this.baseBuyId;
            await SpringOvertureModel.instance.getSuitLeftCnt();
            let leftCnt = SpringOvertureModel.instance.leftCntMap.get(this.suit);
            this.labCnt.text = "限量：" + leftCnt.toString();
            if (leftCnt > 0) {
                configId++;
            }
            let coin = xls.get(xls.eventExchange).get(configId).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(configId).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                if (coin == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { SpringOvertureModel.instance.openCoinGiftBuy() }], caller: this } });
                }
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 10, activityId: SpringOvertureModel.instance.activityId, idxs: [configId] })).then((msg: pb.sc_common_recharge_buy) => {
                            alert.showReward(msg.items);
                            SpringOvertureModel.instance.coinCost(price);
                            // this.imgGot.visible = true;
                            this.setUI();
                        })
                    }]
                }
            })
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: 10, activityId: SpringOvertureModel.instance.activityId, index: 1 })).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.imgLing.visible = true;
                this.btnLing.visible = false;
            })
        }

        private changePanel() {
            
        }

        /**预览背景秀 */
        private onTryGift() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this.giftId], condition: '', limit: '' });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnLing, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buyGoods);
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