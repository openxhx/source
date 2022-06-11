namespace bigCharge {
    /**
     * 带角色的抽奖
     * 本周主打
     */
    export class PageDrawPanel extends ui.bigCharge.panel.PageDrawPanelUI {
        /** 抽奖ID*/
        readonly DRAW_ID: number = 11;
        /**概率id */
        readonly PROBABILITY_ID: number = 24;
        /** 抽奖使用的道具ID*/
        readonly DRAW_ITEM_ID: number = 9900205;
        readonly SUIT_ID: number[] = [2110428, 2100283, 2110450, 2110427];
        readonly GIFT_ID: number = 3500064;
        readonly ROLE_ID: number = 2300070;
        private ruleId: number = 1164;
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _buy: BuyPanel;
        /**充值礼包标志 */
        private _chargeFlag: rollColetionCharge = rollColetionCharge.call;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this.boxRole.visible = false;
            this.addEventListeners();
        }
        show() {
            clientCore.UIManager.setMoneyIds([this.DRAW_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            this.checkGift();
            clientCore.Logger.sendLog('2021年7月23日活动', '【付费】夏日终曲第四期', '打开本周主打面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**打开礼包购买面板 */
        private openBuy(): void {
            this._buy = this._buy || new BuyPanel();
            this._buy.show([9,10]);
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
            alert.showSmall(`确定消耗${cost}${clientCore.ItemsInfo.getItemName(this.DRAW_ITEM_ID)}进行召唤？`, {
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
                            BigChargeModel.instance.coinCost(num * 168);
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
        //#region 背景移动
        private _moving: boolean;
        private _startPos: Laya.Point;
        /**
         * 背景左移滑动效果
         * @param outBox 
         * @param inBox 
         */
        private moveLeft(outBox: Laya.Box, inBox: Laya.Box): void {
            this._moving = true;
            let aimPosX = -outBox.width;
            Laya.Tween.to(outBox, { x: aimPosX }, 500, null, new Laya.Handler(this, () => {
                outBox.visible = false;
                this._moving = false;
            }));
            inBox.x = this.panel.width;
            inBox.visible = true;
            Laya.Tween.to(inBox, { x: 0 }, 500);
        }
        /**
         * 背景右移滑动效果
         * @param outBox 
         * @param inBox 
         */
        private moveRight(outBox: Laya.Box, inBox: Laya.Box): void {
            this._moving = true;
            let aimPosX = this.panel.width;
            Laya.Tween.to(outBox, { x: aimPosX }, 500, null, new Laya.Handler(this, () => {
                outBox.visible = false;
                this._moving = false;
            }));
            inBox.x = -inBox.width;
            inBox.visible = true;
            Laya.Tween.to(inBox, { x: 0 }, 500);
        }
        private startMove(e: Laya.Event) {
            this._startPos = new Laya.Point(this.panel.mouseX, this.panel.mouseY);
            BC.addEvent(this, this.panel, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.addEvent(this, this.panel, Laya.Event.MOUSE_UP, this, this.onMouseRelease);
            BC.addEvent(this, this.panel, Laya.Event.ROLL_OUT, this, this.onMouseRelease);
        }
        private onMouseMove(e: Laya.Event): void {
            if (this._moving) {
                return;
            }
            let curPos = new Laya.Point(this.panel.mouseX, this.panel.mouseY);
            if (Math.abs(curPos.x - this._startPos.x) > Math.abs(curPos.y - this._startPos.y)) {
                if (Math.abs(curPos.x - this._startPos.x) > 200) {
                    this.onMouseRelease(null);
                    if (curPos.x > this._startPos.x) {
                        if (this.boxRole.visible) {
                            this.moveRight(this.boxRole, this.boxSuit);
                        }
                        else {
                            this.moveRight(this.boxSuit, this.boxRole);
                        }
                    }
                    else {
                        if (this.boxRole.visible) {
                            this.moveLeft(this.boxRole, this.boxSuit);
                        }
                        else {
                            this.moveLeft(this.boxSuit, this.boxRole);
                        }
                    }
                }
            }
        }
        private onMouseRelease(e: Laya.Event): void {
            BC.removeEvent(this, this.panel, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.removeEvent(this, this.panel, Laya.Event.MOUSE_UP, this, this.onMouseRelease);
            BC.removeEvent(this, this.panel, Laya.Event.ROLL_OUT, this, this.onMouseRelease);
        }
        /**自动切页 */
        private startMoveBgImg() {
            if (this._moving || this.visible == false || !this.parent || clientCore.DialogMgr.ins.curShowPanelNum > 0) {
                return;
            }
            if (this.boxRole.visible) {
                this.moveLeft(this.boxRole, this.boxSuit);
            }
            else {
                this.moveLeft(this.boxSuit, this.boxRole);
            }
        }
        /**切换背景 */
        private onSideClick(dir: string) {
            if (this._moving) {
                return;
            }
            if (dir == "left") {
                if (this.boxRole.visible) {
                    this.moveLeft(this.boxRole, this.boxSuit);
                }
                else {
                    this.moveLeft(this.boxSuit, this.boxRole);
                }
            }
            else {
                if (this.boxRole.visible) {
                    this.moveRight(this.boxRole, this.boxSuit);
                }
                else {
                    this.moveRight(this.boxSuit, this.boxRole);
                }
            }
        }
        //#endregion
        /**展示套装详情 */
        private onTryClick(idx: number) {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.SUIT_ID[idx - 1]);
        }

        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_summer_recharge_get_extra_reward({ type: 7 })).then((msg: pb.sc_summer_recharge_get_extra_reward) => {
                alert.showReward(msg.items);
                this.btnGet.visible = false;
            })
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**展示角色详情 */
        private showNpcDetail() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.ROLE_ID);
        }

        addEventListeners() {
            Laya.timer.loop(8000, this, this.startMoveBgImg);
            BC.addEvent(this, this.panel, Laya.Event.MOUSE_DOWN, this, this.startMove);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnGailv, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.btnCallOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCallTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTryRole, Laya.Event.CLICK, this, this.showNpcDetail);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openBuy);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onSideClick, ["right"]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onSideClick, ["left"]);
        }

        removeEventListeners() {
            Laya.timer.clear(this, this.startMoveBgImg);
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