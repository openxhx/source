namespace familyActivity {
    /**
     * 家族活动详细面板
     */
    export class ActivityRulePanel extends ui.familyActivity.RulePanelUI{
        constructor(){
            super();
        }
        init(data?:any){
            
        }
        show(data:number){
            this.imgTitle.skin = `familyActivity/title_${data}.png`;
            this.imgRule.skin = `familyActivity/acTxt_${data}.png`;
            clientCore.DialogMgr.ins.open(this);
        }
        addEventListeners(){
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.onClose);
        }
        onClose(){
            clientCore.DialogMgr.ins.close(this);
        }
        destroy(){
            BC.removeEvent(this);
            super.destroy();
        }
    }
}