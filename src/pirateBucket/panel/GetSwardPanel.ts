namespace pirateBucket{
    export class GetSwardPanel extends ui.pirateBucket.panel.GetPanelUI{
        constructor(){
            super();
            this.sideClose = true;
        }

        private onClose(){
            clientCore.DialogMgr.ins.close(this, false);
        }

        private goCreat(){
            this.onClose();
            EventManager.event("PIRATE_GO_CREAT");
        }

        private goSell(){
            this.onClose();
            EventManager.event("PIRATE_GO_SELL");
        }

        addEventListeners(){
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.onClose);
            BC.addEvent(this,this.btnGoCreat,Laya.Event.CLICK,this,this.goCreat);
            BC.addEvent(this,this.btnGoSell,Laya.Event.CLICK,this,this.goSell);
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}