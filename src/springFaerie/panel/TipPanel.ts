namespace springFaerie {
    export class TipPanel extends ui.springFaerie.panel.TipPanelUI {

        constructor() {
            super();
            this.sideClose = true;
        }

        show() {
            clientCore.DialogMgr.ins.open(this, false);
        }

        goControl(i:number){
            EventManager.event("CLOSE_SPRING");
            if(i==0){
                clientCore.ModuleManager.open('playground.PlaygroundModule');
            }else if(i==1){
                clientCore.Logger.sendLog('2022年 3月11日活动', '【主活动】古灵仙的春日', '点击收集可可');
                clientCore.ModuleManager.open("adventureMission.AdventureMissionModule");
            }else{
                clientCore.ModuleManager.open("kitchen.KitchenModule");
                clientCore.Logger.sendLog('2022年 3月11日活动', '【主活动】古灵仙的春日', '点击前往餐厅');
            }
        }

        hide(){
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            for(let i=0 ; i<3 ; i++){
                BC.addEvent(this, this["goBtn" + i], Laya.Event.CLICK, this, this.goControl , [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}