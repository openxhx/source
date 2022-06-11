namespace halloween {
    export class HalloweenRewardPanel extends ui.halloween.HalloweenRewardPanelUI {
        constructor() {
            super();
            this.sideClose = true;
        }

        show(id: number) {
            this.icon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            this.labName.text = clientCore.ItemsInfo.getItemName(id);
            clientCore.DialogMgr.ins.open(this);
        }
    }
}