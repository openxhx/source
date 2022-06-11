namespace christmasParty {
    export class KukuluPanel extends ui.christmasParty.panel.KukuluPanelUI {
        private _model: ChristmasPartyModel;
        private _control: ChristmasPartyControl;

        constructor(sign: number) {
            super();
            this.sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this.sign) as ChristmasPartyModel;
            this._control = clientCore.CManager.getControl(this.sign) as ChristmasPartyControl;

            clientCore.GlobalConfig.setRewardUI(this.itemAward, { id: this._model.tokenId, cnt: 0, showName: false });
            clientCore.UIManager.releaseCoinBox();
        }

        private onClose() {
            this.event("ON_CLOSE");
            clientCore.DialogMgr.ins.close(this);
        }

        private onGame() {
            this.onClose();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("rotateJump.RotateJumpGameModule", { modelType: "activity", openType: "christmasParty", stageId: 60131, gameId: 3500002 }, { openWhenClose: "christmasParty.ChristmasPartyModule" });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.onGame);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = this._control = null;
            super.destroy();
        }
    }
}