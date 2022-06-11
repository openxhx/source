namespace springSummberAppoint{
    /**
     * 回到未来
     */
    export class LimitPanel extends ui.springSummberAppoint.panel.LimitPanelUI implements IPanel{

        private readonly SUIT_ID: number = 2110337;
        /** 开始购买时间*/
        private buyTime: number = util.TimeUtil.formatTimeStrToSec('2021/4/16 18:00:00');

        private _t: time.GTime;
        private _model: SpringSummberAppointModel;
        private _control: SpringSummberAppointControl;
        private _discount: number;
        private _price: number;

        ruleId: number;

        constructor(){ 
            super();
            this.pos(86,134);
            this.limitList.renderHandler = new Laya.Handler(this,this.limitRender,null,false);
            this.nameList.vScrollBarSkin = '';
            this.nameList.renderHandler = new Laya.Handler(this,this.nameRender,null,false);
            this.nameList.scrollBar.elasticBackTime = 200;
            this.nameList.scrollBar.elasticDistance = 100;
        }

        async show(sign:number,parent: Laya.Sprite): Promise<void>{
            this._discount = -1;
            this._model = clientCore.CManager.getModel(sign) as SpringSummberAppointModel;
            this._control = clientCore.CManager.getControl(sign) as SpringSummberAppointControl;
            this.addEvents();
            await this.query();
            this.updateView();
            this.getBuyList();
            this.timeTxt.visible = false;
            if(this.btnBuy.visible && clientCore.ServerManager.curServerTime < this.buyTime){
                this.timeTxt.visible = true;
                this.btnBuy.disabled = true;
                this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON,1000,this,this.onTime);
                this._t.start();
            }
            parent.addChild(this);
        }
        hide(): void{
            this.clear();
            this.removeSelf();
        }
        dispose(): void{
            this.clear();
        }

        private clear(): void{
            this._t?.dispose();
            this._t = null;
            this._model = this._control = null;
            this.removeEvents();
        }
        private addEvents(): void{
            BC.addEvent(this,this.btnBuy,Laya.Event.CLICK,this,this.onBuy);
            BC.addEvent(this,this.btnTry,Laya.Event.CLICK,this,this.onTry);
        }
        private removeEvents(): void{
            BC.removeEvent(this);
        }
        private updateView(): void{
            let hasCloth: boolean = clientCore.SuitsInfo.checkHaveSuits(this.SUIT_ID);
            this.imgHas.visible = hasCloth;
            this.btnBuy.visible = !hasCloth;
        }
        private onTime(): void{
            let dt: number = this.buyTime - clientCore.ServerManager.curServerTime;
            if(dt <= 0){
                this.timeTxt.visible = false;
                this.btnBuy.disabled = false;
                this._t?.dispose();
                this._t = null;
                return;
            }
            this.timeTxt.changeText(util.StringUtils.getDateStr2(dt,'{hour}:{min}:{sec}'));
        }

        private getBuyList(): void{
            this._control?.getBuyList(new Laya.Handler(this,(array: pb.YFLSTopCloudBuyHistory[])=>{
                this.nameList.array = array;
            }))
        }

        private limitRender(item: ui.springSummberAppoint.item.BuyItemUI,index: number): void{
            let data: number = this.limitList.array[index];
            item.discountTxt.changeText(`${['一','三','五','七','九'][index]}折`);
            item.limitTxt.changeText(`限量：${[25,80,200,400,600][index] * (channel.ChannelControl.ins.isOfficial ? 1 : 2)}`);
            item.imgHot.visible = [1,3,5,7,9][index] == this._discount;
            item.allTxt.visible = data <= 0;
        }

        private nameRender(item: Laya.Text,index: number): void{
            let data: pb.YFLSTopCloudBuyHistory = this.nameList.array[index];
            item.text = `玩家${data.nick}以${data.discount == 0 ? '原' : data.discount + '折'}价购得幻境穿梭者套装！`;
        }

        private async query(): Promise<void>{
            let msg: pb.sc_season_appoint_panel = await this._control.query();
            let data: {discount: number,price: number,count: number} = this.getInfo(msg);
            this.updatePrice(data);
            this.limitList.array = [msg.oneDiscount,msg.threeDiscount,msg.fiveDiscount,msg.sevenDiscount,msg.nineDiscount];
        }

        private getInfo(msg: pb.sc_season_appoint_panel): {discount: number,price: number,count: number}{
            if(msg.oneDiscount > 0)return {discount: 1,price: 52,count: msg.oneDiscount};
            if(msg.threeDiscount > 0)return {discount: 3,price: 156,count: msg.threeDiscount};
            if(msg.fiveDiscount > 0)return {discount: 5,price: 260,count: msg.fiveDiscount};
            if(msg.sevenDiscount > 0)return {discount: 7,price: 364,count: msg.sevenDiscount};
            if(msg.nineDiscount > 0)return {discount: 9,price: 468,count: msg.nineDiscount};
            return {discount: 0,price: 520,count: 0};
        }

        private updatePrice(data: {discount: number,price: number,count: number}): void{
            this.imgDiscount.visible = data.discount != 0;
            this.imgDiscount.visible && (this.imgDiscount.skin = `springSummberAppoint/${data.discount}zhe.png`);
            this.txt_1.changeText('520');
            this.txt_2.changeText(data.price + '');
            this.txt_3.changeText(data.count == 0 ? '∞' : `${data.count}`);
            this._discount = data.discount;
            this._price = data.price;
        }

        private onBuy(): void{
            let discount: number = this._discount;
            alert.showSmall(`将消耗${this._price}灵豆购买幻境穿梭者套装，是否确定？`,{
                callBack: {
                    caller: this,
                    funArr: [async ()=>{
                        await this.query();
                        if(discount != this._discount){
                            alert.showFWords('当前折扣价商品已经售空了~');
                            return;
                        }
                        this._control.buyCloth(this._discount,new Laya.Handler(this,this.updateView));
                    }]
                }
            });
        }

        private onTry(): void{
            alert.showCloth(this.SUIT_ID);
        }
    }
}