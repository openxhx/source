
namespace alert {
    /**
     * 神叶不足
     */
    export class AlertLeafEnough extends ui.alert.EnoughLeafUI {

        private _needCnt: number;

        constructor() { super(); }

        show(needCnt: number): void {
            this._needCnt = needCnt;
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
                    clientCore.ToolTip.gotoMod(52);
                    break;
                case 3:
                    alert.alertQuickBuy(clientCore.MoneyManager.LEAF_MONEY_ID, this._needCnt);
                    break;
                default:
                    break;
            }
            this.hide();
        }

        private static _ins: AlertLeafEnough;
        /**
         * 展示通用神叶不足的面板
         * @param cnt 神叶差值
         */
        public static showAlert(cnt: number): void {
            this._ins = this._ins || new AlertLeafEnough();
            this._ins.show(cnt);
        }
    }
}