namespace plumYellow {
    /**
     * 摩尔联动
     */
    export class MoleBuyPanel extends ui.plumYellow.panel.MoleBuyPanelUI {
       
        private giftId:number = 152692;
        private ruleId:number = 1210;
        private baseId:number = 3197;

        constructor() {
            super();
           
            this.addEventListeners();
            this.bg.skin = `res/bigPic/moleBg.png`;
            this.line.visible = clientCore.FlowerPetInfo.petType > 0;
            this.btnRule.visible = false;
        }

        show(box: any) {
            clientCore.Logger.sendLog('2022年5月27日活动', '【付费】梅子黄时', '打开摩摩花仙面板');
            clientCore.UIManager.setMoneyIds([9900334 , 0]);
            clientCore.UIManager.showCoinBox();
            EventManager.event(CHANGE_TIME, "time_27_14");
            this.setUI();
            box.addChild(this);
        }

        setUI(){
            this.buyBox.visible = clientCore.ItemsInfo.getItemNum(this.giftId)==0;
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**展示套装详情 */
        private onTryClick(i: number) {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.giftId);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**购买 */
        private async buyGoods() {
            let configId;
            if (clientCore.FlowerPetInfo.petType == 3) {
                configId =this.baseId + 2;
            } else if (clientCore.FlowerPetInfo.petType > 0) {
                configId =this.baseId + 1;
            } else {
                configId =this.baseId;
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
                        net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 1, activityId: PlumYellowModel.instance.activityId, idxs: [configId] })).then((msg: pb.sc_common_recharge_buy) => {
                            alert.showReward(msg.items);
                            this.setUI();
                        })
                    }]
                }
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.tryBtn, Laya.Event.CLICK, this, this.onTryClick);
            BC.addEvent(this, this.buyBtn, Laya.Event.CLICK, this, this.buyGoods);
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