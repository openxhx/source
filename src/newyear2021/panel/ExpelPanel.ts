namespace newyear2021{
    /**
     * 逐年兽
     */
    export class ExpelPanel extends ui.newyear2021.panel.ExpelPanelUI implements IPanel{
        show(sign: number): void{
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnGo,Laya.Event.CLICK,this,this.openWorldMap);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private openWorldMap(): void{
            clientCore.ToolTip.gotoMod(47);
        }
    }
}