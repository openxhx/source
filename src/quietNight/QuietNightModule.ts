namespace quietNight {
    /**
     * 静夜思
     * 2021.9.17
     */
    export class QuietNightModule extends ui.quietNight.QuietNightModuleUI {
        /**套装id */
        private suitId: number = 2110489;
        /**规则id */
        private ruleId: number = 1161;
        /**抽奖功能id */
        private curDraw: number = 9;
        /**唯一id */
        private curPool: number = 2;
        /**最大幸运值 */
        public readonly max_lucky: number = 100;
        /**遮罩高度 */
        private maskHeight: number = 280;

        public times: number = 0; //已经抽卡的次数
        public openedCardInfo: pb.IOpenedCard[];// 已翻开的卡牌信息
        public cardFlag: number;// 已抽取的卡牌标记 bit 1~9
        public quickCardFlag: number;// 加倍信息 0 表示没有加倍卡，其他数字即表示要加的倍数
        public luckNum: number;// 幸运值
        public isFirstOpen: number;// 是否第一次打开
        public cardInfo: number[];// 所有的卡牌信息,即卡牌的在godTree里的id 无序
        private _isStart: boolean = false;//是否翻了卡牌
        private _destryed: boolean = false;//是否已经关闭面板
        private _isCard: boolean; //正在打开卡牌中
        private _open: Map<number, number> = new Map();
        private _cls: xls.openCardDraw;

        init() {
            this.addPreLoad(xls.load(xls.openCardDraw));
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.itemCloth));
            
        }

        onPreloadOver() {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.setCardInfo();
            clientCore.Logger.sendLog('2021年9月17日活动', '【付费】静夜思', '打开静夜思面板');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnReset, Laya.Event.CLICK, this, this.onReset);
            for (let i: number = 1; i < 10; i++) {
                BC.addEvent(this, this['card_' + i], Laya.Event.CLICK, this, this.onCard, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._destryed = true;
            this._open.clear();
            this.cardInfo = this.openedCardInfo = this._open = null;
            super.destroy();
        }

        /**奖励总览 */
        private preReward() {
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", this.curDraw);
        }
        /**规则 */
        private onRule(): void {
            alert.showRuleByID(this.ruleId);
        }
        /**试装 */
        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suitId);
        }


        /** 更新界面数据 **/
        private updateInfo(msg: pb.sc_common_open_card_get_info) {
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
        /** 获取翻牌子信息*/
        public openCardInfo(id: number): Promise<pb.sc_common_open_card_get_info> {
            return net.sendAndWait(new pb.cs_common_open_card_get_info({ id: id })).then((msg: pb.sc_common_open_card_get_info) => {
                return Promise.resolve(msg);
            })
        }

        /** 获取开牌数据 **/
        private godTree(id): xls.godTree {
            return xls.get(xls.godTree).get(id);
        }

        /** 重置卡片信息*/
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

        /**更新开始与重铸按钮状态 */
        private updateReset(): void {
            let first: boolean = this.isFirstOpen == 0;
            this.btnReset.fontSkin = first ? "quietNight/kai_shi_zhan_bu.png" : "quietNight/chong_zhi.png";
            this.btnReset.fontY = first ? 20 : 8;
        }

        /**更新幸运值 */
        private updateLucky(): void {
            this.luckNum = Math.min(this.max_lucky, this.luckNum);
            let ratio: number = this.luckNum / this.max_lucky;
            this.imgMask.height = this.maskHeight * ratio;
            this.txLucky.changeText(this.luckNum + '');
        }

        /**翻牌子动画 */
        private showCardsCache(): void {
            let data: number[] = this.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.quietNight.render.QuietNightRenderUI = this['card_' + i];
                let id: number = data[i - 1];
                this.showCard(card, id);
                this._open.get(i) ? card.ani1.gotoAndStop(20) : card.ani1.gotoAndStop(0);
            }
            this._isStart = true;
        }



        private onSelectCards(value: number): void {
            for (let i: number = 1; i < 10; i++) {
                let card: ui.quietNight.render.QuietNightRenderUI = this['card_' + i];
                card.imgSelect.visible = value == i;
            }
        }

        /**展示牌面 */
        private showCard(card: ui.quietNight.render.QuietNightRenderUI, id: number): void {
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
                card.ico.skin = `quietNight/${['x2', 'x3', 'x5'][index]}.png`;
                card.ico.scale(1, 1);
            }
        }

        /**重置卡片方法 */
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

        /**所以卡片展示*/
        async showCards(): Promise<void> {
            let data: number[] = this.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.quietNight.render.QuietNightRenderUI = this['card_' + i];
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
            this._isStart = true;
            this._isCard = false;
        }

        /** 点击重置按钮*/
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


        /** 点击卡片*/
        private onCard(pos: number): void {
            if (!this._isStart || this._open.get(pos) || this._isCard) return
            if (!clientCore.MoneyManager.checkLeaf(parseInt(this.txCost.text))) return;
            let card: ui.quietNight.render.QuietNightRenderUI = this['card_' + pos];
            this._isCard = true;
            this.openCard(this.curPool, pos, new Laya.Handler(this, async (data: pb.sc_common_open_card_divine) => {
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





    }
}