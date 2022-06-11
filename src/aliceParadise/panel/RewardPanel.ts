namespace aliceParadise {
    /**
     * 奖励
     */
    export class RewardPanel extends ui.aliceParadise.panel.RewardPanelUI {

        sideClose: boolean = true;

        constructor() {
            super();
            this.list.hScrollBarSkin = '';
            this.list.renderHandler = new Laya.Handler(this, this.itemRender);
            this.list.mouseHandler = new Laya.Handler(this, this.itemMouse);
        }
        show(array: string[]): void {
            clientCore.DialogMgr.ins.open(this);
            let len: number = array.length;
            this.list.width = 152 * len;
            this.list.array = array;
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        private itemRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let id: number = parseInt(this.list.array[index]);
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            item.num.value = util.StringUtils.parseNumFontValue(1);
            item.txtName.visible = true;
            item.txtName.changeText(clientCore.ItemsInfo.getItemName(id));
        }
        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let id: number = parseInt(this.list.array[index]);
            clientCore.ToolTip.showTips(e.target, { id: id });
        }
    }
}