namespace bigCharge {
    /**
     * 抽奖
     * 复出抽奖
     */
    export class RemakeDrawPanel extends ui.bigCharge.panel.RemakeDrawPanelUI {
        /** 抽奖ID*/
        readonly DRAW_ID: number = 10;
        /**概率id */
        readonly PROBABILITY_ID: number = 29;
        /** 抽奖使用的道具ID*/
        readonly DRAW_ITEM_ID: number = 9900223;
        readonly SUIT_ID: number[] = [2110005, 2100204, 2100030, 2100060];
        readonly GIFT_ID: number = 3500071;
        private ruleId: number = 1192;
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _buy: BuyPanel;
        /**充值礼包标志 */
        private _chargeFlag: rollColetionCharge = rollColetionCharge.qingyu;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this.addEventListeners();
        }
        show() {
            clientCore.MedalManager.getMedal([MedalConst.REMAKE_DRAW_OPEN]).then((msg: pb.ICommonData[]) => {
                if (msg[0].value == 0) {
                    clientCore.MedalManager.setMedal([{ id: MedalConst.REMAKE_DRAW_OPEN, value: 1 }]);
                    alert.showSmall('亲爱的小花仙，我们已将你口袋里剩余的海星镖以及黑玫瑰按照1：1的比例转换为青羽，快去参加活动吧~');
                }
            })
            clientCore.UIManager.setMoneyIds([this.DRAW_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            this.checkGift();
            clientCore.Logger.sendLog('2021年8月27日活动', '【付费】夏日终曲第九期', '打开绝版复出抽奖面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**检查赠品状态 */
        private checkGift() {
            let canGet = false;
            for (let i: number = 0; i < this.SUIT_ID.length; i++) {
                if (clientCore.SuitsInfo.checkHaveSuits(this.SUIT_ID[i])) {
                    canGet = true;
                    break;
                }
            }
            this.imgTip.visible = !canGet;
            this.btnGet.visible = canGet && !clientCore.TitleManager.ins.checkHaveTitle(this.GIFT_ID);
        }

        /**奖励总览 */
        private async preReward() {
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", this.DRAW_ID);
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([this.DRAW_ITEM_ID]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', this.PROBABILITY_ID);
        }

        //#region 抽奖
        private _loading: boolean = false;
        private callClick(num: number) {
            if (this._loading) return; //等待中
            let itemNum = clientCore.ItemsInfo.getItemNum(this.DRAW_ITEM_ID);
            let cost = num;
            if (itemNum < cost) {
                alert.showFWords(`${clientCore.ItemsInfo.getItemName(this.DRAW_ITEM_ID)}不足~`);
                return;
            }
            alert.showSmall(`确定消耗${cost}${clientCore.ItemsInfo.getItemName(this.DRAW_ITEM_ID)}进行扇动？`, {
                callBack: {
                    funArr: [() => {
                        this._loading = true;
                        net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: this.DRAW_ID, times: num })).then((data: pb.sc_common_activity_draw) => {
                            if (num == 1) {
                                this.getOne(data.item[0]);
                            }
                            else {
                                this.getAll(data.item);
                            }
                            BigChargeModel.instance.coinCost(168 * num);
                            this.checkGift();
                        }).catch(() => {
                            this._loading = false;
                        })
                    }], caller: this
                }
            });
        }
        private async getOne(rwdInfo: pb.IdrawReward) {
            let itemInfo = parseReward(rwdInfo);
            if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                await alert.showDrawClothReward(itemInfo.reward.id);
            }
            else {
                clientCore.DialogMgr.ins.open(this._onePanel, false);
                this._onePanel.showReward(rwdInfo);
            }
            this._loading = false;
        }

        private getAll(treeInfos: pb.IdrawReward[]) {
            clientCore.DialogMgr.ins.open(this._tenPanel, false);
            this._tenPanel.showReward(treeInfos, this, this.waitOnePanelClose);
            this._loading = false;
        }

        private async waitOnePanelClose(rwdInfo: pb.GodTree) {
            return new Promise((ok) => {
                this._onePanel.on(Laya.Event.CLOSE, this, ok);
                this.getOne(rwdInfo)
            })
        }
        //#endregion

        /**展示套装详情 */
        private onTryClick(idx: number) {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.SUIT_ID[idx - 1]);
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_summer_recharge_get_extra_reward({ type: 16 })).then((msg: pb.sc_summer_recharge_get_extra_reward) => {
                alert.showReward(msg.items);
                this.btnGet.visible = false;
            })
        }

        /**打开复出直购 */
        private openOther() {
            EventManager.event('BIG_CHARGE_SHOW_EVENT_PANEL', panelType.remakeBuy);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**打开礼包购买面板 */
        private openBuy(): void {
            this._buy = this._buy || new BuyPanel();
            this._buy.show([1,2]);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
            BC.addEvent(this, this.btnGailv, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.btnCallOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCallTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openBuy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            this._onePanel?.destroy();
            this._tenPanel?.destroy();
            this._buy?.destroy();
            this._buy = this._onePanel = this._tenPanel = null;
        }
    }
}