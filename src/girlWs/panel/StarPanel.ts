namespace girlWs{
    /**
     * 缤纷星辰
     */
    export class StarPanel implements IPanel{
        private _control: GirlWsControl;
        private _model: GirlWsModel;
        private _ui: ui.girlWs.panel.StarPanelUI;
        private _select: number = -1;
        private _disposed: boolean;
        private _array: xls.rouletteDraw[];
        private _buy: BuyPanel;
        init(sign: number,ui: ui.girlWs.panel.StarPanelUI): void{
            this._disposed = false;
            this._model = clientCore.CManager.getModel(sign) as GirlWsModel;
            this._control = clientCore.CManager.getControl(sign) as GirlWsControl;
            this._ui = ui;
            this.addEvents();
            this.initView();
        }
        show(): void{
        }
        dispose(): void{
            this._disposed = true;    
            Laya.Tween.clearAll(this);
            this.removeEvents();
            this._array.length = 0;
            this._buy = this._array = this._model = this._control = this._ui = null;
        }
        private addEvents(): void{
            BC.addEvent(this,this._ui.btnTry,Laya.Event.CLICK,this,this.onTry);
            BC.addEvent(this,this._ui.btnTry1,Laya.Event.CLICK,this,this.onTry);
            BC.addEvent(this,this._ui.btnTry2,Laya.Event.CLICK,this,this.onTry);
            BC.addEvent(this,this._ui.btnLook,Laya.Event.CLICK,this,this.onDraw);
            BC.addEvent(this,this._ui.btnReward,Laya.Event.CLICK,this,this.onReward);
            BC.addEvent(this,this._ui.btnBuy,Laya.Event.CLICK,this,this.openBuy);
            BC.addEvent(this,this._ui.btnGet,Laya.Event.CLICK,this,this.onRider);
        }
        private removeEvents(): void{
            BC.removeEvent(this);
        }
        private onTry(e: Laya.Event): void{
            switch(e.currentTarget){
                case this._ui.btnTry:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.STAR_SUIT_ID);
                    break;
                case this._ui.btnTry1:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this._model.STAR_BGSHOW_ID,this._model.STAR_STAGE_ID], condition: '观星辰可获得' });
                    break;
                case this._ui.btnTry2:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this._model.STAR_RIDER_ID, condition: '银月坐骑' });
                    break;
            }
           
        }
        private initView(): void{
            let isMale: boolean = clientCore.LocalInfo.sex == 2;
            this._ui.imgFemale.visible = this._ui.imgNv.visible = !isMale;
            this._ui.imgMale.visible = this._ui.imgNan.visible = isMale;
            this._ui.boxDiscount.visible = false;
            //格子初始化
            this._array = _.filter(xls.get(xls.rouletteDraw).getValues(),(element: xls.rouletteDraw)=>{ return element.type == this._model.ACTIVITY_ID; });
            _.forEach(this._array,(element: xls.rouletteDraw,index: number)=>{ 
                this.updateGrid(element,index);
                let item: Laya.Sprite = this._ui.boxGrid.getChildAt(index) as Laya.Sprite;
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleAward[0] : element.maleAward[0];
                BC.addEvent(this,item,Laya.Event.CLICK,this,()=>{ clientCore.ToolTip.showTips(item,{id: reward.v1})});
            });
            //面板初始化
            this.updateView();
        }
        private updateCurrent(): void{
            this._ui.boxCurrent.visible = this._model.checkDiscount();
            if(this._ui.boxCurrent.visible)
                this._ui.imgCurrent.skin = `girlWs/d${this._model.discount / 10}.png`;
        }
        private updatePrice(): void{
            let cfg: xls.rouletteDrawCost = this._model.getCfg();
            let price: number = cfg.cost.v2;
            this._ui.imgCost.skin = this._ui.imgCurrentCost.skin = clientCore.ItemsInfo.getItemIconUrl(cfg.cost.v1);
            this._ui.priceTxt.changeText(price+'');
            this._ui.currentTxt.changeText(this._model.checkDiscount() ? Math.floor(price * this._model.discount / 100) + '' : price + '');
        }
        private updateGrid(cfg: xls.rouletteDraw,index: number): void{
            let item: ui.girlWs.item.DrawItemUI = this._ui.boxGrid.getChildAt(index) as ui.girlWs.item.DrawItemUI;
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward[0] : cfg.maleAward[0];
            item.imgSel.visible = false;
            item.imgHas.visible = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
        }

        private updateRewrd(): void{
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this._model.STAR_SUIT_ID);
            this._ui.boxReward.visible = !suitInfo.allGet;
            if(!suitInfo.allGet){
                this._ui.numTxt.changeText(`${suitInfo.hasCnt}/11`);
                this._ui.btnReward.disabled = suitInfo.hasCnt != 11;
            }
        }
        private updateView(): void{
            this._ui.btnLook.disabled = this._model.times == this._array.length;
            this.updateCurrent();
            this.updatePrice();
            this.updateRewrd();
            this.updateRider();
        }
        private set select(value: number){
            let select: number = Math.round(value);
            if(select == this._select)return;
            let item: ui.girlWs.item.DrawItemUI;
            if(this._select != -1){
                item = this._ui.boxGrid.getChildAt(this._select % 12) as ui.girlWs.item.DrawItemUI;
                item.imgSel.visible = false;
            }
            this._select = select;
            item = this._ui.boxGrid.getChildAt(this._select % 12) as ui.girlWs.item.DrawItemUI;
            item.imgSel.visible = true;
        }
        private get select(): number{
            return this._select;
        }
        private playRotateAni(target: number): Promise<void>{
            this.select = 0;
            return new Promise((suc: Function)=>{
                Laya.Tween.to(this,{select: target},3500,Laya.Ease.cubicInOut,new Laya.Handler(this,()=>{ suc(); }));
            })
        }
        private playDiscountAni(discount: number): Promise<void>{
            this._ui.imgDiscount.skin = `girlWs/xiahui${discount / 10}zhe.png`;
            return new Promise((suc: Function)=>{
                this._ui.ani1.play(0,false);
                this._ui.ani1.once(Laya.Event.COMPLETE,this,suc);
            })
        }
        private async onDraw(): Promise<void>{
            let cost: xls.pair = this._model.getCfg().cost;
            if(!clientCore.ItemsInfo.checkItemsEnough([{itemID: cost.v1,itemNum: parseInt(this._ui.currentTxt.text)}])){
                this.openBuy();
                return;
            }
            this._ui.btnLook.disabled = true;
            let msg: pb.sc_common_turntable_draw = await this._control.draw(this._model.DRAW_ID);
            let cfg: xls.rouletteDraw = _.find(this._array,(element: xls.rouletteDraw)=>{
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleAward[0] : element.maleAward[0];
                return reward.v1 == msg.items[0].id;
            });
            let index: number = cfg.id - this._array[0].id;
            this._model.discount = msg.discount;
            if(++this._model.times < this._array.length){
                await this.playRotateAni(60 + index);
                if(this._model.checkDiscount()){
                   await this.playDiscountAni(msg.discount);
                }
            }
            if(this._disposed)return;
            this.updateView();
            this.updateGrid(cfg,index);
            alert.showReward(msg.items);
        }
        private onReward(): void{
            this._control.getReward(this._model.DRAW_ID,new Laya.Handler(this,this.updateRewrd));
        }
        private openBuy(): void{
            clientCore.Logger.sendLog('2021年3月5日活动', '【付费】少女万岁', '点击星尘礼包的立即购买按钮');
            this._buy = this._buy || new BuyPanel();
            this._buy.show();
        }
        /** 更新坐骑状态*/
        private updateRider(): void{
            let hasRider: boolean = clientCore.ItemsInfo.checkHaveItem(this._model.STAR_RIDER_ID);
            this._ui.btnGet.visible = !hasRider && this._model.times >= this._array.length;
            this._ui.imgHas.visible = hasRider;
        }
        /** 点击领取坐骑*/
        private onRider(): void{
            this._control?.getRider(new Laya.Handler(this,this.updateRider));
        }
    }
}