

namespace oneLeafAutumn {
    /**
     * 一叶知秋（market 花田集市复制）
     */
    export class OneLeafAutumnModule extends ui.oneLeafAutumn.OneLeafAutumnModuleUI {
        private _curShowRechargeID: number; //超值礼包ID
        private _isStart: boolean = false;
        private _destryed: boolean = false;
        private _isCard: boolean; //正在打开卡片中
        private _open: Map<number, number> = new Map();
        private _cls: xls.openCardDraw;

        private _model: OneLeafAutumnModel;
        private _control: OneLeafAutumnControl;
        /**超值礼包购买面板 */
        private _cheapBuyPanel: CheapBuyPanel;

        init(): void {
            clientCore.UIManager.showCoinBox();
            this.sign = clientCore.CManager.regSign(new OneLeafAutumnModel(), new OneLeafAutumnControl());
            this._control = clientCore.CManager.getControl(this.sign) as OneLeafAutumnControl;
            this._model = clientCore.CManager.getModel(this.sign) as OneLeafAutumnModel;

            this._cheapBuyPanel = new CheapBuyPanel();

            this.addPreLoad(xls.load(xls.openCardDraw));
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.rechargeShopOffical));
        }

        async onPreloadOver() {
            let msg = await this._control.flowerInfo();
            this._model.updateInfo(msg);

            this._cls = this._model.getOpenCardDraw();
            this._cheapBuyPanel.init(null);
            this.checkBuyCheapReward();

            this.imgRole.skin = clientCore.LocalInfo.sex == 1 ? "oneLeafAutumn/girl.png" : "oneLeafAutumn/boy.png";

            let data: number[] = this._model.cardInfo;
            let open: pb.IOpenedCard[] = this._model.openedCardInfo;
            let len: number = open.length;
            let cardId: number;
            for (let i: number = 0; i < len; i++) {
                let ele: pb.IOpenedCard = open[i];
                let index: number = data.indexOf(ele.cardId);
                cardId = data[index];
                let pos: number = ele.cardPos - 1;
                data[index] = data[pos];
                data[pos] = cardId;
                this._open.set(ele.cardPos, cardId);
            }
            this.updateReset();
            this.updateLucky();
            this._model.times = this._model.openedCardInfo.length;
            this.txCost.changeText(`${this._cls.openCost.v2 + this._model.times * this._cls.openCost.v3}`);
            this.txMult.changeText(this._model.quickCardFlag + '');
            this.txLucky.changeText(this._model.luckNum + '');
            this.imgOwned.visible = this._model.hasShoushi;
            if (this._model.isFirstOpen == 0) {
                for (let i: number = 1; i < 10; i++) { this['card_' + i]?.ani1.gotoAndStop(0); }
            } else {
                this.showCardsCache();
            }
            this.updateShow();
            this.onSelectCards(-1);

            clientCore.Logger.sendLog('2020年9月11日活动', '【付费】一叶知秋', '打开活动面板');
        }

        private updateReset(): void {
            let first: boolean = this._model.isFirstOpen == 0;
            this.btnStart.fontSkin = first ? "oneLeafAutumn/t_y_maoxian.png" : "oneLeafAutumn/reset.png";
            this.btnStart.fontX = first ? 71 : 70;
            this.btnStart.fontY = first ? 19 : 8;
        }

        private updateLucky(): void {
            this._model.luckNum = Math.min(this._model.max_lucky, this._model.luckNum);
            let ratio: number = this._model.luckNum / this._model.max_lucky;
            this.imgLucky.height = ratio * 274;
            this.txLucky.changeText(this._model.luckNum + '');
        }

        /** 更新背景秀相关*/
        private updateShow(): void {
            let get: boolean = clientCore.ItemsInfo.getItemNum(this._model.bgShowId) > 0;
            this.btnShow.visible = !get;
            let info: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(this._model.suitId);
            this.txCnt.changeText(`${info.hasCnt}/${info.clothes.length}`);
            this.txShow.changeText(info.allGet ? '领取' : '集齐奖励');
            this.btnShow.visible && (this.btnShow.gray = !info.allGet);
            this.imgReceived.visible = get;
        }

        private showCardsCache(): void {
            let data: number[] = this._model.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.oneLeafAutumn.item.CardUI = this['card_' + i];
                let id: number = data[i - 1];
                this.showCard(card, id);
                this._open.get(i) ? card.ani1.gotoAndStop(20) : card.ani1.gotoAndStop(0);
            }
            this._isStart = true;
        }

        private onSelectCards(value: number): void {
            for (let i: number = 1; i < 10; i++) {
                let card: ui.oneLeafAutumn.item.CardUI = this['card_' + i];
                card.imgSelect.visible = value == i;
            }
        }

        private showCard(card: ui.oneLeafAutumn.item.CardUI, id: number): void {
            if (id < 10000) {
                let cls: xls.godTree = this._model.godTree(id);
                if (!cls) {
                    console.warn('id错误 id ' + id);
                    return;
                }
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cls.item : cls.itemMale;
                card.nick.changeText(clientCore.ItemsInfo.getItemName(reward.v1));
                card.cnt.changeText('x' + reward.v2);
                card.ico.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
                card.ico.scale(0.6, 0.6);
            } else {
                let index: number = id - 10000;
                card.nick.changeText(['双倍卡', '三倍卡', '五倍卡'][index]);
                card.cnt.changeText('x1');
                card.ico.skin = `oneLeafAutumn/${['x2', 'x3', 'x5'][index]}.png`;
                card.ico.scale(1, 1);
            }
        }

        private resetCard(): void {
            this._isStart = false;
            this._control.resetCard(new Laya.Handler(this, (data: number[]) => {
                this._model.cardInfo = data;
                this._model.openedCardInfo.length = 0;
                this._open.clear();
                //倍数归零
                this._model.quickCardFlag = 0;
                this.txMult.changeText(this._model.quickCardFlag + '');
                //花费归零
                this._model.times = 0;
                this.txCost.changeText(`${this._cls.openCost.v2 + this._model.times * this._cls.openCost.v3}`);
                //占卜后
                if (this._model.isFirstOpen == 0) {
                    this._model.isFirstOpen = 1;
                    this.updateReset();
                }
                this.showCards();
                this.onSelectCards(-1);
            }))
        }

        async showCards(): Promise<void> {
            let data: number[] = this._model.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.oneLeafAutumn.item.CardUI = this['card_' + i];
                let id: number = data[i - 1];
                card.ani1.gotoAndStop(32);
                this.showCard(card, id);
            }
            if (this._open.size == 9) { //全翻完了
                this._isStart = true;
                return;
            }
            await util.TimeUtil.awaitTime(3000); //等待3秒
            if (this._destryed) return;
            for (let i: number = 1; i <= 9; i++) {
                if (this._open.get(i)) continue;
                let ani: Laya.FrameAnimation = this['card_' + i].ani1;
                ani.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                ani.play(0, false);
            }
            await new Promise((suc) => { this.card_9.ani1.once(Laya.Event.COMPLETE, this, () => { suc(1); }); })
            if (this._destryed) return;
            await new Promise((suc) => {
                this.ani1.once(Laya.Event.COMPLETE, this, () => { suc(1); });
                this.ani1.play(0, false);
            })
            if (this._destryed) return;
            this._isStart = true;
        }

        private onTip(): void {
            alert.showRuleByID(this._model.tips_Id);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        /** 重置*/
        private onReset(): void {
            if (!this._isStart && this._model.isFirstOpen == 1) return; //没开始
            if (this._model.isFirstOpen == 0) {
                this.resetCard();
            } else {
                if (clientCore.MoneyManager.checkLeaf(this._cls.reloadCost.v2)) {
                    alert.showSmall(`是否花费${this._cls.reloadCost.v2}神叶重置？`, {
                        callBack: {
                            caller: this,
                            funArr: [this.resetCard]
                        }
                    });
                }
            }
        }

        private async openPreview() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', this._model.probability_id);
        }

        private onCollect(): void {
            let get: boolean = clientCore.ItemsInfo.getItemNum(this._model.bgShowId) > 0;
            if (get) return;
            if (this.btnShow.gray) {
                let suitame = clientCore.ItemsInfo.getItemName(this._model.suitId)
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this._model.bgShowId], condition: '集齐{' + suitame + '}可获得', limit: '' });
            } else {
                this._control.reqBg(new Laya.Handler(this, this.updateShow));
            }
        }

        private onShoushiTips(): void {
            clientCore.ToolTip.showTips(this.imgShoushi, { id: this._model.shoushiId });
        }

        /** 打开卡片*/
        private onCard(pos: number): void {
            if (!this._isStart || this._open.get(pos) || this._isCard) return
            if (!clientCore.MoneyManager.checkLeaf(parseInt(this.txCost.text))) return;
            let card: ui.oneLeafAutumn.item.CardUI = this['card_' + pos];
            this._isCard = true;
            this._control.openCard(pos, new Laya.Handler(this, async (data: pb.sc_flower_field_market_orange_divine) => {
                if (!data) { //失败了
                    this._isCard = false;
                    return;
                }
                this._open.set(pos, data.cardId);
                let info: pb.OpenedCard = new pb.OpenedCard();
                info.cardPos = pos;
                info.cardId = data.cardId;
                this._model.openedCardInfo.push(info);
                this._model.cardInfo[pos - 1] = data.cardId;
                this._model.quickCardFlag = data.quickCardFlag;
                this._model.luckNum++;
                this._model.times++;
                this.onSelectCards(pos);
                this.showCard(card, data.cardId);
                card.ani1.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
                await new Promise((suc) => {
                    card.ani1.once(Laya.Event.COMPLETE, this, () => { suc(1); });
                    card.ani1.play(0, false);
                })
                if (this._destryed) return;
                if (data.item.length > 0) {
                    let len: number = data.item.length;
                    for (let i: number = 0; i < len; i++) {
                        let id: number = data.item[i].id;
                        if (xls.get(xls.itemCloth).has(id)) {
                            clientCore.ToolTip.hideTips();
                            await alert.showDrawClothReward(id);
                        }
                    }
                    alert.showReward(clientCore.GoodsInfo.createArray(data.item));
                }
                this._isCard = false;
                this.txMult.changeText(data.quickCardFlag + '');
                this.txCost.changeText(`${this._cls.openCost.v2 + this._model.times * this._cls.openCost.v3}`);
                this.imgOwned.visible = this._model.hasShoushi;
                this.updateLucky();
                this.updateShow();
            }))
        }

        /**礼包购买检查 */
        private cheapBuySucc(id: number) {
            this.checkBuyCheapReward();
        }
        /**检查超值礼包的购买情况 */
        private checkBuyCheapReward() {
            let showFlag = false;
            for (let i = 0; i < this._model.rechargeIDArr.length; i++) {
                let canBuy = clientCore.RechargeManager.checkBuyLimitInfo(this._model.rechargeIDArr[i]).lastTime < util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
                if (canBuy) {
                    if (i == 0) {
                        this.imgRewardBox.skin = "oneLeafAutumn/img_6.png";
                    }
                    else if (i == 1) {
                        this.imgRewardBox.skin = "oneLeafAutumn/img_68.png";
                    }
                    this._curShowRechargeID = this._model.rechargeIDArr[i];
                    showFlag = true;
                    break;
                }
            }
            this.imgRewardBox.visible = showFlag;
        }
        /**显示购买界面 */
        private showCheapBoxInfo() {
            this._cheapBuyPanel.showInfo(this._curShowRechargeID);
            clientCore.DialogMgr.ins.open(this._cheapBuyPanel);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTip, Laya.Event.CLICK, this, this.onTip);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.onReset);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.openPreview);
            BC.addEvent(this, this.boxCollect, Laya.Event.CLICK, this, this.onCollect);
            BC.addEvent(this, this.imgShoushi, Laya.Event.CLICK, this, this.onShoushiTips);
            BC.addEvent(this, this._cheapBuyPanel, "CHEAP_PACKAGE_BUY_SUCC", this, this.cheapBuySucc);
            BC.addEvent(this, this.imgRewardBox, Laya.Event.CLICK, this, this.showCheapBoxInfo);
            for (let i: number = 1; i < 10; i++) {
                BC.addEvent(this, this['card_' + i], Laya.Event.CLICK, this, this.onCard, [i]);
            }
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._destryed = true;
            this._open.clear();
            this._open = this._model = this._control = null;

            this._cheapBuyPanel?.destroy();
            this._cheapBuyPanel = null;
            clientCore.UIManager.releaseCoinBox();
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }
    }
}