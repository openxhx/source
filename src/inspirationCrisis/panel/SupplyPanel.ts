namespace inspirationCrisis {
    export class SupplyPanel extends ui.inspirationCrisis.panel.SupplyPanelUI {
        private _sign: number;

        private _onCloseFun: Function;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any) {
            this._onCloseFun = data.onCloseFun;
        }

        initOver() {
            let model = clientCore.CManager.getModel(this._sign) as InspirationCrisisModel;
            this.labItem1.text = model.supplyItemNum + '';
            this.labItem2.text = '/' + model.expendItemNum;
            this.labMood.text = '+' + model.canSupplyMood;
            this.imgMarkUp.gray = clientCore.FlowerPetInfo.petType == 0;
        }

        private onSubmit(): void {
            let model = clientCore.CManager.getModel(this._sign) as InspirationCrisisModel;
            if (model.supplyItemNum < model.expendItemNum) {
                alert.showFWords("道具数量不足！");
                return;
            }
            let control = clientCore.CManager.getControl(this._sign) as InspirationCrisisControl;
            control.exchange(Laya.Handler.create(this, (msg: pb.sc_inspire_crisis_exchange) => {
                model.supplyTimes++;
                model.updateBuyTimes();
                this._onCloseFun(msg.items);
                clientCore.DialogMgr.ins.close(this);
            }));
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.onSubmit);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._onCloseFun = null;
            super.destroy();
        }
    }
}