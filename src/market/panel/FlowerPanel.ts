namespace market {
    /**
     * 桔梗之花
     */
    export class FlowerPanel extends ui.market.panel.FlowerPanelUI {
        private _control: MarketControl;
        private _times: number = 0; //已经抽卡的次数
        private _isStart: boolean = false;
        private _open: Map<number, number> = new Map();
        private _msg: pb.sc_flower_field_market_orange_get_info;
        private _isCard: boolean; //正在打开卡片中
        private _cls: xls.openCardDraw;
        private _destryed: boolean = false;

        private readonly ACTIVITY_SUIT: number = 2100163;//活动服装
        private readonly MAX_LUCKY: number = 100; //最大幸运值
        private readonly BG_SHOW: number = 1000005;//背景秀
        private readonly STAGE: number = 1100001;//舞台

        constructor(sign: number) {
            super();
            this.addEventListeners();
            this._control = clientCore.CManager.getControl(sign) as MarketControl;
            this.npc.skin = `unpack/market/npc${clientCore.LocalInfo.sex}.png`;
        }

        async init(): Promise<void> {
            if (!this._msg) {
                this._msg = await this._control.flowerInfo();
                let data: number[] = this._msg.cardInfo;
                let open: pb.IOpenedCard[] = this._msg.openedCardInfo;
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
                this._times = this._msg.openedCardInfo.length;
                this._cls = this._cls || xls.get(xls.openCardDraw).get(36);
                this.txCost.changeText(`${this._cls.openCost.v2 + this._times * this._cls.openCost.v3}`);
                this.txMult.changeText(this._msg.quickCardFlag + '');
                this.txLucky.changeText(this._msg.luckNum + '');
                if (this._msg.isFirstOpen == 0) {
                    for (let i: number = 1; i < 10; i++) { this['card_' + i]?.ani1.gotoAndStop(0); }
                } else {
                    this.showCardsCache();
                }
            }
            this.updateShow();
        }

        addEventListeners(): void {
            for (let i: number = 1; i < 10; i++) { BC.addEvent(this, this['card_' + i], Laya.Event.CLICK, this, this.onCard, [i]); }
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.onReset);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.openPreview);
            BC.addEvent(this, this.btnShow, Laya.Event.CLICK, this, this.onShow);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._destryed = true;
            this._open.clear();
            this._cls = this._open = this._msg = this._control = null;
            super.destroy();
        }

        private showCardsCache(): void {
            let data: number[] = this._msg.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.market.item.CardUI = this['card_' + i];
                let id: number = data[i - 1];
                this.showCard(card, id);
                this._open.get(i) ? card.ani1.gotoAndStop(20) : card.ani1.gotoAndStop(0);
            }
            this._isStart = true;
        }

        async showCards(): Promise<void> {
            let data: number[] = this._msg.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.market.item.CardUI = this['card_' + i];
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
            await new Promise((suc) => { this.card_9.ani1.once(Laya.Event.COMPLETE, this, () => { suc(); }); })
            if (this._destryed) return;
            await new Promise((suc) => {
                this.ani1.once(Laya.Event.COMPLETE, this, () => { suc(); });
                this.ani1.play(0, false);
            })
            if (this._destryed) return;
            this._isStart = true;
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.ACTIVITY_SUIT);
        }

        /** 重置*/
        private onReset(): void {
            if (!this._isStart && this._msg.isFirstOpen == 1) return; //没开始
            if (this._msg.isFirstOpen == 0) {
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

        private resetCard(): void {
            this._isStart = false;
            this._control.resetCard(new Laya.Handler(this, (data: number[]) => {
                this._msg.cardInfo = data;
                this._msg.openedCardInfo.length = 0;
                this._open.clear();
                //倍数归零
                this._msg.quickCardFlag = 0;
                this.txMult.changeText(this._msg.quickCardFlag + '');
                //花费归零
                this._times = 0;
                this.txCost.changeText(`${this._cls.openCost.v2 + this._times * this._cls.openCost.v3}`);
                //占卜后
                if (this._msg.isFirstOpen == 0) {
                    this._msg.isFirstOpen = 1;
                    this.updateReset();
                }
                this.showCards();
            }))
        }

        /** 打开卡片*/
        private onCard(pos: number): void {
            if (!this._isStart || this._open.get(pos) || this._isCard) return
            if (!clientCore.MoneyManager.checkLeaf(parseInt(this.txCost.text))) return;
            let card: ui.market.item.CardUI = this['card_' + pos];
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
                this._msg.openedCardInfo.push(info);
                this._msg.cardInfo[pos - 1] = data.cardId;
                this._msg.quickCardFlag = data.quickCardFlag;
                this._msg.luckNum++;
                this._times++;
                this.showCard(card, data.cardId);
                card.ani1.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
                await new Promise((suc) => {
                    card.ani1.once(Laya.Event.COMPLETE, this, () => { suc(); });
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
                this.txCost.changeText(`${this._cls.openCost.v2 + this._times * this._cls.openCost.v3}`);
                this.updateLucky();
                this.updateShow();
            }))
        }

        private showCard(card: ui.market.item.CardUI, id: number): void {
            if (id < 10000) {
                let cls: xls.godTree = xls.get(xls.godTree).get(id);
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
                card.ico.skin = `market/${['x2', 'x3', 'x5'][index]}.png`;
                card.ico.scale(1, 1);
            }
        }

        private updateReset(): void {
            let first: boolean = this._msg.isFirstOpen == 0;
            this.btnStart.fontSkin = first ? "market/T_y_zhanbu.png" : "market/reset.png";
            this.btnStart.fontX = first ? 72.5 : 70;
            this.btnStart.fontY = first ? 20 : 8;
        }

        private async openPreview() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 7);
        }

        private updateLucky(): void {
            this._msg.luckNum = Math.min(100, this._msg.luckNum);
            let ratio: number = this._msg.luckNum / this.MAX_LUCKY;
            this.imgLucky.height = ratio * 261;
            this.txLucky.changeText(this._msg.luckNum + '');
        }

        /** 更新背景秀相关*/
        private updateShow(): void {
            let get: boolean = clientCore.ItemsInfo.getItemNum(this.BG_SHOW) > 0;
            this.btnShow.visible = !get;
            let info: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(this.ACTIVITY_SUIT);
            this.txCnt.changeText(`${info.hasCnt}/${info.clothes.length}`);
            this.txShow.changeText(info.allGet ? '领取' : '集齐奖励');
            this.btnShow.visible && (this.btnShow.gray = !info.allGet);
        }

        private onShow(): void {
            let get: boolean = clientCore.ItemsInfo.getItemNum(this.BG_SHOW) > 0;
            if (get) return;
            if (this.btnShow.gray) {
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this.BG_SHOW, this.STAGE] });
            } else {
                this._control.reqBg(new Laya.Handler(this, this.updateShow));
            }
        }
    }
}