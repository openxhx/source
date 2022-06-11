namespace flowerMass {
    /**本周主打数据 */
    export class MainSellData {
        /**期数 */
        public phase: number
        /**帮助说明 */
        public ruleId: number;
        /**奖池套装 */
        public suits: number[];
        /**抽奖功能id */
        public drawId: number;
        /**概率说明id */
        public probabilityId: number;
        /**抽奖代币 */
        public coin: number;
        /**额外奖励id */
        public giftId: number;
        /**额外奖励领取凭证 */
        public giftToken: number[];
        /**首次半价勋章 */
        public offMedal: number;
        /**礼包id */
        public rechangeId: number[];
        /**活动时间 */
        public time: string;

        constructor(phase: number, ruleId: number, suits: number[], drawId: number, proId: number, coin: number, giftId: number, giftToken: number[], offMedal: number, rechargeId: number[], time: string) {
            this.phase = phase;
            this.ruleId = ruleId;
            this.suits = suits;
            this.drawId = drawId;
            this.probabilityId = proId;
            this.coin = coin;
            this.giftId = giftId;
            this.giftToken = giftToken;
            this.offMedal = offMedal;
            this.rechangeId = rechargeId;
            this.time = time;
        }
    }
    /**
     * 本周主打
     */
    export class MainSellPanel {
        /**UI面板 */
        private mainUI: any;
        /**相关数据 */
        private cfg: MainSellData;

        private _loading: boolean = false;
        private viewMoveCd: number = 5;
        private onMove: boolean = false;
        private gotFaery: boolean;
        private faeryCnt: number = 100;
        constructor(ui: any, data: MainSellData) {
            this.mainUI = ui;
            this.cfg = data;
            this.initUI();
            this.addEventListeners();
        }

        private async initUI() {
            this.mainUI.imgFaery.skin = `unpack/flowerMass/imgFaery.png`;
            this.mainUI.imgSuit1.skin = `unpack/flowerMass/${this.cfg.suits[0]}_${clientCore.LocalInfo.sex}.png`;
            this.mainUI.imgSuit2.skin = `unpack/flowerMass/${this.cfg.suits[1]}_${clientCore.LocalInfo.sex}.png`;
            if (this.cfg.phase == 1) {
                let madel = await clientCore.MedalManager.getMedal([this.cfg.offMedal]);
                this.mainUI.imgTip.visible = madel[0].value == 0;
            } else {
            }
            this.checkGift();
        }

        show(box: any) {
            clientCore.UIManager.setMoneyIds([this.cfg.coin , 0]);
            clientCore.UIManager.showCoinBox();
            EventManager.event(CHANGE_TIME, this.cfg.time);
            this.checkGift();
            //this.checkOther();
            box.addChild(this.mainUI);
            if (this.cfg.phase == 1) {
                clientCore.Logger.sendLog('2021年4月8日活动', '【付费】小花仙集合吧', '打开本周主打面板');
                this.getFaeryNumber();
                net.listen(pb.sc_jackpot_draw_get_reward_notify, this, this.onFaeryGot);
            } else {
                clientCore.Logger.sendLog('2022年1月28日活动', '【付费】春日序曲第四期', '打开本周主打-光阴靡丽面板');
            }
            FlowerMassModel.instance.checkCoinRecyle(1);
        }

        hide() {
            if (this.cfg.phase == 1) {
                net.unListen(pb.sc_jackpot_draw_get_reward_notify, this, this.onFaeryGot);
            }
            clientCore.UIManager.releaseCoinBox();
            this.mainUI.removeSelf();
        }

        private getFaeryNumber() {
            net.sendAndWait(new pb.cs_get_jackpot_draw_item_info({ itemId: 2300072 })).then((msg: pb.sc_get_jackpot_draw_item_info) => {
                this.mainUI.labCnt.text = "限量剩余:" + msg.leftNum;
                this.faeryCnt = msg.leftNum;
            })
        }

        /**花精灵限量 */
        private onFaeryGot(msg: pb.sc_jackpot_draw_get_reward_notify) {
            if (msg.itemId == 2300072) {
                this.mainUI.labCnt.text = "限量剩余:" + msg.leftNum;
                this.faeryCnt = msg.leftNum;
            }
        }

        // /**检查同期活动 */
        // private checkOther() {
        //     this.mainUI.boxOther.visible = false;
        // }

        /**检查赠品状态 */
        private checkGift() {
            if (!this.cfg.giftId) return;
            let canGet = false;
            if (this.cfg.phase == 1) {
                for (let i = 0; i < this.cfg.suits.length; i++) {
                    canGet = clientCore.SuitsInfo.checkHaveSuits(this.cfg.suits[i]);
                    if (canGet) break;
                }
                this.mainUI.btnGet.visible = canGet && !clientCore.TitleManager.ins.checkHaveTitle(this.cfg.giftId);
            } else {
                canGet = clientCore.SuitsInfo.checkHaveSuits(this.cfg.suits[0]);
                this.mainUI.btnGet.visible = canGet && !this.gotFaery;
            }
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: this.cfg.giftToken[0], activityId: FlowerMassModel.instance.activityId, index: this.cfg.giftToken[1] })).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.mainUI.btnGet.visible = false;
                if (this.cfg.phase == 1) {
                    clientCore.UserHeadManager.instance.refreshAllHeadInfo();
                } else {
                    clientCore.MedalManager.setMedal([{ id: MedalConst.MAIN_SELL_GET_FAERY, value: 1 }]);
                    this.gotFaery = true;
                }
            })
        }

        /**奖励总览 */
        private async preReward() {
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", this.cfg.drawId);
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([this.cfg.coin]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', this.cfg.probabilityId);
        }

        /**抽奖 */
        private callClick(num: number) {
            if (this._loading) return; //等待中
            let itemNum = clientCore.ItemsInfo.getItemNum(this.cfg.coin);
            let cost = num;
            if (num == 10 && this.mainUI.imgTip.visible) cost = 5;
            if (itemNum < cost) {
                alert.showFWords(`${clientCore.ItemsInfo.getItemName(this.cfg.coin)}不足~`);
                this.openBuy();
                return;
            }
            alert.showSmall(`确定消耗${cost}${clientCore.ItemsInfo.getItemName(this.cfg.coin)}进行召唤？`, {
                callBack: {
                    funArr: [() => {
                        if (this._loading) return;
                        this._loading = true;
                        net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: this.cfg.drawId, times: num })).then((data: pb.sc_common_activity_draw) => {
                            clientCore.ModuleManager.open("drawReward.DrawRewardShowModule", data.item);
                            FlowerMassModel.instance.coinCost(cost * 68);
                            this.checkGift();
                            if (this.mainUI.imgTip.visible && num == 10) {
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

        /**恢复价格 */
        private backPrice() {
            clientCore.MedalManager.setMedal([{ id: this.cfg.offMedal, value: 1 }]);
            this.mainUI.imgTip.visible = false;
        }

        /**打开礼包购买面板 */
        private openBuy(): void {
            alert.showEventBuy(this.cfg.rechangeId);
        }

        /**展示套装详情 */
        private onTryClick(id: number) {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.cfg.suits[id - 1]);
        }

        /**界面移动，左移1，右移-1 */
        private async viewMove(flag: number) {
            if (this.onMove) return;
            this.onMove = true;
            this.viewMoveCd = 5;
            if (this.mainUI.boxFaery.x != 0) this.mainUI.boxFaery.x = 1182 * flag;
            else this.mainUI.boxSuit.x = 1182 * flag;
            let suitTarget = this.mainUI.boxSuit.x - 1182 * flag;
            let faeryTarget = this.mainUI.boxFaery.x - 1182 * flag;
            Laya.Tween.to(this.mainUI.boxFaery, { x: faeryTarget }, 200);
            Laya.Tween.to(this.mainUI.boxSuit, { x: suitTarget }, 200);
            await util.TimeUtil.awaitTime(300);
            this.onMove = false;
        }

        /**界面自动滚动 */
        private viewAutoMove() {
            this.viewMoveCd--;
            if (this.viewMoveCd <= 0) {
                this.viewMove(1);
            }
        }

        // private openOther() {
        //     if (this.cfg.phase == 1) {
        //         EventManager.event(CHANGE_PANEL, subpanel.mainSell1);
        //     } else if (this.cfg.phase == 2) {
        //         EventManager.event(CHANGE_PANEL, subpanel.mainSell);
        //     }
        // }

        private onDetail() {
            alert.showRuleByID(this.cfg.phase == 1 ? 1156 : 1192);
        }

        addEventListeners() {
            Laya.timer.loop(1000, this, this.viewAutoMove);
            BC.addEvent(this, this.mainUI.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.mainUI.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.mainUI.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.mainUI.btnLast, Laya.Event.CLICK, this, this.viewMove, [1]);
            BC.addEvent(this, this.mainUI.btnNext, Laya.Event.CLICK, this, this.viewMove, [-1]);
            BC.addEvent(this, this.mainUI.btnCall1, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.mainUI.btnCall10, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this.mainUI.btnBuy, Laya.Event.CLICK, this, this.openBuy);
            BC.addEvent(this, this.mainUI.btnGailv, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.mainUI.btnDetail, Laya.Event.CLICK, this, this.preReward);
            //BC.addEvent(this, this.mainUI.btnOther, Laya.Event.CLICK, this, this.openOther);
            BC.addEvent(this, this.mainUI.btnRule, Laya.Event.CLICK, this, this.onDetail);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.viewAutoMove);
        }

        destroy() {
            this.hide();
            this.removeEventListeners();
            this.mainUI.destroy();
            this.cfg = null;
        }
    }
}