


namespace selfInfo {
    /**
     * 使用道具的数量
     */
    export class UsePanel extends ui.selfInfo.panel.UsePanelUI {

        private _handler: Laya.Handler;
        private _max: number;

        constructor() { super(); }

        show(max: number, handler: Laya.Handler): void {
            clientCore.DialogMgr.ins.open(this);
            this._handler = handler;
            this._max = max;
            this.changeCount(1);
            this.txtTitle.text = '使用数量选择';
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private onMax() {
            this.changeCount(this._max);
        }

        private onInputChange() {
            let num = this.txCount.text == '' ? 0 : parseInt(this.txCount.text);
            num = _.clamp(num, 1, this._max);
            this.changeCount(num);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnMax, Laya.Event.CLICK, this, this.onMax);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onChangeCount, [0]);
            BC.addEvent(this, this.btnMinus, Laya.Event.CLICK, this, this.onChangeCount, [1]);
            BC.addEvent(this, this.txCount, Laya.Event.INPUT, this, this.onInputChange);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._handler && this._handler.recover();
            this._handler = null;
            super.destroy();
        }

        private onSure(): void {
            let count: number = Number(this.txCount.text);
            if (count <= 0) return;
            this._handler && this._handler.runWith(count);
            this.hide();
        }

        private onChangeCount(type: number): void {
            let count: number = Number(this.txCount.text);
            type == 0 ? count++ : count--;
            this.changeCount(count);
        }

        private changeCount(count: number): void {
            this.txCount.changeText(count + "");
            this.btnMinus.disabled = count <= 1;
            this.btnAdd.disabled = count >= this._max;
        }
    }
}