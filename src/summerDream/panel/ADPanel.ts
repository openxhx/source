namespace summerDream {
    export class ADPanel extends ui.summerDream.panel.ADPanelUI {
        constructor() {
            super();
            this.sideClose = true;
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
        }

        private clickClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        /**展示套装详情 */
        private onTryClick() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110383);
        }

        /**打开夏日青柠 */
        private openPanel() {
            EventManager.event('SUMMER_DREAM_OPEN_PANEL', 4);
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.clickClose);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTryClick);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.openPanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}