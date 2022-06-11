namespace yearSong {
    /**
     * 直购，特惠价
     */
    export class DisCountBuyNewPanel extends ui.yearSong.panel.DisCountBuyNewPanelUI {

        private buyId3: number = 2944;
        private suit1: number = 2110511;
        private giftId: number = 1000151;
        private giftId1: number = 143786;
        private ruleId: number = 1134;

        constructor() {
            super();
            this.initUI();
            this.addEventListeners();
        }

        private initUI() {
            let xlsConfig = xls.get(xls.eventExchange);
            this.labPrice3_0.text = "" + xlsConfig.get(this.buyId3-1).cost[0].v2;
            this.labPrice3_1.text = "" + xlsConfig.get(this.buyId3).cost[0].v2;
            this.icon3_0.skin = this.icon3_1.skin = clientCore.ItemsInfo.getItemIconUrl(YearSongModel.instance.coinid);
            this.giftId1 = clientCore.LocalInfo.sex == 1? this.giftId1:this.giftId1+10;
            this.gift.skin = clientCore.LocalInfo.sex == 1?"yearSong/DisCountBuyNewPanel/gift_nv.png" : "yearSong/DisCountBuyNewPanel/gift_nan.png";
            this.setUI();
        }


        private setUI() {
            let have1 = clientCore.SuitsInfo.getSuitInfo(this.suit1).allGet;
            this.imgGot1.visible = have1;
            this.imgGot2.visible = have1;
            //打包
            this.boxBuy3.visible = !have1;
            //赠品
            // let have3: boolean = clientCore.ItemsInfo.checkHaveItem(this.giftId);
            let have3 = clientCore.ItemsInfo.checkHaveItem(this.giftId);
            this.imgGot3.visible = have3;
            this.btnGet.visible = have1 && !have3;
        }

        async show() {
            clientCore.UIManager.setMoneyIds([YearSongModel.instance.coinid , 0]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年10月22日活动', '【付费】岁月如歌', '打开大乐必易-喵语轻喃面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**展示套装详情 */
        private onTryClick() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suit1);
        }

        /**预览背景秀 */
        private onTryGift(i:number) {
            if(i==0){
                clientCore.ModuleManager.open('rewardDetail.PreviewModule',this.giftId1);
            }else{
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', {id: [this.giftId], condition: '', limit: ''});
            }
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**购买 */
        private buyGoods() {
            let coin = xls.get(xls.eventExchange).get(this.buyId3).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(this.buyId3).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, {
                    callBack: {
                        funArr: [YearSongModel.instance.coinNotEnough],
                        caller: this
                    }
                });
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_common_recharge_buy({
                            stage: 4,
                            activityId: 197,
                            idxs: [this.buyId3]
                        })).then((msg: pb.sc_common_recharge_buy) => {
                            alert.showReward(msg.items);
                            YearSongModel.instance.coinCost(price);
                            this.setUI();
                        })
                    }]
                }
            })
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({stage: 4 , activityId:197 , index:5})).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.imgGot3.visible = true;
                this.btnGet.visible = false;
            });
        }

        /**打开复出直购 */
        private openOther() {
            EventManager.event('YearSong_SHOW_EVENT_PANEL', panelType.disCountBuy);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryGift , [0]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onTryGift , [1]);
            BC.addEvent(this, this.btnBuy3, Laya.Event.CLICK, this, this.buyGoods);
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