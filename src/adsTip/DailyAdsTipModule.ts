namespace adsTip {
    /**
     * 2021.7.30
     * 平台活动宣传
     * adsTip.DailyAdsTipModule
     */
    export class DailyAdsTipModule extends ui.adsTip.DailyAdsTipModuleUI {
        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.PLATFORM_AD_OPEN, value: 1 }]);
        }
    }
}