namespace springSummberAppoint{
    /**
     * 幽灵诗人
     */
    export class PoetPanel extends ui.springSummberAppoint.panel.PoetPanelUI implements IPanel{
        /** 抽奖ID*/
        readonly DRAW_ID: number = 8;
        /** 抽奖使用的道具ID*/
        readonly DRAW_ITEM_ID: number = 9900153;
        readonly SUIT_ID: number = 2100296;
        readonly STAGE_BG_ID: number[] = [1000101, 1100071];
        readonly RIDER_ID: number = 1200016;
        private _control: SpringSummberAppointControl;
        private _model: SpringSummberAppointModel;
        private _select: number = -1;
        private _disposed: boolean;
        private _array: xls.rouletteDraw[];
        private _buy: BuyPanel;
        ruleId: number = 1150;
        constructor() {
            super();
            this._disposed = false;
            this.pos(45, 89);
        }
        async show(sign: number,parent: Laya.Sprite): Promise<void> {
            this._model = clientCore.CManager.getModel(sign) as SpringSummberAppointModel;
            this._control = clientCore.CManager.getControl(sign) as SpringSummberAppointControl;
            await this._control.getDiscount(this._model, this.DRAW_ID);
            this.initView();
            this.addEvents();
            clientCore.UIManager.setMoneyIds([this.DRAW_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            parent.addChild(this);
        }
        hide(): void {
            this.clear();
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }
        dispose(): void {
            this.clear();
            this._disposed = true;
        }
        private clear(): void{
            this.removeEvents();
            Laya.Tween.clearAll(this);
            if(this._array) this._array.length = 0;
            this._array = this._model = this._control = this._buy = null;
        }
        private addEvents(): void {
            for(let i:number=1;i<=3;i++){
                BC.addEvent(this, this[`btnTry${i}`], Laya.Event.CLICK, this, this.onTry,[i]);
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
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.STAGE_BG_ID, condition: '祈愿可获得' });
                    break;
                case 3:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.RIDER_ID, condition: '奖池集齐可获得' });
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
                this.imgCurrent.skin = `springSummberAppoint/${this._model.discount / 10}.png`;
        }
        private updatePrice(): void {
            let cfg: xls.rouletteDrawCost = this._model.getCfg();
            let price: number = cfg.cost.v2;
            this.priceTxt.changeText(price + '');
            this.currentTxt.changeText(this._model.checkDiscount() ? Math.floor(price * this._model.discount / 100) + '' : price + '');
        }
        private updateGrid(cfg: xls.rouletteDraw, index: number): void {
            let item: ui.anniversary2021.item.DrawItem1UI = this.boxGrid.getChildAt(index) as ui.anniversary2021.item.DrawItem1UI;
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
            this.imgDiscount.skin = `springSummberAppoint/xiahui${discount / 10}zhe.png`;
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
        /** 更新坐骑状态*/
        private updateRider(): void {
            let hasRider: boolean = clientCore.ItemsInfo.checkHaveItem(this.RIDER_ID);
            this.btnGet.visible = !hasRider && this._model.times >= this._array.length;
            this.imgHas.visible = hasRider;
        }
        /** 点击领取坐骑*/
        private onRider(): void {
            this._control?.getComReward(5,new Laya.Handler(this, this.updateRider));
        }
    }
}