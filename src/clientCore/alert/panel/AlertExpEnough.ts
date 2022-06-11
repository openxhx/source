
namespace alert {
    /**
     * 等级不足
     */
    export class AlertExpEnough extends ui.alert.EnoughExpUI {


        constructor() { super(); }

        show(): void {
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            for (let i: number = 1; i < 4; i++) {
                BC.addEvent(this, this["btnGo" + i], Laya.Event.CLICK, this, this.onClick, [i]);
            }
        }
        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onClick(index: number): void {
            switch (index) {
                case 1:
                    clientCore.ToolTip.gotoMod(25);
                    break;
                case 2:
                    clientCore.ToolTip.gotoMod(13);
                    break;
                case 3:
                    clientCore.ToolTip.gotoMod(15);
                    break;
                default:
                    break;
            }
            this.hide();
        }

        private static _ins: AlertExpEnough;
        /**
         * 展示通用等级不足的面板
         */
        public static showAlert(): void {
            this._ins = this._ins || new AlertExpEnough();
            this._ins.show();
        }
    }
}