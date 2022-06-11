namespace timeAmbulatory {
    export class TimeIdentifyPanle extends ui.timeAmbulatory.panel.TimeIdentifyPanelUI {
        public readonly activityId: number = 112;        //活动id
        public _suitId: number = 2100275;       //套装id
        public _bgShowId: number = 1000056;     //背景秀id
        public _stageId: number;//舞台ID
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

        private _control: TimeAmbulatoryControl;

        //自动切换相关属性
        private defultPage: number;

        constructor(sign: number) {
            super();
            this.addEventListeners();
            this._control = clientCore.CManager.getControl(sign) as TimeAmbulatoryControl;
            this.imgXsxm1.visible = this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgXsxm2.visible = this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.panelName = [{ name: "tianguojiayi", open: 1 }];
            this.defultPage = 0;
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.tabRender);
            this.list.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.list.repeatX = this.panelName.length;
            this.list.array = this.panelName;
        }

        /**页签 */
        private tabRender(item: ui.timeAmbulatory.render.TimeTagRenderUI) {
            let data: { name: string, open: number } = item.dataSource;
            item.tip.visible = data.open == 1;
            item.bg.skin = `timeAmbulatory/di_tag_${data.open}.png`;
            item.img.skin = `timeAmbulatory/${data.name}_${data.open}.png`;
            switch (data.name) {
                default:
                    item.red.visible = false;
            }
        }

        private tabMouse(idx: number) {
            if (idx < 0 || idx > this.defultPage) return;
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

        /**天国嫁衣UI */
        private setOneUI() {
            clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '打开天国嫁衣页签');
            this._curPool = 1;
            this._suitId = 2100280;
            this._bgShowId = 1000087;
            this.tips_Id = 1127;
            this.imgSuitName.skin = "timeAmbulatory/name_tgjy_suit.png";
            this.imgBgshowName.skin = "timeAmbulatory/name_fsyd_bg.png";
            this.boxStage.visible = false;
            this.imgEye.skin = "timeAmbulatory/eye_tianguojiayi.png";
            this.boxCollect.visible = true;
            this.txtTime.text = "本期时间：	2月12日~3月18日";
        }

        /**雪岁新莓UI */
        private setTwoUI() {
            clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '打开雪岁新莓页签');
            this._curPool = 2;
            this._suitId = 2110245;
            this._bgShowId = 1000084;
            this._stageId = 1100055;
            this.tips_Id = 1119;
            this.imgSuitName.skin = "timeAmbulatory/name_xsxm_suit.png";
            this.imgBgshowName.skin = "timeAmbulatory/name_mzz_bg.png";
            this.imgStageName.skin = "timeAmbulatory/name_dfzt_stage.png";
            this.imgEye.skin = "timeAmbulatory/eye_xuesuixinmei.png";
            this.boxStage.visible = true;
            this.boxCollect.visible = true;
            this.txtTime.text = "本期时间：	2月8日~2月25日";
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
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '打开光阴之鉴面板');
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.tabMouse(this.defultPage);
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
            this.btnReset.fontSkin = first ? "timeAmbulatory/kai_shi_jian_ding.png" : "timeAmbulatory/reset.png";
            this.boxCost.visible = !first;
        }

        private updateLucky(): void {
            this.luckNum = Math.min(this.max_lucky, this.luckNum);
            let ratio: number = this.luckNum / this.max_lucky;
            let angle = ratio * 360 - 90;
            this.imgMask.graphics.clear(true);
            if (angle > -90) this.imgMask.graphics.drawPie(0, 0, 116, -90, angle, "#ffffff");
            else this.imgMask.graphics.drawLine(0, 0, 0, -1, "#ffffff");
            this.txLucky.changeText(this.luckNum + '');
        }

        /** 更新赠品相关*/
        private updateGift(): void {
            let get: boolean = clientCore.ItemsInfo.checkHaveItem(this.giftId);
            let condition = clientCore.LocalInfo.sex == 1 ? this._cls.conditionFemale : this._cls.conditionMale;
            let poolCnt = condition.length;
            let getCnt = 0;
            for (let i: number = 0; i < condition.length; i++) {
                if (clientCore.ItemsInfo.checkHaveItem(condition[i].v1)) {
                    getCnt++;
                }
            }
            this.txCnt.changeText(`${getCnt}/${poolCnt}`);
            this.txtExtra.text = get ? "已领取" : (getCnt == poolCnt) ? '领取奖励' : '集齐奖励';
            this.btnExtra.gray = getCnt < poolCnt;
        }

        private showCardsCache(): void {
            let data: number[] = this.cardInfo;
            for (let i: number = 1; i < 10; i++) {
                let card: ui.timeAmbulatory.render.IdetifyCardRenderUI = this['card_' + i];
                let id: number = data[i - 1];
                this.showCard(card, id);
                this._open.get(i) ? card.ani1.gotoAndStop(20) : card.ani1.gotoAndStop(0);
            }
            this._isStart = true;
        }

        private onSelectCards(value: number): void {
            for (let i: number = 1; i < 10; i++) {
                let card: ui.timeAmbulatory.render.IdetifyCardRenderUI = this['card_' + i];
                card.imgSelect.visible = value == i;
            }
        }

        private showCard(card: ui.timeAmbulatory.render.IdetifyCardRenderUI, id: number): void {
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
                card.ico.skin = `timeAmbulatory/${['x2', 'x3', 'x5'][index]}.png`;
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
                let card: ui.timeAmbulatory.render.IdetifyCardRenderUI = this['card_' + i];
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
            if (this._curPool == 1) {
                clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '点击天国嫁衣活动说明按钮');
            } else {
                clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '点击雪岁新莓活动说明按钮');
            }
            alert.showRuleByID(this.tips_Id);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._suitId);
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
            if (this._curPool == 1) {
                clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '点击天国嫁衣概率公示按钮');
            } else {
                clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '点击雪岁新莓概率公示按钮');
            }
            let id = this._curPool == 1 ? 11 : 13;
            clientCore.ModuleManager.open('probability.ProbabilityModule', id);
        }

        private async onCollect() {
            let get: boolean = clientCore.ItemsInfo.getItemNum(this.giftId) > 0;
            if (get) return;
            if (this._curPool == 1) {
                clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '点击天国嫁衣集齐奖励按钮');
            } else {
                clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '点击雪岁新莓集齐奖励按钮');
            }
            if (this.btnExtra.gray) {
                let rwd = clientCore.LocalInfo.sex == 1 ? this._cls.awardFemale : this._cls.awardMale;
                clientCore.ModuleManager.open('panelCommon.RewardShowModule', { reward: clientCore.GoodsInfo.createArray(rwd) });
            } else {
                this._control.reqBg(this._curPool, new Laya.Handler(this, this.updateGift));
                // await util.RedPoint.reqRedPointRefresh(21304);
                // await util.RedPoint.reqRedPointRefresh(21307);
                // EventManager.event("TIME_REFRESH_TAB");
                this.updateGift();
            }
        }

        /** 打开卡片*/
        private onCard(pos: number): void {
            if (!this._isStart || this._open.get(pos) || this._isCard) return
            if (!clientCore.MoneyManager.checkLeaf(parseInt(this.txCost.text))) return;
            let card: ui.timeAmbulatory.render.IdetifyCardRenderUI = this['card_' + pos];
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
        private tryBgShow() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this._bgShowId], condition: '', limit: '' });
        }

        /**预览舞台 */
        private tryStage() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this._stageId], condition: '', limit: '' });
        }

        private preReward() {
            if (this._curPool == 1) {
                clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '点击天国嫁衣奖励总览按钮');
            } else {
                clientCore.Logger.sendLog('2021年2月8日活动', '【付费】光阴的回廊', '点击雪岁新莓奖励总览按钮');
            }
            let id = this._curPool == 1 ? 3 : 9;
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", id);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onTip);
            BC.addEvent(this, this.btnTrySuit, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnTryStage, Laya.Event.CLICK, this, this.tryStage);
            BC.addEvent(this, this.btnTryBgshow, Laya.Event.CLICK, this, this.tryBgShow);
            BC.addEvent(this, this.btnReset, Laya.Event.CLICK, this, this.onReset);
            BC.addEvent(this, this.btnGailv, Laya.Event.CLICK, this, this.openPreview);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.boxCollect, Laya.Event.CLICK, this, this.onCollect);
            for (let i: number = 1; i < 10; i++) {
                BC.addEvent(this, this['card_' + i], Laya.Event.CLICK, this, this.onCard, [i]);
            }
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._destryed = true;
            this.imgMask.graphics.clear(true);
            this.removeEventListeners();
            this._open.clear();
            this.cardInfo = this.openedCardInfo = this._open = null;
            super.destroy();
        }
    }
}