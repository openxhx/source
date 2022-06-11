namespace anniversary2021 {
    /**
     * 包含奖励
     */
    export class RewardPanel extends ui.anniversary2021.panel.RewardPanelUI {

        sideClose: boolean = true;

        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.itemRender);
            this.list.mouseHandler = new Laya.Handler(this, this.itemMouse);
        }
        show(array: xls.pair[]): void {
            clientCore.DialogMgr.ins.open(this);
            let len: number = array.length;
            let col: number = Math.ceil(len / 4);
            this.height = this.imgBg.height = 212 + (col - 1) * 117;
            this.list.height = 180 * col;
            this.list.array = array;
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        private itemRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: xls.pair = this.list.array[index];
            clientCore.GlobalConfig.setRewardUI(item,{id: data.v1,cnt: data.v2,showName: true});
        }
        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let data: xls.pair = this.list.array[index];
            clientCore.ToolTip.showTips(e.target, { id: data.v1 });
        }
    }
}