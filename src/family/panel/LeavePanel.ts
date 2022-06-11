namespace family.panel {
    /**
     * 离开
     */
    export class LeavePanel extends ui.family.panel.LeavePanelUI {
        constructor() { super(); }

        show(): void {
            clientCore.DialogMgr.ins.open(this);
            this.txDesc.changeText(`是否离开【${clientCore.FamilyMgr.ins.svrMsg.fmlName}】家族？`);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnCanel, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnLeave, Laya.Event.CLICK, this, this.onLeave);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onLeave(): void {
            if (clientCore.ServerManager.curServerTime > util.TimeUtil.formatTimeStrToSec("2022-3-7 00:00:00")
                && clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2022-3-11 00:00:00")) {
                alert.showFWords("活动期间不能离开家族~");
                return;
            }
            if (clientCore.FamilyMgr.ins.svrMsg.post == FamlyPost.SHAIKH) {
                alert.showFWords("族长需要转让职位后才可以离开家族");
                return;
            }
            FamilySCommand.ins.leaveFamily();
        }
    }
}