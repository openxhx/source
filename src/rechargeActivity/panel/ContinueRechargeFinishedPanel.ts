namespace rechargeActivity {
    /**
     * 连续奖励套装完成面板
     */
    export class ContinueRechargeFinishedPanel extends ui.rechargeActivity.panel.ContinueRechargeFinishedPanelUI {

        constructor() {
            super();
            this.sideClose = true;
        }

        initOver() {
            this.init2Pho();
        }

        private init2Pho(): void {
            this.imgPho.skin = `unpack/rechargeActivity/pho_${clientCore.LocalInfo.sex}.png`;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onClickHandler);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        private onClickHandler(e: Laya.Event): void {
            this.destroy();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("clothChange.ClothChangeModule");
        }

        onDestroy(): void {
            super.onDestroy();
        }
    }
}