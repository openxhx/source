namespace odeToJay{
    /**
     * 挑战BOSS
     */
    export class BossPanel extends ui.odeToJay.panel.BossPanelUI{

        private _model: OdeToJayModel;
        private _control: OdeToJayControl;
        private _wait: boolean;

        constructor(){ super(); }

        show(sign: number): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【游戏】莱妮丝的挑战', '打开游戏面板');
            this._model = clientCore.CManager.getModel(sign) as OdeToJayModel;
            this._control = clientCore.CManager.getControl(sign) as OdeToJayControl;
            this.timesTxt.changeText(`挑战次数:${this._model.bossTimes}/3`);
            this.btnSweep.disabled = this.btnStart.disabled = this._model.bossTimes == 0;
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
            BC.addEvent(this,this.btnArray,Laya.Event.CLICK,this,this.openArray);
            BC.addEvent(this,this.btnStart,Laya.Event.CLICK,this,this.openBattle);
            BC.addEvent(this,this.btnSweep,Laya.Event.CLICK,this,this.onSweep);
        }

        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        /** 阵容调整*/
        private openArray(): void{
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('battleArray.BattleArrayModule', null, { openWhenClose: 'odeToJay.OdeToJayModule', openData: 3 });
        }

        /** 开始战斗*/
        private async openBattle(): Promise<void>{
            if (this._model.bossTimes <= 0) {
                alert.showFWords('今日挑战已达上限~');
                return;
            }
            if (this._wait) return; //防止二次连点
            this._wait = true;
            clientCore.LoadingManager.showSmall();
            await clientCore.SceneManager.ins.register();
            clientCore.LoadingManager.hideSmall(true);
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.SceneManager.ins.battleLayout(6, 60102);
        }
    
        private onSweep(): void{
            if (this._model.bossTimes <= 0) {
                alert.showFWords('今日挑战已达上限~');
                return;
            }
            this._control.sweep(new Laya.Handler(this, () => {
                this.timesTxt.changeText(`挑战次数：${--this._model.bossTimes}/3`);
                this.btnSweep.disabled = this.btnStart.disabled = this._model.bossTimes == 0;
            }))
        }
    }
}