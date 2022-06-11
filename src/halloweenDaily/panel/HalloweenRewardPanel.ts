namespace halloweenDaily {
    export class HalloweenRewardPanel extends ui.halloweenDaily.HalloweenRewardPanelUI {
        constructor() {
            super();
            this.sideClose = false;
        }

        show(id: number) {
            this.icon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            this.labName.text = clientCore.ItemsInfo.getItemName(id);
            clientCore.DialogMgr.ins.open(this);
        }

        closeAll() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
        }

        addEventListeners() {
            BC.addEvent(this, Laya.stage, Laya.Event.CLICK, this, this.closeAll);
        }

        removeEventListeners() {
            BC.removeEvent(this, Laya.stage, Laya.Event.CLICK, this, this.closeAll);
        }
    }
}