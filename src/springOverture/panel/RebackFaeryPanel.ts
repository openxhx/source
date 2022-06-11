namespace springOverture {
    /**神祈复出数据 */
    export class RebackFaeryData {
        /**期数 */
        public phase: number
        /**帮助说明 */
        public ruleId: number;
        /**套装1 */
        public suit1: number;
        /**套装2 */
        public suit2: number;
        /**抽奖功能id */
        public drawId;
        /**概率说明id */
        public probabilityId;
        /**抽奖代币 */
        public coin;
        /**额外奖励id */
        public giftId;
        /**首次半价勋章 */
        public offMedal: number;
        /**礼包id */
        public rechangeId: number[];
        /**活动时间 */
        public time: string;

        constructor(phase: number, ruleId: number, suit1: number, suit2: number, drawId: number, proId: number, coin: number, giftId: number, offMedal: number, rechargeId: number[], time: string) {
            this.phase = phase;
            this.ruleId = ruleId;
            this.suit1 = suit1;
            this.suit2 = suit2;
            this.drawId = drawId;
            this.probabilityId = proId;
            this.coin = coin;
            this.giftId = giftId;
            this.offMedal = offMedal;
            this.rechangeId = rechargeId;
            this.time = time;
        }
    }
    /**
     * 神祈归来
     * 神祈复出抽奖
     */
    export class RebackFaeryPanel {
        /**UI面板 */
        private mainUI: any;
        /**相关数据 */
        private cfg: RebackFaeryData;

        private _loading: boolean = false;
        private viewMoveCd: number = 5;
        private onMove: boolean = false;
        constructor(ui: core.BaseModule, data: RebackFaeryData) {
            this.mainUI = ui;
            this.cfg = data;
            this.initUI();
            this.addEventListeners();
        }

        private async initUI() {
            this.mainUI.imgFaery.skin = `unpack/springOverture/faery${clientCore.LocalInfo.sex + (this.cfg.phase - 1) * 2}.png`;
            this.mainUI.imgSuit1.skin = `unpack/springOverture/${this.cfg.suit1}_${clientCore.LocalInfo.sex}.png`;
            this.mainUI.imgSuit2.skin = `unpack/springOverture/${this.cfg.suit2}_${clientCore.LocalInfo.sex}.png`;
            let madel = await clientCore.MedalManager.getMedal([this.cfg.offMedal]);
            this.mainUI.imgTip.visible = madel[0].value == 0;
        }

        show(box: any) {
            clientCore.Logger.sendLog('2022年1月14日活动', '【付费】春日序曲', '打开绝版复出-神祈归来面板');
            SpringOvertureModel.instance.checkCoinRecyle(1);
            clientCore.UIManager.setMoneyIds([this.cfg.coin]);
            clientCore.UIManager.showCoinBox();
            EventManager.event(CHANGE_TIME, this.cfg.time);
            this.checkGift();
            box.addChild(this.mainUI);
            if(this.cfg.phase == 2){
                clientCore.Logger.sendLog('2022年1月21日活', '【付费】春日序曲第二期', '打开神祈归来-冰魄之椿面板');
            }
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.mainUI.removeSelf();
        }

        /**检查赠品状态 */
        private checkGift() {
            if (!this.cfg.giftId) return;
            let canGet = clientCore.SuitsInfo.checkHaveSuits(this.cfg.suit1);
            if(this.cfg.phase == 1){
                this.mainUI.btnGet.visible = canGet && !clientCore.UserHeadManager.instance.getOneInfoById(this.cfg.giftId)?.have;
            }else{
                this.mainUI.btnGet.visible = canGet && clientCore.ItemsInfo.getItemNum(this.cfg.giftId)<=0;
            }
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: this.cfg.phase, activityId: SpringOvertureModel.instance.activityId, index: 2 })).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.mainUI.btnGet.visible = false;
                clientCore.UserHeadManager.instance.refreshAllHeadInfo();
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
                            SpringOvertureModel.instance.coinCost(cost * 68);
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
            let suit = id == 1 ? this.cfg.suit1 : this.cfg.suit2;
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", suit);
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

        private openOther() {
            if (this.cfg.phase == 1) {
                EventManager.event(CHANGE_PANEL, subpanel.rebackFaery1);
            } else if (this.cfg.phase == 2) {
                EventManager.event(CHANGE_PANEL, subpanel.rebackFaery);
            }
        }

        private onDetail() {
            alert.showRuleByID(this.cfg.phase == 1 ? 1156:1170);
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
            BC.addEvent(this, this.mainUI.btnOther, Laya.Event.CLICK, this, this.openOther);
            BC.addEvent(this, this.mainUI.btnRule, Laya.Event.CLICK, this, this.onDetail);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.viewAutoMove);
        }

        destroy() {
            this.removeEventListeners();
            this.mainUI.destroy();
            this.cfg = null;
        }
    }
}