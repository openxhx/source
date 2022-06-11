namespace snowEvent {
    /**
     * 神秘宝箱事件
     */
    export class TreasureBoxPanel extends ui.snowEvent.TreasureBoxPanelUI implements ISnowEventPanel {
        public sweepHanlder: Laya.Handler;

        constructor() {
            super();
        }
    }
}