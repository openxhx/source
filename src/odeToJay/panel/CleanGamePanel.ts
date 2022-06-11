namespace odeToJay{
    /**
     * 清理游戏
     */
    export class CleanGamePanel extends ui.odeToJay.panel.CleanPanelUI{

        private _model: OdeToJayModel;
        private _control: OdeToJayControl;

        constructor(){ super(); }

        show(sign: number): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【游戏】劳动节大扫除', '打开游戏面板');
            this._model = clientCore.CManager.getModel(sign) as OdeToJayModel;
            this._control = clientCore.CManager.getControl(sign) as OdeToJayControl;
            this.btnGame.disabled = this._model.cleanTimes == 0;
            this.timesTxt.changeText(`挑战次数:${this._model.cleanTimes}/3`);
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }

        destroy(): void{
            this._model = this._control = null;
            super.destroy();
        }

        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onRule);
            BC.addEvent(this,this.btnGame,Laya.Event.CLICK,this,this.go);
        }

        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        private onRule(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【游戏】劳动节大扫除', '点击游戏规则');
            alert.showRuleByID(1036);
        }

        private go(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【游戏】劳动节大扫除', '进入游戏');
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('cleanGame.CleanGameModule', { modelType: "activity", openType: "odeToJay", stageId: 60110, gameId: 3800001 }, { openWhenClose: "odeToJay.OdeToJayModule" ,openData: 1});
        }
    }
}