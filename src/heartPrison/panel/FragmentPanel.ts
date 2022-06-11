namespace heartPrison{
    /**
     * 碎片获取
     */
    export class FragmentPanel extends ui.heartPrison.panel.FragmentPanelUI{
        private _model: HeartPrisonModel;
        private _sign: number;
        private _buy: BuyPanel;
        constructor(){ super(); }
        async show(sign: number): Promise<void>{
            this._sign = sign;
            this._model = clientCore.CManager.getModel(sign) as HeartPrisonModel;
            if(!this._model.msg){
                this._model.msg =  await net.sendAndWait(new pb.cs_halloween_active_panel()).then((msg: pb.sc_halloween_active_panel)=>{
                    return Promise.resolve(msg);
                });
            }
            this.timeTxt.changeText(`${this._model.msg.gameTimes}/3`);
            clientCore.Logger.sendLog('2020年10月30日活动', '【主活动】心灵之囚', '打开获得碎片弹窗');
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnGame,Laya.Event.CLICK,this,this.onClick,[1]);
            BC.addEvent(this,this.btnTask,Laya.Event.CLICK,this,this.onClick,[2]);
            BC.addEvent(this,this.btnExchange,Laya.Event.CLICK,this,this.onClick,[3]);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        private onClick(index: number): void{
            switch(index){
                case 1:
                    if(this._model.msg.gameTimes >= 3){
                        alert.showFWords('游戏次数不足啦~');
                        return;
                    }
                    clientCore.DialogMgr.ins.closeAllDialog();
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open('mouseGame.MouseGameModule', { modelType: "activity", openType: "seasonMelon", stageId: 60126, gameId: 3799999 }, { openWhenClose: "heartPrison.HeartPrisonModule" });
                    break;
                case 2:
                    clientCore.ToolTip.gotoMod(25);
                    break;
                case 3:
                    let cfg: xls.commonBuy = _.find(xls.get(xls.commonBuy).getValues(),(element: xls.commonBuy)=>{ return element.type == 87 && element.buyTimes == this._model.msg.buyTimes + 1; });
                    if(!cfg){
                        alert.showFWords('今日购买次数已达上限~');
                        return;
                    }
                    this._buy = this._buy || new BuyPanel();
                    this._buy.show(this._sign,cfg);
                    break;
            }
        }
    }
}