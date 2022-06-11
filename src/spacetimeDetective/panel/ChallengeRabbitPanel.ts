namespace spacetimeDetective {
    /**
     * 挑战小白兔
     */
    export class ChallengeRabbitPanel extends ui.spacetimeDetective.panel.ChallengeRabbitPanelUI {
        private _model: SpacetimeDetectiveModel;
        private _control: SpacetimeDetectiveControl;
        constructor(sign: number) {
            super();
            this.sign = sign;
            this._model = clientCore.CManager.getModel(this.sign) as SpacetimeDetectiveModel;
            this._control = clientCore.CManager.getControl(this.sign) as SpacetimeDetectiveControl;
        }

        initOver(): void {
            if (this._model.CHALLENGERABBIT_RULE_ID == null) {
                this.btnDetail.visible = false;
            }
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose, [false, false]);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onShowRule);
            BC.addEvent(this, this.btnArray, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onClickHandler);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnArray:
                    this.onClose(false, false);
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open('battleArray.BattleArrayModule', null, { openWhenClose: 'spacetimeDetective.SpacetimeDetectiveModule' });
                    break;
                case this.btnGo:
                    this.onGo();
                    break;
            }
        }

        private async onGo() {
            clientCore.LoadingManager.showSmall();
            await clientCore.SceneManager.ins.register();
            clientCore.LoadingManager.hideSmall(true);
            this.onClose(false, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.SceneManager.ins.battleLayout(6, 60102);
            clientCore.SceneManager.ins.modMark = { "openWhenClose": "spacetimeDetective.SpacetimeDetectiveModule" };
        }

        private onClose(isSucc: boolean, need: boolean = true): void {
            clientCore.DialogMgr.ins.close(this, need);
            EventManager.event(SpacetimeDetectiveEventType.CLOSE_ChallengeRabbitPanel, isSucc);
        }

        private onShowRule(): void {
            alert.showRuleByID(this._model.CHALLENGERABBIT_RULE_ID);
        }

        destroy(): void {
            this._model = this._control = null;
            super.destroy();
        }
    }
}