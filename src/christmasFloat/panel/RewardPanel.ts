namespace christmasFloat{
    export class RewardPanel extends ui.christmasFloat.panel.RewardPanelUI{
        constructor(){ 
            super(); 
            this.sideClose = true;
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
        }
        show(): void{
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this,Laya.Event.CLICK,this,this.hide);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
    }
}