namespace collection {
    export class CoCgPanel implements ICollectionPanel {
        ui: ui.collection.panel.CgPanelUI;
        constructor() {
            this.ui = new ui.collection.panel.CgPanelUI();
            this.addEvent();
        }

        show() {

        }

        waitLoad() {
            return Promise.resolve();
        }

        private addEvent() {
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        private removeEvent() {

        }

        private onClose() {
            EventManager.event(EV_CHAGE_PANEL, PANEL.BASE);
        }

        destory() {
            this.removeEvent();
        }
    }
}