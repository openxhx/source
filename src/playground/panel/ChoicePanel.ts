namespace playground {
    /**
     * 遥控骰子
     */
    export class ChoicePanel extends ui.playground.panel.ChoicePanelUI {
        private _choice: Laya.Image;
        private _index: number; //当前选择
        private _handler: Laya.Handler;
        constructor() { super(); }

        show(handler: Laya.Handler): void {
            this._choice = new Laya.Image('playground/frame_sel.png');
            this._choice.pos(-8, -8);
            this._handler = handler;
            this.onChoice(0);
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            for (let i: number = 0; i < 6; i++) { BC.addEvent(this, this.boxDice.getChildAt(i), Laya.Event.CLICK, this, this.onChoice, [i]); }
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._choice.destroy();
            this._handler = this._choice = null;
            super.destroy();
        }
        private onChoice(index: number): void {
            this._index = index;
            let sp: Laya.Sprite = this.boxDice.getChildAt(index) as Laya.Sprite;
            sp?.addChild(this._choice);
        }
        private onSure(): void {
            console.log(`choice dice is ` + this._index);
            this._handler?.runWith([2, this._index + 1]);
            this.hide();
        }
    }
}