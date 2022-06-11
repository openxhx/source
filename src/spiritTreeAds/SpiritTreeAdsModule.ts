namespace spiritTreeAds {
    /**
     * spiritTreeAds.SpiritTreeAdsModule
     */
    export class SpiritTreeAdsModule extends ui.spiritTreeAds.SpiritTreeAdsModuleUI {
        private _rechargePanel: ContinueRechargePanel;
        constructor() {
            super();
        }
        init() {
            this.img_1.visible = clientCore.LocalInfo.sex == 1;
            this.img_2.visible = clientCore.LocalInfo.sex == 2;
            this.btnRecharge.visible = false;
            this.imgGou.visible = false;
            this.boxTip.visible = false;
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRate, Laya.Event.CLICK, this, this.showRate);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGoClick);
            BC.addEvent(this, this.btnRecharge, Laya.Event.CLICK, this, this.showRecharge);
            BC.addEvent(this, this.boxTip, Laya.Event.CLICK, this, this.setTip);
            for (let i = 0; i < 6; i++) {
                BC.addEvent(this, this["btnTry_" + i], Laya.Event.CLICK, this, this.tryCloth, [i]);
            }
        }
        private setTip() {
            this.imgGou.visible = !this.imgGou.visible;
        }
        private showRecharge() {
            clientCore.ModuleManager.open("spiritTreeAds.ContinueRechargePanel");
        }
        private tryCloth(num: number) {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", [2100272, 2110177, 2110237, 2110236, 2110235, 2100268][num]);
        }
        private showRate() {
            clientCore.ModuleManager.open("probability.ProbabilityModule", 1);
        }
        private onGoClick() {
            this.destroy();
            clientCore.ModuleManager.open("spirittree.SpirittreeModule");
        }
        destroy() {
            if (this.imgGou.visible) {
                clientCore.MedalManager.setMedal([{ id: MedalDailyConst.GOD_TREE_AD_DAILY, value: 1 }]);
            }
            BC.removeEvent(this);
            super.destroy();
        }
    }
}