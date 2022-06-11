namespace earthPercious{
    
    export class PlotPanel extends ui.earthPercious.PlotPanelUI{
        constructor(){ super(); }
        show(): void{
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
    }
}