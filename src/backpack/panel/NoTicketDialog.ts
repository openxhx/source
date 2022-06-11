namespace backpack.panel {
    export class NoTicketDialog extends ui.backpack.NoTicketPanelUI {
        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnAdv, Laya.Event.CLICK, this, this.onGoAdv);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.onGoShop);
            BC.addEvent(this, this.btnCommonShop, Laya.Event.CLICK, this, this.onGoCommonShop);

        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onGoCommonShop() {
            this.hide();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("commonShop.CommonShopModule", 1, { openWhenClose: "backpack.BackpackModule" });
        }
        private onGoAdv() {
            this.hide();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('adventure.AdventureModule');
        }

        private onGoShop() {
            if (clientCore.FamilyMgr.ins.checkInFamily()) {
                this.hide();
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.FamilyMgr.ins.openFamily();
            }
            else {
                alert.showSmall('还没有家族', { btnType: alert.Btn_Type.ONLY_SURE });
            }
        }

        public show(): void {
            clientCore.DialogMgr.ins.open(this);
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}