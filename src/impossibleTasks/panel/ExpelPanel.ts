namespace impossibleTasks {
    /**
     * 驱逐捣乱怪入口
     */
    export class ExpelPanel extends ui.impossibleTasks.panel.ExpelPanelUI {
        private _sign: number;
        private _fight: boolean;

        private _model: ImpossibleTasksModel;
        private _control: ImpossibleTasksControl;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(d: any = null) {
            this._model = clientCore.CManager.getModel(this._sign) as ImpossibleTasksModel;
            this._control = clientCore.CManager.getControl(this._sign) as ImpossibleTasksControl;

            this.updateView();
        }

        private updateView(): void {
            if (clientCore.FlowerPetInfo.petType > 0) {
                this.labTimes.text = '剩余次数：' + (this._model.bossCntMax - this._model.bossCnt) + '/' + this._model.bossCntMax + '(+1)';
                this.imgUp.visible = true;
            } else {
                this.labTimes.text = '剩余次数：' + (this._model.bossCntMax - this._model.bossCnt) + '/' + this._model.bossCntMax;
                this.imgUp.visible = false;
            }

            let isSweep: boolean = this._model.sweepCnt > 0;
            this.labCnt.text = this._model.sweepCnt + '';
            this.sweepBtn.disabled = !isSweep || this._model.bossCnt == this._model.bossCntMax;
            this.challengeBtn.disabled = this._model.bossCnt == this._model.bossCntMax;
            this.boxSweep.visible = isSweep;
        }

        private onDetail() {
            alert.showRuleByID(this._model.ruleById3);
        }

        /**打开战斗阵型*/
        private onBattleArray(): void {
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('battleArray.BattleArrayModule', null, { openWhenClose: 'impossibleTasks.ImpossibleTasksModule' });
        }

        /** 扫荡*/
        private onSweep(): void {
            if (this._model.bossCnt >= this._model.bossCntMax) {
                alert.showFWords('今日挑战已达上限~');
                return;
            }
            this._control.sweepBattle(new Laya.Handler(this, (msg: pb.sc_impossible_task_mop_up) => {
                this.updateView();
                alert.showReward(msg.items);
                this.event("ON_UPDATE_TOKEN");
            }))
        }

        /** 挑战*/
        private async onChallenge(): Promise<void> {
            if (this._fight) return; //防止二次连点
            if (this._model.bossCnt >= this._model.bossCntMax) {
                alert.showFWords('今日挑战已达上限~');
                return;
            }
            this._fight = true;
            let battle_id = this._model.battle_id;
            clientCore.LoadingManager.showSmall();
            await clientCore.SceneManager.ins.register();
            clientCore.LoadingManager.hideSmall(true);
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.SceneManager.ins.battleLayout(6, battle_id);
            clientCore.SceneManager.ins.modMark = { "openWhenClose": "impossibleTasks.ImpossibleTasksModule" };
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.battleBtn, Laya.Event.CLICK, this, this.onBattleArray);
            BC.addEvent(this, this.sweepBtn, Laya.Event.CLICK, this, this.onSweep);
            BC.addEvent(this, this.challengeBtn, Laya.Event.CLICK, this, this.onChallenge);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = null;
            this._control = null;
            super.destroy();
        }
    }
}