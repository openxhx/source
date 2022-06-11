namespace orderSystem {
    export class OrderWaitPanel {

        private _textList: laya.ui.Label[];
        private _ui: ui.orderSystem.panel.waitPanelUI;
        private _data: OrderData;
        public immediateHandler: laya.utils.Handler;
        // public timeUpHandler: laya.utils.Handler;

        constructor(ui: ui.orderSystem.panel.waitPanelUI) {
            this._ui = ui;
            this._textList = [];
            this._textList.push(ui.txtMinute, ui.txtSeconds);
        }

        public dispose(): void {
            Laya.timer.clear(this, this.refreshTime);
        }

        public set data(value: OrderData) {
            this._data = value;
            let timeList: string[] = value.getRemainTime();
            this._textList[0].text = timeList[1];
            this._textList[1].text = timeList[2];
        }

        public set visible(value: boolean) {
            this._ui.visible = value;
            if (value) {
                Laya.timer.frameLoop(15, this, this.refreshTime);
            } else {
                Laya.timer.clear(this, this.refreshTime);
            }
        }

        private refreshTime() {
            if (this._data.checkTime()) {
                Laya.timer.clear(this, this.refreshTime);
                // this.timeUpHandler.runWith(this._data);
            } else {
                let timeList: string[] = this._data.getRemainTime();
                this._textList[0].text = timeList[1];
                this._textList[1].text = timeList[2];
                this._ui.btnSpeedUp.label = (parseInt(timeList[1]) + 1) + "加速";
            }
        }

        private onImmediate() {
            if (this.immediateHandler) {
                this.immediateHandler.run();
            }
        }

        public addEventListeners() {
            this._ui.btnSpeedUp.on(Laya.Event.CLICK, this, this.onImmediate);
        }

        public removeEventListeners() {
            this._ui.btnSpeedUp.offAll();
        }
    }
}