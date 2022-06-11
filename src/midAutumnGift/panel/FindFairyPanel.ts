namespace midAutumnGift {
    export class FindFairyPanel extends ui.midAutumnGift.panel.FindFairyPanelUI {
        private curFairy: number;
        Show(idx: number) {
            this.curFairy = idx;
            this.imgFairy.skin = `midAutumnGift/fairy_${idx}.png`;
            clientCore.DialogMgr.ins.open(this);
        }

        private GoFind() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            let map = this.curFairy == 1 ? 11 : this.curFairy == 2 ? 13 : 18;
            clientCore.MapManager.enterWorldMap(map);
        }

        private CloseSelf() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnFind, Laya.Event.CLICK, this, this.GoFind);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.CloseSelf);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}