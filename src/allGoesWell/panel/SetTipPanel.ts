namespace allGoesWell {
    export class SetTipPanel extends ui.allGoesWell.panel.SetTipPanelUI {
        constructor() {
            super();
            this.sideClose = true;
        }

        private goHome() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            if (clientCore.MapInfo.mapID != 1) {
                clientCore.MapManager.enterHome(clientCore.LocalInfo.uid, null, { force: true });
            }
        }

        onCloseClick() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goHome);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}