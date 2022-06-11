namespace restaurant {
    export class RestaurantRulePanel extends ui.restaurant.panel.RestaurantRulePanelUI {


        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);

        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}