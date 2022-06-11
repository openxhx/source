namespace christmasParty {
    export class AngesiPanel extends ui.christmasParty.panel.AngesiPanelUI {
        private _model: ChristmasPartyModel;

        constructor(sign: number) {
            super();
            this.sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this.sign) as ChristmasPartyModel;

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
            clientCore.ModuleManager.open("linkGame.LinkGameModule", { modelType: "activity", openType: "christmasParty", stageId: 60130, gameId: 3300011 }, { openWhenClose: "christmasParty.ChristmasPartyModule" });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.onGame);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = null;
            super.destroy();
        }
    }
}