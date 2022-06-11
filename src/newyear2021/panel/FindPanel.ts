namespace newyear2021{
    /**
     * 集福字
     */
    export class FindPanel extends ui.newyear2021.panel.FindPanelUI implements IPanel{
        private _model: NewYear2021Model;
        show(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as NewYear2021Model; 
            this.limitTxt.changeText(`今日上限:${this._model.findFuTimes}/${this._model.MAX_FIND_FU}`);
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnFind,Laya.Event.CLICK,this,this.openFriend);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private openFriend(): void{
            clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '点击寻找福袋按钮');
            clientCore.ToolTip.gotoMod(11);
        }
    }
}