namespace tigerMagic {
    /**
     * 布老虎魔法
     * tigerMagic.TigerTipPanel
     */
    export class TigerTipPanel extends ui.tigerMagic.panel.TigerTipPanelUI{

        private index:number = 1;

        constructor() {
            super();
        }

        setData(i:number) {
            if(i == 0){
                this.tip1.alpha = 0;
                this.tip2.alpha = 0;
                this.tip3.alpha = 0;
                this.index = 1;
                this.showControl();
            }
        }

        showControl(){
            if(this.index == 4){
                this.clearTween();
                return;
            }
            Laya.Tween.to(this["tip" + this.index] , { alpha: 1 } , 1500 ,Laya.Ease.quintIn, Laya.Handler.create(this,this.showControl));
            this.index = this.index + 1;
        }

        clearTween(){
            for(let i:number = 1 ; i<=3 ; i++){
                Laya.Tween.clearAll(this["tip" + i]);
            }
        }

        tipShow(){
            if(this.tip2.visible == false){
                this.tip2.visible = true;
            }else if(this.tip3.visible == false){
                this.tip3.visible = true;
                Laya.timer.clear(this, this.tipShow);
            }
        }

        private goEdit(){
            EventManager.event("DESTROY_TIGER");
            if(clientCore.MapInfo.type != 1){
                clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);
            }
            EventManager.event("OPEN_EDIT_PANEL");
        }

        addEventListeners() {
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.goBtn, Laya.Event.CLICK, this, this.goEdit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        onClose() {
            BC.removeEvent(this);
            this.clearTween();
            clientCore.DialogMgr.ins.close(this, false);
        }
    }
}