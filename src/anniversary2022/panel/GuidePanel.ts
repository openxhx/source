namespace anniversary2022{
    export class GuidePanel extends ui.anniversary2022.panel.GuidePanelUI{
        constructor(){
            super();
            this.sideClose = false;
        }

        private getReward(){
            this.btnGet.visible = false;
            net.sendAndWait(new pb.cs_second_anniversary_celebration_guide()).then((msg:pb.sc_second_anniversary_celebration_guide)=>{
                alert.showReward(msg.item);
                clientCore.Logger.sendLog('2022年3月25日活动', '【主活动】小花仙两周年庆典', '领取到5个地图的周年庆奖励');
                clientCore.DialogMgr.ins.close(this);
                EventManager.event("OPEN_TECHO_PANEL");
            })
        }

        addEventListeners(){
            BC.addEvent(this,this.btnGet,Laya.Event.CLICK,this,this.getReward);
        }

        removeEventListeners(){
            BC.removeEvent(this);
        }
    }
}