namespace spirittree {
    /**
     * 预告
     */
    export class SpirittreeNoticePanel extends ui.spirittree.panel.TipPanelUI {
        public sideClose: boolean = true;
        constructor() { super(); }
        show(): void {
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            clientCore.MedalManager.setMedal([{ id: MedalConst.SPIRITTREE_NOTICE, value: 1 }]);
            super.destroy();
        }
    }
}