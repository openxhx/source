namespace hiddenElf{
    /**
     * 换购处
     */
    export class ExchangePanel extends ui.hiddenElf.panel.ExchangePanelUI{
        private _model: HiddenElfModel;
        private _control: HiddenElfControl;
        constructor(){ 
            super();
            this.list.renderHandler = new Laya.Handler(this,this.itemRender,null,false);
            this.list.mouseHandler = new Laya.Handler(this,this.itemMouse,null,false);
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
        }
        show(sign: number): void{
            this._control = clientCore.CManager.getControl(sign) as HiddenElfControl;
            this._model = clientCore.CManager.getModel(sign) as HiddenElfModel;
            this.list.array = _.filter(xls.get(xls.commonAward).getValues(),(element:xls.commonAward)=>{ return element.type == 109; });
            clientCore.UIManager.setMoneyIds([9900121]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnTry,Laya.Event.CLICK,this,this.onTry);
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            this._model = this._control = null;
            super.destroy();
        }
        private itemRender(item: ui.hiddenElf.item.ExchangeItemUI,index: number): void{
            let data:xls.commonAward = this.list.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            let has: boolean = util.getBit(this._model.exchangeIdx,index + 1) == 1;
            let btn: component.HuaButton = item.getChildByName('exchange') as component.HuaButton;
            btn.disabled = has || data.num.v2 > clientCore.ItemsInfo.getItemNum(9900121);
            item.imgHas.visible = has;
            item.txtCost.changeText(`x${data.num.v2}`);
            clientCore.GlobalConfig.setRewardUI(item.mcReward,{id: reward.v1,cnt: reward.v2,showName: false});
        }
        private async itemMouse(e: Laya.Event,index: number): Promise<void>{
            if(e.type != Laya.Event.CLICK)return;
            let data:xls.commonAward = this.list.array[index];
            if(e.target.name != 'exchange'){
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
                clientCore.ToolTip.showTips(e.target,{id: reward.v1});
                return;
            }
            if(data.num.v2 > clientCore.ItemsInfo.getItemNum(9900121)){
                alert.showFWords('森林之息数量不满足哦~');
                return;
            }
            this._model.exchangeIdx =  await this._control.exchange(index+1,data.id);
            if(this._closed)return;
            this.list.changeItem(index,data);
        }
        private onTry(): void{
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110255);
        }
    }
}