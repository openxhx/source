namespace snowNightFestival {
    export class NightFesXnyjPanel extends ui.snowNightFestival.panel.NightFesXnyjPanelUI {
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _detailsPanel: BuyDetailsPanel;
        private _moving: boolean;
        private _startPos: Laya.Point;
        private readonly drawCoinId: number = 1511022;
        private _rechargeIDArr = [21, 22];
        private _curRechargeId: number;
        private _oneCost: number;
        constructor() {
            super();
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this._detailsPanel = new BuyDetailsPanel();
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.boxPet.visible = true;
            this.boxCloth.visible = false;
            this.addEventListeners();
        }

        public async onShow() {
            clientCore.UIManager.setMoneyIds([this.drawCoinId, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.checkBuyCheapReward();
            this._oneCost = xls.get(xls.giftSell).get(7).oneLottery[0].v2;
            this.labCostTen.text = "" + this._oneCost * 10;
            this.labCostOne.text = "" + this._oneCost;
        }

        /**检查超值礼包购买情况 */
        private checkBuyCheapReward() {
            let buyRewardFlag = false;
            let curFloorTime = util.TimeUtil.formatTimeStrToSec('2020-12-31 00:00:00');
            let lastFloorTime = util.TimeUtil.floorTime(clientCore.RechargeManager.checkBuyLimitInfo(36).lastTime);
            for (let i = 0; i < this._rechargeIDArr.length; i++) {
                lastFloorTime = util.TimeUtil.floorTime(clientCore.RechargeManager.checkBuyLimitInfo(this._rechargeIDArr[i]).lastTime);
                if (lastFloorTime < curFloorTime) {
                    if (i == 0) {
                        this.imgBuy.skin = "snowNightFestival/gift_6.png";
                    }
                    else if (i == 1) {
                        this.imgBuy.skin = "snowNightFestival/gift_68.png";
                    }
                    this._curRechargeId = this._rechargeIDArr[i];
                    buyRewardFlag = true;
                    break;
                }
            }
            this.imgBuy.visible = buyRewardFlag;
        }

        public hide() {
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        /**超值礼包购买 */
        private buyOrderGift(id: number) {
            clientCore.RechargeManager.pay(id).then((data) => {
                alert.showReward(data.items);
                this.checkBuyCheapReward();
            });
        }

        /**奖励总览 */
        private async preReward(type: number) {
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", type);
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
            inBox.x = 900;
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
            let aimPosX = 900;
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
            let itemNum = clientCore.ItemsInfo.getItemNum(this.drawCoinId);
            let cost = num * this._oneCost;
            if (itemNum < cost) {
                alert.showSmall("愿景笺不足，是否要购买？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            alert.alertQuickBuy(this.drawCoinId, cost - itemNum, true);
                        }]
                    }
                })
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
            }).catch(() => {
                this._loading = false;
            })
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
        private showNpcDetail() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2300033)
        }

        /**展示套装详情 */
        private onTryClick(index: number) {
            let cloths: number[] = [2110009, 2100270];
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
            BC.addEvent(this, this.btnGailv, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnJlzl, Laya.Event.CLICK, this, this.preReward, [7]);
            BC.addEvent(this, this.btnCallOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCallTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.startMove);
            BC.addEvent(this, this.btnDetial, Laya.Event.CLICK, this, this.showNpcDetail);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onSideClick, ["right"]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onSideClick, ["left"]);
            BC.addEvent(this, this.imgBuy, Laya.Event.CLICK, this, this.showGiftDetails, [0]);
            BC.addEvent(this, this.gift128, Laya.Event.CLICK, this, this.showGiftDetails, [36]);
            EventManager.on("NIGHTFES_GIFT_BUY", this, this.buyOrderGift);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.startMoveBgImg);
            EventManager.off("NIGHTFES_GIFT_BUY", this, this.buyOrderGift);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            clientCore.UIManager.releaseCoinBox();
            this._detailsPanel?.destroy();
            this._onePanel?.destroy();
            this._tenPanel?.destroy();
            this._onePanel = this._tenPanel = this._detailsPanel = null;
        }
    }
}