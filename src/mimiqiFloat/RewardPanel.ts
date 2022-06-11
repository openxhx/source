namespace mimiqiFloat{
    export class RewardPanel extends ui.mimiqiFloat.RewardPanelUI{
        constructor(){ 
            super(); 
            this.sideClose = true;
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
        }
        show(): void{
            clientCore.Logger.sendLog('2021年4月2日活动','【定时活动】周年庆花车巡游','查看奖励预览');
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