namespace moonStory {
    export class MoonYyzcPanel extends ui.moonStory.panel.MoonYyzcPanelUI {
        private _model: MoonStoryModel;
        private _detailsPanel: BuyDetailsPanel;
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _drawRewardPanel: DrawRewardPanel;
        private _moving: boolean;
        private _startPos: Laya.Point;
        private readonly drawCoinId: number = 1511011;
        private _rechargeIDArr = [21, 22];
        private _curRechargeId: number;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as MoonStoryModel;
            this._detailsPanel = new BuyDetailsPanel();
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this._drawRewardPanel = new DrawRewardPanel(sign);
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.boxPet.visible = true;
            this.boxCloth.visible = false;
            this.addEventListeners();
        }

        public async onShow() {
            clientCore.Logger.sendLog('2020年9月25日活动', '【付费】华彩月章', '打开盈月之池面板');
            clientCore.UIManager.setMoneyIds([this.drawCoinId, clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.checkBuyCheapReward();
            this.setCountUI();
        }

        /**检查超值礼包购买情况 */
        private checkBuyCheapReward() {
            let buyRewardFlag = false;
            for (let i = 0; i < this._rechargeIDArr.length; i++) {
                let lastFloorTime = util.TimeUtil.floorTime(clientCore.RechargeManager.checkBuyLimitInfo(this._rechargeIDArr[i]).lastTime);
                let curFloorTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
                if (lastFloorTime < curFloorTime) {
                    if (i == 0) {
                        this.imgBuy.skin = "moonStory/gift_6.png";
                    }
                    else if (i == 1) {
                        this.imgBuy.skin = "moonStory/gift_68.png";
                    }
                    this._curRechargeId = this._rechargeIDArr[i];
                    buyRewardFlag = true;
                    break;
                }
            }
            this.imgBuy.visible = buyRewardFlag;
        }

        /**抽奖次数奖励 */
        private setCountUI() {
            let config = xls.get(xls.godTreeCounter).getValues();
            for (let i: number = 0; i < config.length; i++) {
                if (this._model.drawCount < config[i].counter) {
                    let reward = clientCore.LocalInfo.sex == 1 ? config[i].femaleAward : config[i].maleAward;
                    if (config[i].suitsAward > 0) {
                        this.imgOtherReward.skin = "moonStory/" + (config[i].suitsAward) + ".png";
                    } else {
                        this.imgOtherReward.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
                    }
                    this.txCount.text = (config[i].counter - this._model.drawCount).toString();
                    this.btnGetDrawReward.visible = false;
                    this.imgDrawCount.visible = true;
                    break;
                } else if (util.getBit(this._model.drawCountRewardStatus, i + 1) == 0) {
                    let reward = clientCore.LocalInfo.sex == 1 ? config[i].femaleAward : config[i].maleAward;
                    if (config[i].suitsAward > 0) {
                        this.imgOtherReward.skin = "moonStory/" + (config[i].suitsAward) + ".png";
                    } else {
                        this.imgOtherReward.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
                    }
                    this.btnGetDrawReward.visible = true;
                    this.imgDrawCount.visible = false;
                    break;
                } else if (i == config.length - 1) {
                    let reward = clientCore.LocalInfo.sex == 1 ? config[i].femaleAward : config[i].maleAward;
                    if (config[i].suitsAward > 0) {
                        this.imgOtherReward.skin = "moonStory/" + (config[i].suitsAward) + ".png";
                    } else {
                        this.imgOtherReward.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
                    }
                    this.btnGetDrawReward.visible = false;
                    this.imgDrawCount.visible = false;
                }
            }
        }

        public hide() {
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        /**超值礼包购买 */
        private buyOrderGift(id: number) {
            if (this.checkTime()) return;
            if (!this._rechargeIDArr.includes(id)) return;
            clientCore.RechargeManager.pay(id).then((data) => {
                alert.showReward(data.items);
                this.checkBuyCheapReward();
            });
        }

        /**奖励总览 */
        private async preReward(type: number) {
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", type);
            clientCore.Logger.sendLog('2020年9月25日活动', '【付费】华彩月章', '点击奖励总览按钮');
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([this.drawCoinId, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 9);
        }

        /**礼包详情 */
        private showGiftDetails(id: number) {
            if (this.checkTime()) return;
            if (!id) id = this._curRechargeId;
            this._detailsPanel.showInfo(id);
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
            inBox.x = Laya.stage.width;
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
            let aimPosX = Laya.stage.width;
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
            if (this.checkTime()) return;
            if (this._loading) return; //等待中
            let itemNum = clientCore.ItemsInfo.getItemNum(this.drawCoinId);
            if (itemNum < num) {
                alert.alertQuickBuy(this.drawCoinId, num - itemNum, true);
                // alert.showFWords(clientCore.ItemsInfo.getItemName(this._model.drawCoin) + "不足~");
                return;
            }
            this._loading = true;
            net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 7, times: num })).then((data: pb.sc_common_activity_draw) => {
                if (num == 1) {
                    this.getOne(data.item[0]);
                }
                else {
                    this.getAll(data.item);
                }
                this._model.drawCount += data.times;
                this.setCountUI();
            }).catch(() => {
                this._loading = false;
            })
        }

        private checkTime() {
            // if (clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec('2020-10-16 00:00:00')) {
            //     alert.showSmall(`活动时间已过~`, {
            //         callBack: {
            //             caller: this, funArr: [() => {
            //                 clientCore.ModuleManager.closeAllOpenModule();
            //             }]
            //         }
            //     })
            //     return true;
            // }
            return false;
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
            this._tenPanel.once(Laya.Event.COMPLETE, this, () => {
                if (this._model.show33 == 0) {
                    this._model.show33 = 1;
                    clientCore.MedalManager.setMedal([{ id: MedalConst.MOONSTORY_BUY_33, value: 1 }]);
                    this.alertLittleRecharge();
                }
            })
        }
        private alertLittleRecharge() {
            clientCore.LittleRechargManager.instacne.activeWindowById(10);
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
                            this.moveRight(this.boxPet, this.boxCloth);
                        }
                        else {
                            this.moveRight(this.boxCloth, this.boxPet);
                        }
                    }
                    else {
                        if (this.boxPet.visible) {
                            this.moveLeft(this.boxPet, this.boxCloth);
                        }
                        else {
                            this.moveLeft(this.boxCloth, this.boxPet);
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
            let fairys: number[] = [2300034, 2300029];
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', fairys[index - 1])
        }

        /**展示套装详情 */
        private onTryClick(index: number) {
            let cloths: number[] = [2110017, 2100239, 2100231];
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", cloths[index - 1]);
        }

        /**切换背景 */
        private onSideClick(dir: string) {
            if (this._moving) {
                return;
            }
            if (dir == "left") {
                if (this.boxPet.visible) {
                    this.moveLeft(this.boxPet, this.boxCloth);
                }
                else {
                    this.moveLeft(this.boxCloth, this.boxPet);
                }
            }
            else {
                if (this.boxPet.visible) {
                    this.moveRight(this.boxPet, this.boxCloth);
                }
                else {
                    this.moveRight(this.boxCloth, this.boxPet);
                }
            }
        }

        /**获取保底奖励 */
        private getDrawCountReward() {
            this._drawRewardPanel.show();
            clientCore.DialogMgr.ins.open(this._drawRewardPanel);
        }

        /**自动切页 */
        private startMoveBgImg() {
            if (this._moving || this.visible == false || !this.parent || clientCore.DialogMgr.ins.curShowPanelNum > 0) {
                return;
            }
            if (this.boxPet.visible) {
                this.moveLeft(this.boxPet, this.boxCloth);
            }
            else {
                this.moveLeft(this.boxCloth, this.boxPet);
            }
        }

        addEventListeners() {
            Laya.timer.loop(8000, this, this.startMoveBgImg);
            BC.addEvent(this, this.btnProb, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnShowRewardDetail, Laya.Event.CLICK, this, this.preReward, [7]);
            BC.addEvent(this, this.btnCallOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCallTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.startMove);
            BC.addEvent(this, this.npcDetail1, Laya.Event.CLICK, this, this.showNpcDetail, [1]);
            BC.addEvent(this, this.npcDetail2, Laya.Event.CLICK, this, this.showNpcDetail, [2]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onTryClick, [3]);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onSideClick, ["right"]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onSideClick, ["left"]);
            BC.addEvent(this, this.btnGetDrawReward, Laya.Event.CLICK, this, this.getDrawCountReward);
            BC.addEvent(this, this.imgOtherReward, Laya.Event.CLICK, this, this.getDrawCountReward);
            BC.addEvent(this, this.imgBuy, Laya.Event.CLICK, this, this.showGiftDetails, [0]);
            EventManager.on("MOONSTORY_GIFT_BUY", this, this.buyOrderGift);
            EventManager.on("MOONSTORY_DRAW_REWARD_BACK", this, this.setCountUI);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.startMoveBgImg);
            EventManager.off("MOONSTORY_GIFT_BUY", this, this.buyOrderGift);
            EventManager.off("MOONSTORY_DRAW_REWARD_BACK", this, this.setCountUI);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            clientCore.UIManager.releaseCoinBox();
            this._detailsPanel?.destroy();
            this._onePanel?.destroy();
            this._tenPanel?.destroy();
            this._drawRewardPanel?.destroy();
            this._onePanel = this._tenPanel = this._drawRewardPanel = this._detailsPanel = this._model = null;
        }
    }
}