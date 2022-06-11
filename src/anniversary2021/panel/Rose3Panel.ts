namespace anniversary2021 {
    /**
     * 眠花祈福 蝴蝶兰
     */
    export class Rose3Panel extends ui.anniversary2021.panel.Rose3PanelUI implements IPanel {
        /** 抽奖ID*/
        readonly DRAW_ID: number = 6;
        /** 抽奖使用的道具ID*/
        readonly DRAW_ITEM_ID: number = 9900149;
        /** 套装ID*/
        readonly ROSE_SUIT_ID: number = 2110327;
        /** 坐骑ID*/
        readonly ROSE_RIDER_ID: number = 1200015;
        /** 头像框ID*/
        readonly FRAME_ID: number = 2500039;

        private _control: Anniversary2021Control;
        private _model: Anniversary2021Model;
        private _select: number = -1;
        private _disposed: boolean;
        private _array: xls.rouletteDraw[];
        private _buy: BuyPanel;
        ruleId: number = 1139;
        init(sign: number): void {
            this._disposed = false;
            this.pos(-20, 14);
            this._model = clientCore.CManager.getModel(sign) as Anniversary2021Model;
            this._control = clientCore.CManager.getControl(sign) as Anniversary2021Control;
            this.addEvents();
        }
        async show(parent: Laya.Sprite) {
            await this._control.getDiscount(this._model, this.DRAW_ID);
            this.initView();
            EventManager.event("ANNIVERSARY2021_SHOW_TIME", "活动时间：4月2日~4月15日");
            clientCore.UIManager.setMoneyIds([this.DRAW_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            parent.addChild(this);
            clientCore.Logger.sendLog('2021年4月2日活动', '【付费】小花仙周年庆典第三期', '打开蝴蝶兰面板');
        }
        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }
        dispose(): void {
            this._disposed = true;
            Laya.Tween.clearAll(this);
            this.removeEvents();
            this._array.length = 0;
            this._buy = this._array = this._model = this._control = null;
        }
        private addEvents(): void {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry);
            // BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnLook, Laya.Event.CLICK, this, this.onDraw);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openBuy);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onFrame);
        }
        private removeEvents(): void {
            BC.removeEvent(this);
        }
        private onTry(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnTry:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.ROSE_SUIT_ID);
                    break;
                case this.btnTry1:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.ROSE_RIDER_ID, condition: '祈愿可获得' });
                    break;
            }
        }
        /**
         * 初始化界面
         */
        private initView(): void {
            let isMale: boolean = clientCore.LocalInfo.sex == 2;
            this.imgFemale.visible = this.imgNv.visible = !isMale;
            this.imgMale.visible = this.imgNan.visible = isMale;
            this.boxDiscount.visible = false;
            //格子初始化
            this._array = _.filter(xls.get(xls.rouletteDraw).getValues(), (element: xls.rouletteDraw) => { return element.type == this._model.ACTIVITY_ID && element.period == 3; });
            _.forEach(this._array, (element: xls.rouletteDraw, index: number) => {
                this.updateGrid(element, index);
                let item: Laya.Sprite = this.boxGrid.getChildAt(index) as Laya.Sprite;
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleAward[0] : element.maleAward[0];
                BC.addEvent(this, item, Laya.Event.CLICK, this, () => { clientCore.ToolTip.showTips(item, { id: reward.v1 }) });
            });
            //面板初始化
            this.updateView();
        }
        private updateCurrent(): void {
            this.boxCurrent.visible = this._model.checkDiscount();
            if (this.boxCurrent.visible)
                this.imgCurrent.skin = `anniversary2021/${this._model.discount / 10}.png`;
        }
        private updatePrice(): void {
            let cfg: xls.rouletteDrawCost = this._model.getCfg(3);
            let price: number = cfg.cost.v2;
            this.priceTxt.changeText(price + '');
            this.currentTxt.changeText(this._model.checkDiscount() ? Math.floor(price * this._model.discount / 100) + '' : price + '');
        }
        private updateGrid(cfg: xls.rouletteDraw, index: number): void {
            let item: ui.anniversary2021.item.DrawItemUI = this.boxGrid.getChildAt(index) as ui.anniversary2021.item.DrawItemUI;
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward[0] : cfg.maleAward[0];
            item.imgSel.visible = false;
            item.imgHas.visible = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
        }

        private updateRewrd(): void {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this.ROSE_SUIT_ID);
            this.boxReward.visible = !suitInfo.allGet;
            if (!suitInfo.allGet) {
                this.numTxt.changeText(`${suitInfo.hasCnt}/13`);
                this.btnReward.disabled = suitInfo.hasCnt != 13;
            }
        }
        private updateView(): void {
            this.btnLook.disabled = this._model.times == this._array.length;
            this.updateCurrent();
            this.updatePrice();
            this.updateRewrd();
            this.updateFrame();
        }
        private set select(value: number) {
            let len: number = this.boxGrid.numChildren;
            let select: number = Math.round(value);
            if (select == this._select) return;
            let item: ui.anniversary2021.item.DrawItemUI;
            if (this._select != -1) {
                item = this.boxGrid.getChildAt(this._select % len) as ui.anniversary2021.item.DrawItemUI;
                item.imgSel.visible = false;
            }
            this._select = select;
            item = this.boxGrid.getChildAt(this._select % len) as ui.anniversary2021.item.DrawItemUI;
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
        private playDiscountAni(discount: number): Promise<void> {
            this.imgDiscount.skin = `anniversary2021/xiahui${discount / 10}zhe.png`;
            return new Promise((suc: Function) => {
                this.ani1.play(0, false);
                this.ani1.once(Laya.Event.COMPLETE, this, suc);
            })
        }
        private async onDraw(): Promise<void> {
            let cost: xls.pair = this._model.getCfg(3).cost;
            if (!clientCore.ItemsInfo.checkItemsEnough([{ itemID: cost.v1, itemNum: parseInt(this.currentTxt.text) }])) {
                this.openBuy();
                return;
            }
            this.btnLook.disabled = true;
            let msg: pb.sc_common_turntable_draw = await this._control.draw(this.DRAW_ID);
            let cfg: xls.rouletteDraw = _.find(this._array, (element: xls.rouletteDraw) => {
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleAward[0] : element.maleAward[0];
                return reward.v1 == msg.items[0].id;
            });
            let index: number = cfg.id - this._array[0].id;
            this._model.discount = msg.discount;
            if (++this._model.times < this._array.length) {
                await this.playRotateAni(this.boxGrid.numChildren * 5 + index);
                if (this._model.checkDiscount()) {
                    await this.playDiscountAni(msg.discount);
                }
            }
            if (this._disposed) return;
            this.updateView();
            this.updateGrid(cfg, index);
            alert.showReward(msg.items);
        }
        private onReward(): void {
            this._control.getReward(this.DRAW_ID, new Laya.Handler(this, this.updateRewrd));
        }
        private openBuy(): void {
            this._buy = this._buy || new BuyPanel();
            this._buy.show(1);
        }
        /** 更新头像框状态*/
        private updateFrame(): void {
            let hasRider: boolean = clientCore.UserHeadManager.instance.getOneInfoById(this.FRAME_ID)?.have;
            this.btnGet.visible = !hasRider && this._model.times >= this._array.length;
            this.imgHas.visible = hasRider;
        }
        /** 点击领取头像框*/
        private onFrame(): void {
            this._control?.getRider(3, new Laya.Handler(this, this.updateFrame));
        }
    }
}