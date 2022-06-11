namespace springOverture {
    /**
     * 沧海寻踪
     * 
     */
    export class RebackDrawPanel extends ui.springOverture.panel.RebackDrawPanelUI {

        private suitIdArr: number[] = [2100263, 2100303, 2100214, 2100073];
        private titleId: number = 3500116;
        private coinId: number = 9900313;
        private ruleId: number = 1164;
        private drawId: number = 1;
        private probilityId: number = 45;
        private _loading: boolean = false;

        constructor() {
            super();
            this.imgSuit1.skin = `unpack/springOverture/${this.suitIdArr[0]}_${clientCore.LocalInfo.sex}.png`;
            this.imgSuit2.skin = `unpack/springOverture/${this.suitIdArr[1]}_${clientCore.LocalInfo.sex}.png`;
            this.addEventListeners();
        }

        private async setUI() {
            this.checkGift();
            let madel = await clientCore.MedalManager.getMedal([MedalConst.REBACK_DRAW_FIRST_HALF1]);
            this.imgTip.visible = madel[0].value == 0;
        }

        show(box: any) {
            SpringOvertureModel.instance.checkCoinRecyle(1, 19);
            clientCore.Logger.sendLog('2022年3月4日活动', '【付费】春日序曲', '打开沧海寻踪面板');
            clientCore.UIManager.setMoneyIds([this.coinId]);
            clientCore.UIManager.showCoinBox();
            EventManager.event(CHANGE_TIME, "time_4_17");
            this.setUI();
            box.addChild(this);
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**展示套装详情 */
        private onTryClick(i: number) {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suitIdArr[i]);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: 8, activityId: SpringOvertureModel.instance.activityId, index: 3 })).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.btnGet.visible = false;
            })
        }

        private changePanel() {
            EventManager.event(CHANGE_PANEL, subpanel.suitBuy);
        }

        /**抽奖 */
        private callClick(num: number) {
            if (this._loading) return; //等待中
            let itemNum = clientCore.ItemsInfo.getItemNum(this.coinId);
            let cost = num;
            if (num == 10 && this.imgTip.visible) cost = 5;
            if (itemNum < cost) {
                alert.showFWords(`${clientCore.ItemsInfo.getItemName(this.coinId)}不足~`);
                this.openBuy();
                return;
            }
            alert.showSmall(`确定消耗${cost}${clientCore.ItemsInfo.getItemName(this.coinId)}进行许愿？`, {
                callBack: {
                    funArr: [() => {
                        if (this._loading) return;
                        this._loading = true;
                        net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: this.drawId, times: num })).then((data: pb.sc_common_activity_draw) => {
                            clientCore.ModuleManager.open("drawReward.DrawRewardShowModule", data.item);
                            SpringOvertureModel.instance.coinCost(cost * 68);
                            this.checkGift();
                            if (this.imgTip.visible && num == 10) {
                                this.backPrice();
                            }
                            this._loading = false;
                        }).catch(() => {
                            this._loading = false;
                        })
                    }], caller: this
                }
            });
        }
        private checkGift() {
            let canGet = false;
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this.suitIdArr[0]);
            if (clientCore.SuitsInfo.checkHaveSuits(this.suitIdArr[0])
                || suitInfo.hasCnt == (suitInfo.clothes.length - 1) && clientCore.ItemsInfo.getItemNum(4003341) == 0) {
                canGet = true;
            }
            this.btnGet.visible = clientCore.TitleManager.ins.get(this.titleId) == null;
            this.btnGet.disabled = !canGet;
        }

        /**恢复价格 */
        private backPrice() {
            clientCore.MedalManager.setMedal([{ id: MedalConst.REBACK_DRAW_FIRST_HALF1, value: 1 }]);
            this.imgTip.visible = false;
        }

        /**打开礼包购买面板 */
        private openBuy(): void {
            alert.showEventBuy([6, 7]);
        }

        /**奖励总览 */
        private async preReward() {
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", this.drawId);
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([this.coinId]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', this.probilityId);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [0]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnCall1, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCall10, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this.btnGailv, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openBuy);
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