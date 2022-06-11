namespace lostDream {
    /**
     * 挑战莱妮丝
     */
    export class BossPanel extends ui.lostDream.panel.BossPanelUI {
        private cnt: number; //挑战次数（花宝+1）
        private _model: LostDreamModel;
        private _control: LostDreamControl;
        private _fight: boolean;
        constructor() { super(); }

        show(sign: number): void {
            clientCore.DialogMgr.ins.open(this);
            this._model = clientCore.CManager.getModel(sign) as LostDreamModel;
            this._control = clientCore.CManager.getControl(sign) as LostDreamControl;
            let isPet: boolean = clientCore.FlowerPetInfo.petType > 0;
            this.cnt = isPet ? 4 : 3;
            this.txCnt.changeText(`挑战次数：${this._model.bossCnt}/${this.cnt}${isPet ? '(+1)' : ''}`);
            this.imgPet.gray = !isPet;

            let isSweep: boolean = this._model.sweepCnt > 0;
            this.sweepBtn.disabled = !isSweep;
            this.boxSweep.visible = isSweep;
            if (isSweep) {
                this.sweepIco.skin = clientCore.ItemsInfo.getItemIconUrl(this._model.ACTIVITY_ID);
                this.sweepTxt.changeText(`x${this._model.sweepCnt}`);
            }
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.battleBtn, Laya.Event.CLICK, this, this.onBattleArray);
            BC.addEvent(this, this.sweepBtn, Laya.Event.CLICK, this, this.onSweep);
            BC.addEvent(this, this.challengeBtn, Laya.Event.CLICK, this, this.onChallenge);
            BC.addEvent(this, this.quaBtn, Laya.Event.CLICK, this, this.onQuestion);
            BC.addEvent(this, this.imgPet, Laya.Event.CLICK, this, this.onPet);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._control = this._model = null;
            super.destroy();
        }
        /**打开战斗阵型*/
        private onBattleArray(): void {
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('battleArray.BattleArrayModule', null, { openWhenClose: 'lostDream.LostDreamModule', openData: [1] });
        }
        /** 扫荡*/
        private onSweep(): void {
            if (this._model.bossCnt <= 0) {
                alert.showFWords('今日挑战已达上限~');
                return;
            }
            this._control.sweepBattle(new Laya.Handler(this, () => {
                this.txCnt.changeText(`挑战次数：${--this._model.bossCnt}/${this.cnt}${clientCore.FlowerPetInfo.petType > 0 ? '(+1)' : ''}`)
            }))
        }
        /** 挑战*/
        private async onChallenge(): Promise<void> {
            if (this._fight) return; //防止二次连点
            if (this._model.bossCnt <= 0) {
                alert.showFWords('今日挑战已达上限~');
                return;
            }
            this._fight = true;
            clientCore.LoadingManager.showSmall();
            await clientCore.SceneManager.ins.register();
            clientCore.LoadingManager.hideSmall(true);
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.SceneManager.ins.battleLayout(6, 60102);
        }
        /**说明*/
        private onQuestion(): void {
            alert.showRuleByID(1007);
        }
        private onPet(): void {
            if (this.imgPet.gray) {
                clientCore.DialogMgr.ins.close(this, false);
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open('flowerPet.FlowerPetModule');
            }
        }
    }
}