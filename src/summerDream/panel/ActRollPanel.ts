namespace summerDream {
    export class ActRollPanel extends ui.summerDream.panel.SDActRollUI {
        /** 抽奖ID*/
        readonly DRAW_ID: number = 10;
        /** 抽奖使用的道具ID*/
        readonly DRAW_ITEM_ID: number = 9900172;
        readonly SUIT_ID: number = 2100304;
        readonly BG_ID: number = 1000106;
        private _control: SummerDreamControl;
        private _model: SummerDreamModel;
        private _select: number = -1;
        private _disposed: boolean;
        private _array: xls.rouletteDraw[];
        private _buy: BuyPanel;
        ruleId: number = 1150;

        public otherPanel:ActRoll1Panel;
        constructor(sign: number) {
            super();
            this._disposed = false;
            this.imgSuit1.visible = this.imgEye1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = this.imgEye2.visible = clientCore.LocalInfo.sex == 2;
            this._model = clientCore.CManager.getModel(sign) as SummerDreamModel;
            this._control = clientCore.CManager.getControl(sign) as SummerDreamControl;
            this.addEvents();
        }
        async show() {
            await this._control.getDiscount(this._model, this.DRAW_ID);
            clientCore.Logger.sendLog('2021年5月28日活动', '【付费】夏夜如梦', '打开星语心愿面板');
            this.initView();
            clientCore.UIManager.setMoneyIds([this.DRAW_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            this.visible = true;
            clientCore.MedalManager.getMedal([MedalConst.SUMMER_DREAM_OPEN_4]).then((msg: pb.ICommonData[]) => {
                if (msg[0].value == 0 && !clientCore.SuitsInfo.getSuitInfo(2110383).allGet) {
                    clientCore.DialogMgr.ins.open(new ADPanel(), false);
                    clientCore.MedalManager.setMedal([{ id: MedalConst.SUMMER_DREAM_OPEN_4, value: 1 }]);
                }
            })
        }
        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.visible = false;
            this.otherPanel.visible = false;
        }
        private closeClick() {
            EventManager.event("SUMMER_DREAM_CLOSE_ACTIVITY");
            this.hide();
        }
        destroy(): void {
            this.clear();
            this._disposed = true;
            super.destroy();
        }
        private clear(): void {
            this.removeEvents();
            Laya.Tween.clearAll(this);
            if (this._array) this._array.length = 0;
            this._array = this._model = this._control = this._buy = null;
        }
        /**打开面板1 */
        private showPanel() {
            this.visible = false;
            this.otherPanel.show();
        }
        private addEvents(): void {
            BC.addEvent(this, this.btnTrySuit, Laya.Event.CLICK, this, this.onTry, [1]);
            BC.addEvent(this, this.btnTryBg, Laya.Event.CLICK, this, this.onTry, [2]);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.onDraw);
            BC.addEvent(this, this.boxEye, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openBuy);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onBg);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnPanel, Laya.Event.CLICK, this, this.showPanel);
        }
        private removeEvents(): void {
            BC.removeEvent(this);
        }
        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1172);
        }
        private onTry(index: number): void {
            switch (index) {
                case 1:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.SUIT_ID);
                    break;
                case 2:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this.BG_ID, 1100074], condition: '奖池集齐可获得' });
                    break;
            }
        }
        /**
         * 初始化界面
         */
        private initView(): void {
            this.imgNextOff.visible = false;
            //格子初始化
            this._array = _.filter(xls.get(xls.rouletteDraw).getValues(), (element: xls.rouletteDraw) => { return element.type == this._model.ACTIVITY_ID && element.period == 2; });
            _.forEach(this._array, (element: xls.rouletteDraw, index: number) => {
                this.updateGrid(element, index);
                let item: Laya.Sprite = this.boxItem.getChildAt(index) as Laya.Sprite;
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleAward[0] : element.maleAward[0];
                BC.addEvent(this, item, Laya.Event.CLICK, this, () => { clientCore.ToolTip.showTips(item, { id: reward.v1 }) });
            });
            //面板初始化
            this.updateView();
        }
        private updateCurrent(): void {
            this.boxCurrent.visible = this._model.checkDiscount();
            if (this.boxCurrent.visible)
                this.imgCurOff.skin = `summerDream/${this._model.discount / 10}.png`;
        }
        private updatePrice(): void {
            let cfg: xls.rouletteDrawCost = this._model.getCfg(2);
            let price: number = cfg.cost.v2;
            this.labCostOld.changeText(price + '');
            this.labCost.changeText(this._model.checkDiscount() ? Math.floor(price * this._model.discount / 100) + '' : price + '');
        }
        private updateGrid(cfg: xls.rouletteDraw, index: number): void {
            let item: ui.summerDream.item.ActRollItemUI = this.boxItem.getChildAt(index) as ui.summerDream.item.ActRollItemUI;
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward[0] : cfg.maleAward[0];
            item.imgSel.visible = false;
            item.imgHas.visible = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
        }

        private updateRewrd(): void {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this.SUIT_ID);
            this.boxEye.visible = !suitInfo.allGet;
            if (!suitInfo.allGet) {
                this.labProgress.changeText(`${suitInfo.hasCnt}/${suitInfo.clothes.length - 3}`);
                this.boxEye.mouseEnabled = suitInfo.hasCnt >= suitInfo.clothes.length - 3;
            }
        }
        private updateView(): void {
            this.btnStart.disabled = this._model.times == this._array.length;
            this.updateCurrent();
            this.updatePrice();
            this.updateRewrd();
            this.updateBg();
        }
        private set select(value: number) {
            let len: number = this.boxItem.numChildren;
            let select: number = Math.round(value);
            if (select == this._select) return;
            let item: ui.summerDream.item.ActRollItemUI;
            if (this._select != -1) {
                item = this.boxItem.getChildAt(this._select % len) as ui.summerDream.item.ActRollItemUI;
                item.imgSel.visible = false;
            }
            this._select = select;
            item = this.boxItem.getChildAt(this._select % len) as ui.summerDream.item.ActRollItemUI;
            item.imgSel.visible = true;
        }
        private get select(): number {
            return this._select;
        }
        private playRotateAni(target: number): Promise<void> {
            this.select = 0;
            return new Promise((suc: Function) => {
                Laya.Tween.to(this, { select: target }, 3500, Laya.Ease.cubicInOut, new Laya.Handler(this, () => { suc(); }));
            })
        }
        private playDiscountAni(discount: number) {
            this.imgNextOff.skin = `summerDream/xia_hui${discount / 10}_zhe.png`;
            // return new Promise((suc: Function) => {
            //     this.ani1.play(0, false);
            //     this.ani1.once(Laya.Event.COMPLETE, this, suc);
            // })
        }
        private async onDraw(): Promise<void> {
            let cost: number = parseInt(this.labCost.text);
            let have = clientCore.ItemsInfo.getItemNum(this.DRAW_ITEM_ID);
            if (cost > have) {
                this.openBuy();
                return;
            }
            this.btnStart.disabled = true;
            let msg: pb.sc_common_turntable_draw = await this._control.draw(this.DRAW_ID);
            let cfg: xls.rouletteDraw = _.find(this._array, (element: xls.rouletteDraw) => {
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleAward[0] : element.maleAward[0];
                return reward.v1 == msg.items[0].id;
            });
            let index: number = cfg.id - this._array[0].id;
            this._model.discount = msg.discount;
            if (++this._model.times < this._array.length) {
                await this.playRotateAni(this.boxItem.numChildren * 5 + index);
                if (this._model.checkDiscount()) {
                    this.playDiscountAni(msg.discount);
                }
            }
            if (this._disposed) return;
            this.updateView();
            this.updateGrid(cfg, index);
            alert.showReward(msg.items);
        }
        private onReward(): void {
            this._control.getCompleteReward(this.DRAW_ID, new Laya.Handler(this, this.updateRewrd));
        }
        private openBuy(): void {
            this._buy = this._buy || new BuyPanel();
            this._buy.show(3);
        }
        /** 更新坐骑状态*/
        private updateBg(): void {
            let hasBg: boolean = clientCore.ItemsInfo.checkHaveItem(this.BG_ID);
            if (!hasBg && this._model.times >= this._array.length) {
                this.ani1.play(0, true);
            } else if (this.ani1.isPlaying) {
                this.ani1.stop();
                this.btnGet.scale(1, 1);
            }
            this.imgHas.visible = hasBg;
        }

        /** 点击领取背景秀*/
        private onBg(): void {
            this._control?.getComReward(7, new Laya.Handler(this, this.updateBg));
        }
    }
}