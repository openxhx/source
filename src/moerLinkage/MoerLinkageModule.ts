namespace moerLinkage {
    export class MoerLinkageModule extends ui.moerLinkage.MoerLinkageModuleUI {

        init() {
            this.imgReward.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.LocalInfo.sex == 1 ? 152690 : 152691);
        }

        onPreloadOver() {

        }

        private showRule() {
            alert.showRuleByID(1243);
        }

        private goEvent() {
            this.destroy();
            clientCore.ModuleManager.open("plumYellow.PlumYellowModule");
        }

        private goSite() {
            if (Laya.Render.isConchApp) {
                clientCore.NativeMgr.instance.openUrl('https://actscp01.leiting.com/mole/202205/huaxian/act/index.html', true);
            }
            else {
                window.open('https://actscp01.leiting.com/mole/202205/huaxian/act/index.html', '_blank');
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGoEvent, Laya.Event.CLICK, this, this.goEvent);
            BC.addEvent(this, this.btnGoSite, Laya.Event.CLICK, this, this.goSite);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}