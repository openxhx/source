namespace newyear2021{
    /**
     * 集福字
     */
    export class NpcPanel extends ui.newyear2021.panel.NpcPanelUI implements IPanel{
        private _model: NewYear2021Model;
        show(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as NewYear2021Model;
            this.timesTxt.changeText(`今日获得:${this._model.redPacketTimes}/${this._model.MAX_REDPACKET}`);
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._model = null;
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
            clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '点击前往拜年按钮');
            clientCore.ToolTip.gotoMod(47);
        }
    }
}