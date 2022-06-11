namespace loginAds {
    /**
     * 屈臣氏弹窗
     */
    export class LoginQcsModule extends ui.loginAds.LoginQcsModuleUI {

        public sideClose: boolean = true;

        constructor() { super(); }

        init(): void {
            this.imgG.visible = false;
        }

        addEventListeners(): void {
            BC.addEvent(this, this.boxShow, Laya.Event.CLICK, this, this.onShowToday);
            BC.addEvent(this, this.imgBG, Laya.Event.CLICK, this, this.destroy);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this.imgG.visible && clientCore.MedalManager.setMedal([{ id: MedalDailyConst.QCS_ALERT_DAILY, value: 1 }]);
            EventManager.event(globalEvent.CHECK_NEXT_ADS);
            super.destroy();
        }

        private onShowToday(): void {
            this.imgG.visible = !this.imgG.visible;
        }
    }
}