namespace boss {
    /**
     * boss弹出框
     */
    export class AlertPanel extends ui.boss.panel.AlertPanelUI {

        private _handler: Laya.Handler;
        private _medal: number;
        private _status: number;

        constructor() { super(); }

        /**
         * @param value 内容
         * @param medal 勋章ID
         */
        show(value: string, medal: number, handler?: Laya.Handler): void {
            this.txValue.text = value;
            this._handler = handler;
            this._medal = medal;
            this.imgYes.visible = false;
            this._status = this.imgYes.visible ? 1 : 0;
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void {
            let status: number = this.imgYes.visible ? 1 : 0;
            status != this._status && clientCore.MedalManager.setMedal([{ id: this._medal, value: status }]);
            this._handler = null;
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnG, Laya.Event.CLICK, this, this.onMedal);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onSure(): void {
            this._handler?.run();
            this.hide();
        }

        private onMedal(): void {
            this.imgYes.visible = !this.imgYes.visible;
        }
    }
}