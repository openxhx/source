namespace odeToJay{
    /**
     * 奖励兑换
     */
    export class ExchangePanel extends ui.odeToJay.panel.ExchangePanelUI{

        private readonly ACTIVITY_ID: number = 144;

        private _model: OdeToJayModel;
        private _control: OdeToJayControl;

        constructor(){ 
            super(); 
            this.imgNan.visible = this.imgNan_1.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = this.imgNv_1.visible = clientCore.LocalInfo.sex == 1;
            this.eList.renderHandler = new Laya.Handler(this,this.listRender,[1],false);
            this.eList.mouseHandler = new Laya.Handler(this,this.listMouse,[1],false);
            this.rList.renderHandler = new Laya.Handler(this,this.listRender,[2],false);
            this.rList.mouseHandler = new Laya.Handler(this,this.listMouse,[2],false);
        }
        show(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as OdeToJayModel;
            this._control = clientCore.CManager.getControl(sign) as OdeToJayControl;
            let array: xls.commonAward[] = _.filter(xls.get(xls.commonAward).getValues(),(element: xls.commonAward)=>{ return element.type == this.ACTIVITY_ID; });
            this.eList.array = _.slice(array,0,8);
            this.rList.array = _.slice(array,8);
            this.imgLock.visible = !this._model.checkOpen();
            this.onTab(0);
            clientCore.UIManager.setMoneyIds([9900155,9900156]);
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
            BC.addEvent(this,this.btnTry,Laya.Event.CLICK,this,this.onTry,[1]);
            BC.addEvent(this,this.btnTry_1,Laya.Event.CLICK,this,this.onTry,[2]);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private onTab(index: number): void{
            if(index == 1 && !this._model.checkOpen())return;
            this.ani1.index = index;
        }
        private onTry(type: number): void{
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", type == 1 ? 2110345 : 2110347);
        }
        private listRender(type: number,item: ui.odeToJay.item.ExchangeItemUI,index: number): void{
            let list: Laya.List = type == 1 ? this.eList : this.rList;
            let data: xls.commonAward = list.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            let has: boolean = clientCore.LocalInfo.checkHaveCloth(reward.v1);
            clientCore.GlobalConfig.setRewardUI(item.vReward,{id: reward.v1,cnt: reward.v2,showName: false});
            item.numTxt.changeText(`x${data.num.v2}`);
            item.imgHas.visible = has;
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(data.num.v1);
            item.btnExchange.disabled = has || !clientCore.ItemsInfo.checkItemsEnough([{itemID: data.num.v1,itemNum: data.num.v2}]);
        }
        private listMouse(type: number,e:Laya.Event,index: number): void{
            if(e.type == Laya.Event.CLICK){
                let list: Laya.List = type == 1 ? this.eList : this.rList;
                let data: xls.commonAward = list.array[index];
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
                if(e.target instanceof component.HuaButton){
                    this._control?.getCloth(index + 1,data.id,new Laya.Handler(this,()=>{
                        util.RedPoint.reqRedPointRefresh(type == 1 ? 25301 : 25302); 
                        list.changeItem(index,data); 
                    }));
                }else{
                    clientCore.ToolTip.showTips(e.target,{id: reward.v1});
                }
            }
        }
    }
}