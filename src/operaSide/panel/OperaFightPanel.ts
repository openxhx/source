namespace operaSide {
    export class OperaFightPanel extends ui.operaSide.panel.OperaFightPanelUI {
        private _stageId: number;

        show(stageId: number, reward: number, canSweep: boolean) {
            clientCore.DialogMgr.ins.open(this);
            this._stageId = stageId;
            this.boxSweep.visible = canSweep;
            this.txtNum.text = '可获得:' + reward;
            this.txtContent.text = '每次战斗（扫荡）消耗1次今日战斗次数'
        }

        private async onSweep() {
            await clientCore.OperaSideManager.instance.sweepStage(this._stageId).then(() => {
                this.onClose();
            })
        }

        private async enterFight() {
            clientCore.LoadingManager.showSmall();
            await clientCore.SceneManager.ins.register();
            clientCore.LoadingManager.hideSmall(true);
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.SceneManager.ins.battleLayout(6, this._stageId);
            clientCore.SceneManager.ins.modMark = { openWhenClose: 'operaSide.OperaMapModule' };
        }

        private enterArray() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("battleArray.BattleArrayModule", null, { openWhenClose: "operaSide.OperaMapModule" });
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnFight, Laya.Event.CLICK, this, this.enterFight);
            BC.addEvent(this, this.btnArray, Laya.Event.CLICK, this, this.enterArray);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSweep, Laya.Event.CLICK, this, this.onSweep);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}