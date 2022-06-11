namespace snowSeason {
    /**
     * 直购，特惠价
     */
    export class DisCountBuyPanel extends ui.snowSeason.panel.DisCountBuyPanelUI {

        private buyId: number = 3007;
        private suit1: number = 2110546;
        private giftId: number = 1000161;
        private ruleId: number = 1171;
        private leftNum: number = 100;

        constructor() {
            super();
            this.initUI();
            this.addEventListeners();
        }

        private initUI() {
            let have1 = clientCore.SuitsInfo.getSuitInfo(this.suit1).allGet;
            this.imgGot1.visible = have1;
            this.imgGot2.visible = have1;
            //打包
            this.boxBuy.visible = !have1;
            this.buyBtn1.visible = !have1;
            //赠品
            let have3 = clientCore.ItemsInfo.checkHaveItem(this.giftId);
            this.imgGot3.visible = have3;
            this.btnGet.visible = have1 && !have3;
        }

        async show() {
            clientCore.UIManager.setMoneyIds([SnowSeasonModel.instance.coinid]);
            clientCore.UIManager.showCoinBox();
            await this.refreshOffInfo();
            Laya.timer.loop(5000, this, this.onTime);
            this.timeTxt.visible = util.TimeUtil.formatTimeStrToSec("2021/12/03 08:00:00") - clientCore.ServerManager.curServerTime > 0;
            clientCore.Logger.sendLog('2021年12月3日活动', '【付费】初雪的季节', '打开雪舞轻扬-蔚蓝色的梦面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
            Laya.timer.clear(this, this.onTime);
        }

        refreshPanel() {
            let have1 = clientCore.SuitsInfo.getSuitInfo(this.suit1).allGet;
            if (!have1) {
                this.boxBuy.visible = this.leftNum > 0;
                this.buyBtn1.visible = this.leftNum <= 0;
            }
        }

        /**展示套装详情 */
        private onTryClick() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suit1);
        }

        /**预览背景秀 */
        private onTryGift() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this.giftId], condition: '', limit: '' });
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**购买 */
        private async buyGoods(i: number) {
            if (util.TimeUtil.formatTimeStrToSec("2021/12/03 08:00:00") - clientCore.ServerManager.curServerTime > 0) {
                alert.showFWords("12.3早上8点开启购买~");
                return;
            }
            let coin = xls.get(xls.eventExchange).get(this.buyId).cost[0].v1;
            let price = xls.get(xls.eventExchange).get(this.buyId - i).cost[0].v2;
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, {
                    callBack: {
                        funArr: [SnowSeasonModel.instance.coinNotEnough],
                        caller: this
                    }
                });
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_common_recharge_buy({
                            stage: 1,
                            activityId: SnowSeasonModel.instance.activityId,
                            idxs: [this.buyId - i]
                        })).then((msg: pb.sc_common_recharge_buy) => {
                            alert.showReward(msg.items);
                            this.initUI();
                        })
                    }]
                }
            })
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: 1, activityId: SnowSeasonModel.instance.activityId, index: 8 })).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.imgGot3.visible = true;
                this.btnGet.visible = false;
            });
        }

        /**打开复出直购 */
        private openOther() {
            EventManager.event('SnowSeason_SHOW_EVENT_PANEL', panelType.disCountBuyNew);
        }

        /**秒级刷新 */
        private onTime() {
            if (this.leftNum > 0) {
                this.refreshOffInfo();
            }
        }

        private async refreshOffInfo() {
            return net.sendAndWait(new pb.cs_common_recharge_panel({ activityId: SnowSeasonModel.instance.activityId })).then((msg: pb.sc_common_recharge_panel) => {
                let leftNum = _.find(msg.leftNumArrs, (o) => { return o.suitId == this.suit1 }).leftNum;
                this.leftNum = Math.max(leftNum, 0);
                this.leftTxt.text = this.leftNum + "";
                this.refreshPanel();
            });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryGift);
            BC.addEvent(this, this.buyBtn0, Laya.Event.CLICK, this, this.buyGoods, [0]);
            BC.addEvent(this, this.buyBtn1, Laya.Event.CLICK, this, this.buyGoods, [1]);
            //BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
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