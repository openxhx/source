namespace cp {

    export class CpBrideAlertModule extends ui.cp.CpBrideAlertModuleUI {
        init(d: any) {
            this.addPreLoad(clientCore.ModuleManager.loadatlas('cp/bride'))
        }
        onPreloadOver() {
            this.imgCloth.skin = clientCore.LocalInfo.sex == 1 ? 'unpack/cp/2850.png' : 'unpack/cp/2851.png';
            this.sideClose = true;
            this.mouseThrough = true;
            this.imgGou.visible = false;
        }

        private onGo() {
            this.destroy();
            clientCore.ModuleManager.open('cp.CpMainModule', 'bride');
        }

        private onDaily() {
            this.imgGou.visible = true;
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.CP_BRIDE_ALERT_DAILY, value: 1 }]);
            this.destroy();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGo);
            BC.addEvent(this, this.imgSelect, Laya.Event.CLICK, this, this.onDaily);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}