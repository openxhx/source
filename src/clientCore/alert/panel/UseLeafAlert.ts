namespace alert {
    /**
     * 通用购买
     * 点击确认，回调函数里面传入购买物品ID跟数量
     */
    export function useLeafAlert(num: number, caller: any, callFun: Function) {
        let view = new UseLeafAlert();
        view.showInfo(num,caller,callFun);
        clientCore.DialogMgr.ins.open(view);
    }

    class UseLeafAlert extends ui.alert.UseLeafAlertUI {
        private _caller:any;
        private _callFun:Function;
        constructor() {
            super();
            this.addEventListeners();
        }
        popupOver() {

        }
        showInfo(num: number,caller:any,callFun:Function) {
            this._caller = caller;
            this._callFun = callFun;

            this.txt.text = `是否确认消耗 ${num} 神叶？`
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSureClick);

            BC.addEvent(this, this.imgArrow, Laya.Event.CLICK, this, this.onSelectClick);
            BC.addEvent(this, this.imgBlock, Laya.Event.CLICK, this, this.onSelectClick);
        }
        private onSelectClick() {
            this.imgArrow.visible = !this.imgArrow.visible;
        }
        private onSureClick() {
            if (this.imgArrow.visible) {
                clientCore.GlobalConfig.showUseLeafAlert = false;
                clientCore.MedalManager.setMedal([{ id: MedalDailyConst.USE_LEAF_ALERT_NOT_SHOW, value: 1 }]);
            }
            this._callFun.call(this._caller);
            this.onClose();
        }
        private onClose() {
            this.destroy();
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
            clientCore.DialogMgr.ins.close(this);
        }
    }
}