namespace afternoonTime {
    /**
     * 11.5
     * 主活动感恩午后时光
     * afternoonTime.PickUpPanel
     */
    export class PickUpPanel extends ui.afternoonTime.panel.PickUpPanelUI {
        constructor() {
            super();
            this.sideClose = true;
        }
        init() {
            this.labNum.text = `接取花露${clientCore.ItemsInfo.getItemNum(9900262)}/10`
        }

        addEventListeners() {
            BC.addEvent(this, this.btnPickUp, Laya.Event.CLICK, this, this.goWater);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();

        }

        private goWater() {
            super.destroy();
            EventManager.event('PickUpPanelClose');
            clientCore.MapManager.setSelfBodyPos(650, 560);
        }
    }
}