namespace odeToJay{
    /**
     * 水果连连看
     */
    export class LinkGamePanel extends ui.odeToJay.panel.LinkPanelUI{

        private _model: OdeToJayModel;
        private _control: OdeToJayControl;

        constructor(){ super(); }

        show(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as OdeToJayModel;
            this._control = clientCore.CManager.getControl(sign) as OdeToJayControl;
            this.timesTxt.changeText(`挑战次数:${this._model.linkTimes}/3`);
            this.btnGame.disabled = this._model.linkTimes == 0;
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
            clientCore.Logger.sendLog('2021年4月30日活动', '【游戏】水果连连看', '查看游戏规则');
            alert.showRuleByID(1044);
        }

        private go(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【游戏】水果连连看', '点击进行小游戏');
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("linkLinkGame2.LinkLinkGameModule", { modelType: "activity", openType: "odeToJay", stageId: 60112, gameId: 3201001 }, { openWhenClose: "odeToJay.OdeToJayModule",openData: 2});
        }
    }
}