namespace yearSong {
    export class RollCardPanel extends ui.yearSong.panel.RollCardPanelUI {
        /**套装id */
        private suitId: number = 2110534;
        /**规则id */
        private tips_Id: number = 1186;
        /**概率id */
        private probabilityId: number = 37;
        /**抽奖功能id */
        private curDraw: number = 9;
        /**唯一id */
        private curPool: number = 2;
        /**最大幸运值 */
        public readonly max_lucky: number = 100;
        /**遮罩高度 */
        private maskHeight:number = 285;

        public times: number = 0; //已经抽卡的次数
        public openedCardInfo: pb.IOpenedCard[];
        public cardFlag: number;
        public quickCardFlag: number;
        public luckNum: number;
        public isFirstOpen: number;
        public cardInfo: number[];

        private _isStart: boolean = false;
        private _destryed: boolean = false;
        private _isCard: boolean; //正在打开卡片中
        private _open: Map<number, number> = new Map();
        private _cls: xls.openCardDraw;

        constructor() {
            super();
            this.addEventListeners();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
        }

        async show() {
            clientCore.LoadingManager.showSmall();
            await this.setCardInfo();
            clientCore.LoadingManager.hideSmall(true);
            clientCore.UIManager.setMoneyIds([9900002]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年11月12日活动', '【付费】岁月如歌', '打开龙言凤语-水泽星海面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_common_open_card_get_info) {
            this.openedCardInfo = msg.openedCardInfo;
            this.cardFlag = msg.cardFlag;
            this.quickCardFlag = msg.quickCardFlag;
            this.luckNum = msg.luckNum;
            this.isFirstOpen = msg.isFirstOpen;
            this.cardInfo = msg.cardInfo;
        }
        //#region
        /** 获取开牌数据
         * @param id 卡池唯一id
         *  **/
        private getOpenCardDraw(id): xls.openCardDraw {
            return xls.get(xls.openCardDraw).get(id);
        }

        /** 获取开牌数据 **/
        private godTree(id): xls.godTree {
            return xls.get(xls.godTree).get(id);
        }

        /** 获取赠品id **/
        private get giftId(): number {
            return clientCore.LocalInfo.sex == 1 ? this._cls.awardFemale[0].v1 : this._cls.awardMale[0].v1;
        }

        /** 获取翻牌子信息*/
        public openCardInfo(id: number): Promise<pb.sc_common_open_card_get_info> {
            return net.sendAndWait(new pb.cs_common_open_card_get_info({ id: id })).then((msg: pb.sc_common_open_card_get_info) => {
                return Promise.resolve(msg);
            })
        }

        /** 重置*/
        public netResetCard(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_open_card_reset_card({ id: id })).then((msg: pb.sc_common_open_card_reset_card) => {
                handler?.runWith([msg.cardInfo]);
            })
        }

        /** 翻牌子*/
        public openCard(id: number, pos: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_open_card_divine({ id: id, cardPos: pos })).then((msg: pb.sc_common_open_card_divine) => {
                handler?.runWith(msg);
            }).catch(() => {
                handler?.run();
            })
        }
        //#endregion

        private async setCardInfo() {
            let msg = await this.openCardInfo(this.curPool);
            this._open.clear();
            this._isStart = false;
            this.updateInfo(msg);
            this._cls = this.getOpenCardDraw(this.curPool);
            let data: number[] = this.cardInfo;
            let open: pb.IOpenedCard[] = this.openedCardInfo;
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
            this.times = this.openedCardInfo.length;
            this.txCost.changeText(`${this._cls.openCost.v2 + this.times * this._cls.openCost.v3}`);
            this.txMult.changeText(this.quickCardFlag + '');
            this.txLucky.changeText(this.luckNum + '');
            if (this.isFirstOpen == 0) {
                for (let i: number = 1; i < 10; i++) { this['card_' + i]?.ani1.gotoAndStop(0); }
            } else {
                this.showCardsCache();
            }
            this.onSelectCards(-1);
        }

        private updateReset(): void {
            let first: boolean = this.isFirstOpen == 0;
            this.btnReset.fontSkin = first ? "yearSong/RollCardPanel/kai_shi_zhan_bu.png" : "yearSong/RollCardPanel/chong_zhi.png";
            this.btnReset.fontY = first ? 20 : 8;
            // if (first) this.txCost.text = '0';
        }

        private updateLucky(): void {
            this.luckNum = Math.min(this.max_lucky, this.luckNum);
            let ratio: number = this.luckNum / this.max_lucky;
            this.imgMask.height = this.maskHeight * ratio;
            this.txLucky.changeText(this.luckNum + '');
        }

        private showCardsCache(): void {
            let data: number[] = this.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.bigCharge.render.RollCardRenderUI = this['card_' + i];
                let id: number = data[i - 1];
                this.showCard(card, id);
                this._open.get(i) ? card.ani1.gotoAndStop(20) : card.ani1.gotoAndStop(0);
            }
            this._isStart = true;
        }

        private onSelectCards(value: number): void {
            for (let i: number = 1; i < 10; i++) {
                let card: ui.bigCharge.render.RollCardRenderUI = this['card_' + i];
                card.imgSelect.visible = value == i;
            }
        }

        private showCard(card: ui.bigCharge.render.RollCardRenderUI, id: number): void {
            if (id < 10000) {
                let cls: xls.godTree = this.godTree(id);
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
                card.ico.skin = `yearSong/RollCardPanel/${['x2', 'x3', 'x5'][index]}.png`;
                card.ico.scale(0.8, 0.6);
            }
        }

        private resetCard(): void {
            this._isStart = false;
            this._isCard = true;
            this.netResetCard(this.curPool, new Laya.Handler(this, (data: number[]) => {
                this.cardInfo = data;
                this.openedCardInfo.length = 0;
                this._open.clear();
                //倍数归零
                this.quickCardFlag = 0;
                this.txMult.changeText(this.quickCardFlag + '');
                //花费归零
                this.times = 0;
                this.txCost.changeText(`${this._cls.openCost.v2 + this.times * this._cls.openCost.v3}`);
                //占卜后
                if (this.isFirstOpen == 0) {
                    this.isFirstOpen = 1;
                    this.updateReset();
                } 
                this.showCards();
                this.onSelectCards(-1);
            }))
        }

        async showCards(): Promise<void> {
            let data: number[] = this.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.bigCharge.render.RollCardRenderUI = this['card_' + i];
                let id: number = data[i - 1];
                card.ani1.gotoAndStop(32);
                this.showCard(card, id);
            }
            if (this._open.size == 9) { //全翻完了
                this._isStart = true;
                this._isCard = false;
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
            // await new Promise((suc) => {
            //     this.ani1.once(Laya.Event.COMPLETE, this, () => { suc(); });
            //     this.ani1.play(0, false);
            // })
            if (this._destryed) return;
            this._isStart = true;
            this._isCard = false;
        }

        private onTip(): void {
            alert.showRuleByID(this.tips_Id);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suitId);
        }

        /** 重置*/
        private onReset(): void {
            if (!this._isStart && this.isFirstOpen == 1) return; //没开始
            if (this.isFirstOpen == 0) {
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

        private openPreview() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', this.probabilityId);
        }

        /** 打开卡片*/
        private onCard(pos: number): void {
            if (!this._isStart || this._open.get(pos) || this._isCard) return
            if (!clientCore.MoneyManager.checkLeaf(parseInt(this.txCost.text))) return;
            let card: ui.bigCharge.render.RollCardRenderUI = this['card_' + pos];
            this._isCard = true;
            this.openCard(this.curPool, pos, new Laya.Handler(this, async (data: pb.sc_flower_field_market_orange_divine) => {
                if (!data) { //失败了
                    this._isCard = false;
                    return;
                }
                this._open.set(pos, data.cardId);
                let info: pb.OpenedCard = new pb.OpenedCard();
                info.cardPos = pos;
                info.cardId = data.cardId;
                this.openedCardInfo.push(info);
                this.cardInfo[pos - 1] = data.cardId;
                this.quickCardFlag = data.quickCardFlag;
                this.luckNum++;
                this.times++;
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
                this.txCost.changeText(`${this._cls.openCost.v2 + this.times * this._cls.openCost.v3}`);
                this.updateLucky();
            }))
        }

        // /**预览背景秀 */
        // private tryBgShow() {
        //     clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this._bgShowId], condition: '', limit: '' });
        // }

        // /**预览舞台 */
        // private tryStage() {
        //     clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this._stageId], condition: '', limit: '' });
        // }

        private preReward() {
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", this.curDraw);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onTip);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnReset, Laya.Event.CLICK, this, this.onReset);
            BC.addEvent(this, this.btnGailv, Laya.Event.CLICK, this, this.openPreview);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.preReward);
            for (let i: number = 1; i < 10; i++) {
                BC.addEvent(this, this['card_' + i], Laya.Event.CLICK, this, this.onCard, [i]);
            }
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._destryed = true;
            this.removeEventListeners();
            this._open.clear();
            this.cardInfo = this.openedCardInfo = this._open = null;
            super.destroy();
        }
    }
}