namespace cp {
    export class CpSuccesAlertPanel extends ui.cp.panel.SuccesAlertPanelUI {
        show(nick: string) {
            clientCore.DialogMgr.ins.open(this);
            this.sideClose = true;
            this.txt.text = `${nick}`;
        }
    }
}