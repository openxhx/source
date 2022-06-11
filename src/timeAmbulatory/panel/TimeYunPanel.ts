namespace timeAmbulatory {
    export class TimeYunPanel extends ui.timeAmbulatory.panel.TimeYunPanelUI {
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _detailsPanel: GiftBuyPanel;
        private _moving: boolean;
        private _startPos: Laya.Point;
        // private _rechargeIDArr = [21, 22];
        // private _curRechargeId: number;
        constructor() {
            super();
            this._detailsPanel = new GiftBuyPanel();
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this.suitFemale.visible = clientCore.LocalInfo.sex == 1;
            this.suitMale.visible = clientCore.LocalInfo.sex == 2;
            this.boxPet.visible = true;
            this.boxSuit.visible = false;
            this.addEventListeners();
        }

        public async onShow() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '打开光阴之韵面板');
            clientCore.UIManager.setMoneyIds([1511025]);
            clientCore.UIManager.showCoinBox();
            // this.checkBuyCheapReward();
        }

        /**检查超值礼包购买情况 */
        // private checkBuyCheapReward() {
        //     let buyRewardFlag = false;
        //     for (let i = 0; i < this._rechargeIDArr.length; i++) {
        //         let lastFloorTime = util.TimeUtil.floorTime(clientCore.RechargeManager.checkBuyLimitInfo(this._rechargeIDArr[i]).lastTime);
        //         let curFloorTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
        //         if (lastFloorTime < curFloorTime) {
        //             if (i == 0) {
        //                 this.imgBuy.skin = "timeAmbulatory/gift_6.png";
        //             }
        //             else if (i == 1) {
        //                 this.imgBuy.skin = "timeAmbulatory/gift_68.png";
        //             }
        //             this._curRechargeId = this._rechargeIDArr[i];
        //             buyRewardFlag = true;
        //             break;
        //         }
        //     }
        //     this.imgBuy.visible = buyRewardFlag;
        // }

        public hide() {
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        // /**超值礼包购买 */
        // private buyOrderGift(id: number) {
        //     if (!this._rechargeIDArr.includes(id)) return;
        //     clientCore.RechargeManager.pay(id).then((data) => {
        //         alert.showReward(data.items);
        //         // this.checkBuyCheapReward();
        //     });
        // }

        /**奖励总览 */
        private async preReward(type: number) {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '点击光阴之韵奖励总览按钮');
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", type);
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([1511025]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '点击光阴之韵概率公示按钮');
            clientCore.ModuleManager.open('probability.ProbabilityModule', 12);
        }

        /**礼包详情 */
        private showGiftDetails() {
            this._detailsPanel.showInfo();
            clientCore.DialogMgr.ins.open(this._detailsPanel);
        }

        /**
         * 背景左移滑动效果
         * @param outBox 
         * @param inBox 
         */
        private async moveLeft(outBox: Laya.Box, inBox: Laya.Box) {
            this._moving = true;
            let aimPosX = -outBox.width;
            Laya.Tween.to(outBox, { x: aimPosX }, 500, null, new Laya.Handler(this, () => {
                outBox.visible = false;
            }));
            inBox.visible = true;
            inBox.x = 1120;
            Laya.Tween.to(inBox, { x: 0 }, 500);
            await util.TimeUtil.awaitTime(600);
            this._moving = false;
        }
        /**
         * 背景右移滑动效果
         * @param outBox 
         * @param inBox 
         */
        private async moveRight(outBox: Laya.Box, inBox: Laya.Box) {
            this._moving = true;
            let aimPosX = 1120;
            Laya.Tween.to(outBox, { x: aimPosX }, 500, null, new Laya.Handler(this, () => {
                outBox.visible = false;
            }));
            inBox.x = -inBox.width;
            inBox.visible = true;
            Laya.Tween.to(inBox, { x: 0 }, 500);
            await util.TimeUtil.awaitTime(600);
            this._moving = false;
        }
        //#region 抽奖
        private _loading: boolean = false;
        private callClick(num: number) {
            if (this._loading) return; //等待中
            let itemNum = clientCore.ItemsInfo.getItemNum(1511025);
            let cost = num;
            if (itemNum < cost) {
                alert.showSmall("光阴卷轴不足，是否前往补充？", { callBack: { funArr: [() => { this.showGiftDetails(); }], caller: this } });
                return;
            }
            alert.showSmall(`确定消耗${cost}光阴卷轴进行召唤？`, {
                callBack: {
                    funArr: [() => {
                        this._loading = true;
                        net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 1, times: num })).then((data: pb.sc_common_activity_draw) => {
                            if (num == 1) {
                                this.getOne(data.item[0]);
                            }
                            else {
                                this.getAll(data.item);
                            }
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

        //#region 拖动背景
        private startMove(e: Laya.Event) {
            this._startPos = new Laya.Point(this.mouseX, this.mouseY);
            BC.addEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseRelease);
            BC.addEvent(this, this, Laya.Event.ROLL_OUT, this, this.onMouseRelease);
        }
        private onMouseMove(e: Laya.Event): void {
            if (this._moving) {
                return;
            }
            let curPos = new Laya.Point(this.mouseX, this.mouseY);
            if (Math.abs(curPos.x - this._startPos.x) > Math.abs(curPos.y - this._startPos.y)) {
                if (Math.abs(curPos.x - this._startPos.x) > 200) {
                    this.onMouseRelease(null);
                    if (curPos.x > this._startPos.x) {
                        if (this.boxPet.visible) {
                            this.moveRight(this.boxPet, this.boxSuit);
                        }
                        else {
                            this.moveRight(this.boxSuit, this.boxPet);
                        }
                    }
                    else {
                        if (this.boxPet.visible) {
                            this.moveLeft(this.boxPet, this.boxSuit);
                        }
                        else {
                            this.moveLeft(this.boxSuit, this.boxPet);
                        }
                    }
                }
            }
        }
        private onMouseRelease(e: Laya.Event): void {
            BC.removeEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.removeEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseRelease);
            BC.removeEvent(this, this, Laya.Event.ROLL_OUT, this, this.onMouseRelease);
        }
        //#endregion

        /**展示角色详情 */
        private showNpcDetail(index: number) {
            let fairys: number[] = [1440002, 1440001];
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', fairys[index - 1])
        }

        /**展示套装详情 */
        private onTryClick(index: number) {
            let cloths: number[] = [2110273, 2100278, 2110287];
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", cloths[index - 1]);
        }

        /**切换背景 */
        private onSideClick(dir: string) {
            if (this._moving) {
                return;
            }
            if (dir == "left") {
                if (this.boxPet.visible) {
                    this.moveLeft(this.boxPet, this.boxSuit);
                }
                else {
                    this.moveLeft(this.boxSuit, this.boxPet);
                }
            }
            else {
                if (this.boxPet.visible) {
                    this.moveRight(this.boxPet, this.boxSuit);
                }
                else {
                    this.moveRight(this.boxSuit, this.boxPet);
                }
            }
        }

        /**自动切页 */
        private startMoveBgImg() {
            if (this._moving || this.visible == false || !this.parent || clientCore.DialogMgr.ins.curShowPanelNum > 0) {
                return;
            }
            if (this.boxPet.visible) {
                this.moveLeft(this.boxPet, this.boxSuit);
            }
            else {
                this.moveLeft(this.boxSuit, this.boxPet);
            }
        }

        addEventListeners() {
            Laya.timer.loop(8000, this, this.startMoveBgImg);
            BC.addEvent(this, this.btnGailv, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.preReward, [1]);
            BC.addEvent(this, this.btnCallOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCallTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.startMove);
            BC.addEvent(this, this.btnDetial1, Laya.Event.CLICK, this, this.showNpcDetail, [1]);
            BC.addEvent(this, this.btnDetial2, Laya.Event.CLICK, this, this.showNpcDetail, [2]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onTryClick, [3]);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onSideClick, ["right"]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onSideClick, ["left"]);
            BC.addEvent(this, this.imgBuy, Laya.Event.CLICK, this, this.showGiftDetails, [0]);
            // EventManager.on("TIMEAMBULATORY_GIFT_BUY", this, this.buyOrderGift);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            // EventManager.off("TIMEAMBULATORY_GIFT_BUY", this, this.buyOrderGift);
            Laya.timer.clear(this, this.startMoveBgImg);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            clientCore.UIManager.releaseCoinBox();
            this._onePanel?.destroy();
            this._tenPanel?.destroy();
            this._detailsPanel?.destroy();
            this._detailsPanel = this._onePanel = this._tenPanel = null;
        }
    }
}