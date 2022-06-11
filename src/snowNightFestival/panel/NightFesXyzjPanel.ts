namespace snowNightFestival {
    export class NightFesXyzjPanel extends ui.snowNightFestival.panel.NightFesXyzjPanelUI {
        public readonly activityId: number = 106;        //活动id
        public _suitId: number = 2100251;       //套装id
        public _bgShowId: number = 1000056;     //背景秀id
        public _stageId: number = 1100047;
        public tips_Id: number = 1119;         //规则说明id
        public readonly max_lucky: number = 100;        //最大幸运值

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
        private _curPool: number;

        private curPage: number;
        private panelName: { name: string, open: number }[];

        private _control: SnowNightFestivalControl;

        constructor(sign: number) {
            super();
            this.addEventListeners();
            this._control = clientCore.CManager.getControl(sign) as SnowNightFestivalControl;
            this.imgFemaleSdsg.visible = this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMaleSdsg.visible = this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.panelName = [{ name: "xdhx", open: 0 }, { name: "sdsg", open: 1 }];
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.tabRender);
            this.list.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.list.array = this.panelName;
        }

        /**页签 */
        private tabRender(item: ui.snowNightFestival.render.PageTagItem1UI) {
            let data: { name: string, open: number } = item.dataSource;
            item.di_1.visible = data.open == 1;
            item.img_name.skin = `snowNightFestival/tag_${data.name}_${data.open}.png`;
            switch (data.name) {
                case "xdhx":
                    item.red.visible = util.RedPoint.checkShow([21304]);
                    break;
                case "sdsg":
                    item.red.visible = util.RedPoint.checkShow([21307]);
                    break;
                default:
                    item.red.visible = false;
            }
        }

        private tabMouse(idx: number) {
            if (idx < 0) return;
            if (idx == this.curPage - 1) return;
            if (this._isCard) {
                this.list.selectedIndex = -1;
                return;
            }
            if (this.curPage > 0) {
                this["box" + this.curPage].visible = false;
                this.panelName[this.curPage - 1].open = 0;
            }
            this.panelName[idx].open = 1;
            this.list.refresh();
            this.curPage = idx + 1;
            this["box" + this.curPage].visible = true;
            if (idx == 0) this.setOneUI();
            else if (idx == 1) this.setTwoUI();
            this.setCardInfo();
            this.list.selectedIndex = -1;
        }

        /**第一期UI */
        private setOneUI() {
            this._curPool = 1;
            this.btnTryStage.visible = this.di_stage.visible = this.nameStage.visible = false;
            this.nameBgShow.text = "星灯幻象馆背景秀";
            this.nameSuit.text = "星灯幻象馆套装";
            this.boxCollect.skin = "snowNightFestival/bei_jing_xiu_li_wu_he.png";
            this._suitId = 2100251;
            this._bgShowId = 1000056;
        }

        /**第二期UI */
        private setTwoUI() {
            this._curPool = 2;
            this.btnTryStage.visible = this.di_stage.visible = this.nameStage.visible = true;
            this.nameBgShow.text = "圣诞圣歌背景秀";
            this.nameStage.text = "圣诞圣歌舞台";
            this.nameSuit.text = "圣诞圣歌套装";
            this.boxCollect.skin = `snowNightFestival/eye_sdsg_${clientCore.LocalInfo.sex}.png`;
            this._suitId = 2100151;
            this._bgShowId = 1000075;
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

        /** 获取开牌数据
         * @param id 卡池唯一id
         *  **/
        getOpenCardDraw(id): xls.openCardDraw {
            return xls.get(xls.openCardDraw).get(id);
        }

        /** 获取开牌数据 **/
        godTree(id): xls.godTree {
            return xls.get(xls.godTree).get(id);
        }

        /** 获取赠品id **/
        private get giftId(): number {
            return clientCore.LocalInfo.sex == 1 ? this._cls.awardFemale[0].v1 : this._cls.awardMale[0].v1;
        }

        public onShow() {
            this.tabMouse(1);
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private async setCardInfo() {
            let msg = await this._control.openCardInfo(this._curPool);
            this._open.clear();
            this._isStart = false;
            this.updateInfo(msg);
            this._cls = this.getOpenCardDraw(this._curPool);
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
            this.updateGift();
            this.onSelectCards(-1);
        }

        public hide() {
            clientCore.UIManager.releaseCoinBox();
            this.visible = false;
        }

        private updateReset(): void {
            let first: boolean = this.isFirstOpen == 0;
            this.btnStart.visible = first;
            this.btnReset.visible = !first;
        }

        private updateLucky(): void {
            this.luckNum = Math.min(this.max_lucky, this.luckNum);
            let ratio: number = this.luckNum / this.max_lucky;
            this.imgLucky.height = ratio * 225;
            this.txLucky.changeText(this.luckNum + '');
        }

        /** 更新赠品相关*/
        private updateGift(): void {
            let get: boolean = clientCore.ItemsInfo.getItemNum(this.giftId) > 0;
            let getBShow = clientCore.ItemsInfo.getItemNum(this._bgShowId);
            let getStage = clientCore.ItemsInfo.getItemNum(this._stageId);
            this.btnShow.visible = !get;
            let info = clientCore.SuitsInfo.getSuitInfo(this._suitId);
            let clothCnt = info.clothes.length - 3;//去掉美瞳
            let poolCnt = clothCnt + 1;//加上背景秀
            let allGet = info.hasCnt >= clothCnt && getBShow;
            if (this.curPage == 2) {
                poolCnt++;//加上舞台
                allGet = allGet && getStage;
            }
            let getCnt = info.hasCnt;
            if (getCnt > clothCnt) getCnt = poolCnt;
            else {
                if (getBShow) getCnt++;
                if (this.curPage == 2 && getStage) getCnt++;
            }
            this.txCnt.changeText(`${getCnt}/${poolCnt}`);
            this.txShow.changeText(allGet ? '领取奖励' : '集齐奖励');
            this.btnShow.visible && (this.btnShow.gray = !allGet);
            this.imgReceived.visible = get;
        }

        private showCardsCache(): void {
            let data: number[] = this.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.snowNightFestival.render.XyzjCardRenderUI = this['card_' + i];
                let id: number = data[i - 1];
                this.showCard(card, id);
                this._open.get(i) ? card.ani1.gotoAndStop(20) : card.ani1.gotoAndStop(0);
            }
            this._isStart = true;
        }

        private onSelectCards(value: number): void {
            for (let i: number = 1; i < 10; i++) {
                let card: ui.snowNightFestival.render.XyzjCardRenderUI = this['card_' + i];
                card.imgSelect.visible = value == i;
            }
        }

        private showCard(card: ui.snowNightFestival.render.XyzjCardRenderUI, id: number): void {
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
                card.ico.skin = `snowNightFestival/${['x2', 'x3', 'x5'][index]}.png`;
                card.ico.scale(1, 1);
            }
        }

        private resetCard(): void {
            this._isStart = false;
            this._isCard = true;
            this._control.resetCard(this._curPool, new Laya.Handler(this, (data: number[]) => {
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
                let card: ui.snowNightFestival.render.XyzjCardRenderUI = this['card_' + i];
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
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._suitId);
        }

        /** 重置*/
        private onReset(): void {
            if (!this._isStart && this.isFirstOpen == 1) return; //没开始
            if (this.isFirstOpen == 0) {
                if (clientCore.MoneyManager.checkLeaf(this._cls.reloadCost.v2)) {
                    alert.showSmall(`确定要花费${this._cls.reloadCost.v2}灵豆开始祈愿吗？`, {
                        callBack: {
                            caller: this,
                            funArr: [this.resetCard]
                        }
                    });
                }
            } else {
                if (clientCore.MoneyManager.checkLeaf(this._cls.reloadCost.v2)) {
                    alert.showSmall(`是否花费${this._cls.reloadCost.v2}灵豆重置？`, {
                        callBack: {
                            caller: this,
                            funArr: [this.resetCard]
                        }
                    });
                }
            }
        }

        private openPreview() {
            let id = this.curPage == 1 ? 11 : 14;
            clientCore.ModuleManager.open('probability.ProbabilityModule', id);
        }

        private async onCollect() {
            let get: boolean = clientCore.ItemsInfo.getItemNum(this.giftId) > 0;
            if (get) return;
            if (this.btnShow.gray) {
                let rwd = clientCore.LocalInfo.sex == 1 ? this._cls.awardFemale : this._cls.awardMale;
                clientCore.ModuleManager.open('panelCommon.RewardShowModule', { reward: clientCore.GoodsInfo.createArray(rwd) });
            } else {
                this._control.reqBg(this._curPool, new Laya.Handler(this, this.updateGift));
                await util.RedPoint.reqRedPointRefresh(21304);
                await util.RedPoint.reqRedPointRefresh(21307);
                EventManager.event("NIGHTFES_REFRESH_TAB");
                this.updateGift();
            }
        }

        /** 打开卡片*/
        private onCard(pos: number): void {
            if (!this._isStart || this._open.get(pos) || this._isCard) return
            if (!clientCore.MoneyManager.checkLeaf(parseInt(this.txCost.text))) return;
            let card: ui.snowNightFestival.render.XyzjCardRenderUI = this['card_' + pos];
            this._isCard = true;
            this._control.openCard(this._curPool, pos, new Laya.Handler(this, async (data: pb.sc_flower_field_market_orange_divine) => {
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
                this.updateGift();
            }))
        }

        /**预览背景秀 */
        private tryBgStage(_id: number) {
            if (!_id) _id = this._bgShowId;
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: _id, condition: '', limit: '' });
        }

        private async getReward() {
            let get: boolean = clientCore.ItemsInfo.getItemNum(this.giftId) > 0;
            if (get) return;
            if (!this.btnShow.gray) {
                this._control.reqBg(this._curPool, new Laya.Handler(this, this.updateGift));
                await util.RedPoint.reqRedPointRefresh(21304);
                await util.RedPoint.reqRedPointRefresh(21307);
                this.list.refresh();
                EventManager.event("NIGHTFES_REFRESH_TAB");
                this.updateGift();
            }
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onTip);
            BC.addEvent(this, this.btnTrySuit, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnTryBg, Laya.Event.CLICK, this, this.tryBgStage, [0]);
            BC.addEvent(this, this.btnTryStage, Laya.Event.CLICK, this, this.tryBgStage, [1100047]);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.onReset);
            BC.addEvent(this, this.btnReset, Laya.Event.CLICK, this, this.onReset);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.openPreview);
            BC.addEvent(this, this.boxCollect, Laya.Event.CLICK, this, this.onCollect);
            BC.addEvent(this, this.btnShow, Laya.Event.CLICK, this, this.getReward);
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