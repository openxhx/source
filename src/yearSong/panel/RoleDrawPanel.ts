namespace yearSong {
    /**
     * 带角色的抽奖
     * 本周主打
     */
    export class RoleDrawPanel extends ui.yearSong.panel.RoleDrawPanelUI {
        /** 抽奖ID*/
        readonly DRAW_ID: number = 1;
        /**概率id */
        readonly PROBABILITY_ID: number = 31;
        readonly SUIT_ID: number[] = [2100331, 2110148, 2110494, 2110493];
        readonly GIFT_ID: number = 3500077;
        readonly ROLE_ID: number[] = [2300057 , 2300056];
        private ruleId: number = 1164;
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;

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
            clientCore.UIManager.setMoneyIds([YearSongModel.instance.coinid , 0]);
            clientCore.UIManager.showCoinBox();
            this.checkGift();
            clientCore.Logger.sendLog('2021年9月30日活动', '【付费】岁月如歌', '打开仙弦轻舞面板');
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
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", this.DRAW_ID);
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', this.PROBABILITY_ID);
        }

        //#region 抽奖
        private _loading: boolean = false;
        private callClick(num: number) {
            if (this._loading) return; //等待中
            let itemNum = clientCore.ItemsInfo.getItemNum(YearSongModel.instance.coinid);
            let cost = num == 1 ? 50:300;
            if (itemNum < cost) {
                alert.showFWords(`${clientCore.ItemsInfo.getItemName(YearSongModel.instance.coinid)}不足~`);
                return;
            }
            alert.showSmall(`确定消耗${cost}${clientCore.ItemsInfo.getItemName(YearSongModel.instance.coinid)}进行召唤？`, {
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
                            YearSongModel.instance.coinCost(num * 50);
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
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: 1 , activityId:197 ,  index:3})).then((msg: pb.sc_summer_recharge_get_extra_reward) => {
                alert.showReward(msg.items);
                this.btnGet.visible = false;
            })
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        /**展示角色详情 */
        private showNpcDetail(idx:number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.ROLE_ID[idx-1]);
        }

        addEventListeners() {
            Laya.timer.loop(8000, this, this.startMoveBgImg);
            BC.addEvent(this, this.panel, Laya.Event.MOUSE_DOWN, this, this.startMove);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnGailv, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.btnCallOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCallTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTryRole, Laya.Event.CLICK, this, this.showNpcDetail , [2]);
            BC.addEvent(this, this.btnTryRole1, Laya.Event.CLICK, this, this.showNpcDetail , [1]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            //BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openBuy);
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
        }
    }
}