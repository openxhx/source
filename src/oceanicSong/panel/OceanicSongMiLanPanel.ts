namespace oceanicSong {
    /**
     * 弥蓝之情
     */
    export class OceanicSongMiLanPanel extends ui.oceanicSong.panel.OceanicSongMiLanPanelUI implements IPanel {
        /** 抽奖ID*/
        readonly DRAW_ID: number = 12;
        /** 抽奖使用的道具ID*/
        readonly DRAW_ITEM_ID: number = 9900192;
        readonly SUIT_ID: number = 2110409;
        readonly STAGE_BG_ID: number[] = [1000121];
        readonly RIDER_ID: number = 1000121;//1200016
        private _control: OceanicSongControl;
        private _model: OceanicSongModel;
        private _select: number = -1;
        private _disposed: boolean;
        private _array: xls.rouletteDraw[];
        private _buy: BuyPanel;
        private readonly photoArrs: Array<string> = ["ml_female_model", "ml_male_model"];
        private readonly photoRewardArrs: Array<string> = ["ml_female_false", "ml_male_face"];
        ruleId: number = 1189;
        constructor() {
            super();
            this._disposed = false;
            this.pos(45, 89);
        }
        public init(sign: number): void {
            this._model = clientCore.CManager.getModel(sign) as OceanicSongModel;
            this._control = clientCore.CManager.getControl(sign) as OceanicSongControl;
            this.addEvents();
            this._control.getDiscount(this.DRAW_ID).then((msg) => {
                this._model.discount = msg.discount;
                this._model.times = msg.cnt;
                this.initView();
            });
        }

        public show(parent: Laya.Sprite): void {
            EventManager.event(EventType.UPDATE_TIME, '活动时间:6月25日~7月8日');
            if (!this.parent)
                parent.addChild(this);
            clientCore.UIManager.setMoneyIds([this.DRAW_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年6月25日活动', '【付费】海洋之歌', '打开弥蓝之情面板');
        }
        hide(): void {
            this.clear();
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }
        dispose(): void {
            this.clear();
            if (this._array) this._array.length = 0;
            this._array = this._model = this._control = this._buy = null;
            this._disposed = true;
        }
        private clear(): void {
            Laya.Tween.clearAll(this);
        }
        private addEvents(): void {
            for (let i: number = 1; i <= 2; i++) {
                BC.addEvent(this, this[`btnTry${i}`], Laya.Event.CLICK, this, this.onTry, [i]);
            }
            BC.addEvent(this, this.btnLook, Laya.Event.CLICK, this, this.onDraw);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openBuy);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onRider);
        }
        private removeEvents(): void {
            BC.removeEvent(this);
        }
        private onTry(index: number): void {
            switch (index) {
                case 1:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.SUIT_ID);
                    break;
                case 2:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.STAGE_BG_ID, condition: '奖池集齐可获得' });
                    break;
                    break;
            }
        }
        /**
         * 初始化界面
         */
        private initView(): void {
            const indexSex: number = clientCore.LocalInfo.sex - 1;
            this.imgPho.skin = `unpack/oceanicSong/${this.photoArrs[indexSex]}.png`;
            this.imgPhoReward.skin = `oceanicSong/${this.photoRewardArrs[indexSex]}.png`;
            this.imgDiscount.visible = false;
            //格子初始化
            this._array = _.filter(xls.get(xls.rouletteDraw).getValues(), (element: xls.rouletteDraw) => { return element.type == this._model.ACTIVITY_ID; });
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
                this.imgCurrent.skin = `oceanicSong/${this._model.discount / 10}_z.png`;
        }
        private updatePrice(): void {
            let cfg: xls.rouletteDrawCost = this._model.getCfg();
            let price: number = cfg.cost.v2;
            this.priceTxt.changeText(price + '');
            this.currentTxt.changeText(this._model.checkDiscount() ? Math.floor(price * this._model.discount / 100) + '' : price + '');
        }
        private updateGrid(cfg: xls.rouletteDraw, index: number): void {
            let item: ui.oceanicSong.item.DrawItemUI = this.boxGrid.getChildAt(index) as ui.oceanicSong.item.DrawItemUI;
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward[0] : cfg.maleAward[0];
            item.imgSel.visible = false;
            item.imgHas.visible = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
        }

        private updateRewrd(): void {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this.SUIT_ID);
            this.boxReward.visible = !suitInfo.allGet;
            if (!suitInfo.allGet) {
                this.numTxt.changeText(`${suitInfo.hasCnt}/${suitInfo.clothes.length - 3}`);
                this.btnReward.disabled = suitInfo.hasCnt < suitInfo.clothes.length - 3;
            }
        }
        private updateView(): void {
            this.btnLook.disabled = this._model.times == this._array.length;
            this.updateCurrent();
            this.updatePrice();
            this.updateRewrd();
            this.updateRider();
        }
        private set select(value: number) {
            let len: number = this.boxGrid.numChildren;
            let select: number = Math.round(value);
            if (select == this._select) return;
            let item: ui.anniversary2021.item.DrawItem1UI;
            if (this._select != -1) {
                item = this.boxGrid.getChildAt(this._select % len) as ui.anniversary2021.item.DrawItem1UI;
                item.imgSel.visible = false;
            }
            this._select = select;
            item = this.boxGrid.getChildAt(this._select % len) as ui.anniversary2021.item.DrawItem1UI;
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
            this.imgDiscount.skin = `oceanicSong/next_${discount / 10}_zhekou.png`;
            return new Promise((suc: Function) => {
                this.ani1.play(0, false);
                this.ani1.once(Laya.Event.COMPLETE, this, suc);
            })
        }
        private async onDraw(): Promise<void> {
            let cost: xls.pair = this._model.getCfg().cost;
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
            EventManager.event(EventType.RESET_MAIN_TAB_ABLE, false);
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
            EventManager.event(EventType.RESET_MAIN_TAB_ABLE, true);
        }
        private onReward(): void {
            this._control.getReward(this.DRAW_ID, new Laya.Handler(this, this.updateRewrd));
        }
        private openBuy(): void {
            this._buy = this._buy || new BuyPanel();
            this._buy.show(2);
        }
        /** 更新坐骑状态*/
        private updateRider(): void {
            let hasRider: boolean = clientCore.ItemsInfo.checkHaveItem(this.RIDER_ID);
            this.btnGet.visible = !hasRider && this._model.times >= this._array.length;
            this.imgHas.visible = hasRider;
        }
        /** 点击领取坐骑*/
        private onRider(): void {
            net.sendAndWait(new pb.cs_ocean_song_get_draw_reward({ period: 3 })).then((msg: pb.sc_season_appoint_panel_get_cloth) => {
                alert.showReward(msg.items);
                this.updateRider();
            });
        }
    }
}
