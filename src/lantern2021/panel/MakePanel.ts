namespace lantern2021{
    /**
     * 制作元宵
     */
    export class MakePanel extends ui.lantern2021.panel.MakePanelUI implements IPanel{
        private _model: Lantern2021Model;
        private _control: Lantern2021Control;
        constructor(){ 
            super(); 
            this.list.itemRender = MakeItem;
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this.list.mouseHandler = new Laya.Handler(this,this.listMouse,null,false);
        }
        show(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as Lantern2021Model;
            this._control = clientCore.CManager.getControl(sign) as Lantern2021Control;
            this.list.array = this._model.tasks;
            this.updateDaily();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._model = this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnGet,Laya.Event.CLICK,this,this.onReward);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private listRender(item: MakeItem,index: number): void{
            item.setInfo(xls.get(xls.eventTask).get(this.list.array[index]));
        }
        private listMouse(e: Laya.Event,index: number): void{
            if(e.type == Laya.Event.CLICK && e.target instanceof component.HuaButton){
                let cfg: xls.eventTask = xls.get(xls.eventTask).get(this.list.array[index]);
                if(!clientCore.ItemsInfo.checkItemsEnough(_.map(cfg.expend,(element:xls.pair)=>{ return {itemID: element.v1,itemNum: element.v2}}))){
                    alert.showFWords('制作材料不足~');
                    return;
                }
                this._control.makeLantern(cfg.taskId,cfg.type,new Laya.Handler(this,(msg: pb.sc_common_cost_materials_exchange)=>{ 
                    msg.item.length > 0 && alert.showReward(msg.item);
                    //这里是过期了
                    if(msg.outTimeFlag){
                        alert.showFWords('任务过期了，已经重新刷新，再试试吧~');
                        this._model.tasks = msg.newExchangeIdList;
                        this._model.dailyFlag = false;
                        this.updateDaily();
                    }
                    this.list.array = this._model.tasks;
                }));
            }
        }
        private onReward(): void{
            this._control?.dailyReward(new Laya.Handler(this,()=>{
                this._model.dailyFlag = true;
                this.updateDaily();
                this.list.refresh();
            }));
        }
        private updateDaily(): void{
            this.btnGet.disabled = this._model.dailyFlag;
        }
    }
}