namespace ageTip {
    export class AgeTipModule extends ui.ageTip.AgeTipModuleUI {

        addEventListeners() {
            BC.addEvent(this, this.btnOk, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}