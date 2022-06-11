namespace alert{
    export class SmallAlert extends ui.alert.SmallAlertUI{
        constructor(){ super(); }
        onEnable(): void{
            BC.addEvent(this,EventManager,globalEvent.STAGE_RESIZE,this,this.onResize);
        }
        onDisable(): void{
            BC.removeEvent(this);
        }
        onResize(): void{
            if(clientCore.LayerManager.moshi == clientCore.MODE.HENG){
                this.pos(Laya.stage.width/2,Laya.stage.height/2);
            }else{
                this.pos(Laya.stage.height/2,Laya.stage.width/2);
            }
        }
    }
}