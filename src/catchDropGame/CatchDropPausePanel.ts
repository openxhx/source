namespace catchDropGame {
    export class CatchDropPausePanel extends ui.catchDrop.CatchDropPausePanelUI {
        show() {
            clientCore.DialogMgr.ins.open(this);
        }

        private onExit() {
            clientCore.ToolTip.gotoMod(95);
        }

        private onReturn() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnReturn, Laya.Event.CLICK, this, this.onReturn);
            BC.addEvent(this, this.btnExit, Laya.Event.CLICK, this, this.onExit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}