namespace newyear2021{
    /**
     * 换年货
     */
    export class ExchangePanel extends ui.newyear2021.panel.ExchangePanelUI implements IPanel{
        private _model: NewYear2021Model;
        private _control: NewYear2021Control;
        constructor(){ 
            super(); 
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.eList.renderHandler = new Laya.Handler(this,this.eListRender,null,false);
            this.eList.mouseHandler = new Laya.Handler(this,this.eListMouse,null,false);
            this.rList.itemRender = RewardItem;
            this.rList.vScrollBarSkin = '';
            this.rList.scrollBar.elasticBackTime = 200;
            this.rList.scrollBar.elasticDistance = 200;
            this.rList.renderHandler = new Laya.Handler(this,this.rListRender,null,false);
            this.rList.mouseHandler = new Laya.Handler(this,this.rListMouse,null,false);
        }
        show(sign: number): void{
            this._control = clientCore.CManager.getControl(sign) as NewYear2021Control;
            this._model = clientCore.CManager.getModel(sign) as NewYear2021Model; 
            this.eList.array = _.filter(xls.get(xls.commonAward).getValues(),(element: xls.commonAward)=>{ return element.type == this._model.EXCHANGE_EVENT_ID; });
            this.rList.array = _.filter(xls.get(xls.eventExchange).getValues(),(element: xls.eventExchange)=>{ return element.type == this._model.ACTIVITY_ID; });
            this.onTab(0);
            clientCore.UIManager.setMoneyIds([this._model.EXCHANGE_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btn_0,Laya.Event.CLICK,this,this.onTab,[0]);
            BC.addEvent(this,this.btn_1,Laya.Event.CLICK,this,this.onTab,[1]);
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnTry,Laya.Event.CLICK,this,this.onTry);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private onTab(index: number): void{
            this.ani1.index = index;
        }
        private onTry(): void{
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110285);
        }
        private eListRender(item: ui.newyear2021.item.ExchangeItemUI,index: number): void{
            let data: xls.commonAward = this.eList.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            let has: boolean = clientCore.LocalInfo.checkHaveCloth(reward.v1);
            clientCore.GlobalConfig.setRewardUI(item.vReward,{id: reward.v1,cnt: reward.v2,showName: false});
            item.numTxt.changeText(`x${data.num.v2}`);
            item.imgHas.visible = has;
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(data.num.v1);
            item.btnExchange.disabled = has || !clientCore.ItemsInfo.checkItemsEnough([{itemID: data.num.v1,itemNum: data.num.v2}]);
        }
        private eListMouse(e:Laya.Event,index: number): void{
            if(e.type == Laya.Event.CLICK){
                let data: xls.commonAward = this.eList.array[index];
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
                if(e.target instanceof component.HuaButton){
                    this._control.exchangeReward(index + 1,data.id,new Laya.Handler(this,()=>{ 
                        this.eList.changeItem(index,data); 
                        util.RedPoint.reqRedPointRefresh(23303);
                    }));
                }else{
                    clientCore.ToolTip.showTips(e.target,{id: reward.v1});
                }
            }
        }
        private rListRender(item: RewardItem,index: number): void{
            item.setInfo(this.rList.array[index]);
        }   
        private rListMouse(e:Laya.Event,index: number): void{
            if(e.type == Laya.Event.CLICK && e.target instanceof component.HuaButton){
                let data: xls.eventExchange = this.rList.array[index];
                if(!clientCore.ItemsInfo.checkItemsEnough(_.map(data.cost,(element:xls.pair)=>{ return {itemID: element.v1,itemNum: element.v2}}))){
                    alert.showFWords('兑换所需材料不足~');
                    return;
                }
                this._control.exchange(data.id,this._model.ACTIVITY_ID,new Laya.Handler(this,()=>{ this.rList.refresh(); }));
            }
        }
    }
}