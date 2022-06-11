namespace chrysanthemumAlcohol {
    export class ReceivePanel extends ui.chrysanthemumAlcohol.panel.ReceivePanelUI {
        private _sign: number;

        private _model: ChrysanthemumAlcoholModel;
        private _control: ChrysanthemumAlcoholControl;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any = null) {
            this._model = clientCore.CManager.getModel(this._sign) as ChrysanthemumAlcoholModel;
            this._control = clientCore.CManager.getControl(this._sign) as ChrysanthemumAlcoholControl;

            clientCore.UIManager.setMoneyIds([this._model.itemId1]);
            clientCore.UIManager.showCoinBox();
        }

        private onReceive(): void {
            this._control.getFree(1, Laya.Handler.create(this, (msg: pb.sc_gloden_chrysanthemum_get_free) => {
                clientCore.DialogMgr.ins.close(this);
                if (msg.itms.length > 0) {
                    let itemData: pb.IItem = msg.itms[0];
                    alert.showFWords("获得" + clientCore.ItemsInfo.getItemName(itemData.id) + "x" + itemData.cnt);
                }
                this.event("ON_UPDATE_RECEIVE", msg);
            }));
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
            this.event("ON_CLOSE_RECEIVE");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnReceive, Laya.Event.CLICK, this, this.onReceive);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = this._control = null;
            super.destroy();
        }
    }
}