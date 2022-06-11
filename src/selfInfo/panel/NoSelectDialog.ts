namespace selfInfo {
    export class NoSelectDialog extends ui.selfInfo.panel.NoSelectableUI {
        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnAct, Laya.Event.CLICK, this, this.goMod, ["rechargeActivity.RechargeActivityModule"]);
            BC.addEvent(this, this.btnTree, Laya.Event.CLICK, this, this.goMod, ['spirittree.SpirittreeModule']);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private goMod(mod: string) {
            if (mod == "rechargeActivity.RechargeActivityModule") {
                if (clientCore.LocalInfo.userLv < 8) {
                    alert.showSmall("活动暂未开启！");
                    return;
                }
            }
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open(mod);
        }

        public show(titile: 'role' | 'pray'): void {
            clientCore.DialogMgr.ins.open(this);
            this.clipTitle.index = titile == 'role' ? 0 : 1;
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}