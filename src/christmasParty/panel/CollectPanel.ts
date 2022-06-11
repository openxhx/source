namespace christmasParty {
    export class CollectPanel extends ui.christmasParty.panel.CollectPanelUI {
        private _sign: number;

        private _model: ChristmasPartyModel;
        private _control: ChristmasPartyControl;

        public updateHanlder: Laya.Handler;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this._sign) as ChristmasPartyModel;
            this._control = clientCore.CManager.getControl(this._sign) as ChristmasPartyControl;
            this.labNum.text = clientCore.ItemsInfo.getItemNum(this._model.tokenId2) + "/30";

            clientCore.UIManager.setMoneyIds([this._model.tokenId]);
            clientCore.UIManager.showCoinBox();
        }

        private onClose() {
            this.event("ON_CLOSE");
            clientCore.DialogMgr.ins.close(this);
        }

        private onExchange() {
            this._control.getShowerAward(Laya.Handler.create(this, (msg: pb.sc_christmas_party_exchange_lingdang) => {
                this.updateHanlder.run();
                alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
                this.onClose();
            }))
        }

        private onGo(): void {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("preludeToChristmas.PreludeToChristmasModule");
        }

        private onImg1(): void {
            clientCore.ToolTip.showTips(this.img1, { id: this._model.tokenId2 });
        }

        private onImg2(): void {
            clientCore.ToolTip.showTips(this.img2, { id: this._model.tokenId });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGo);
            BC.addEvent(this, this.img1, Laya.Event.CLICK, this, this.onImg1);
            BC.addEvent(this, this.img2, Laya.Event.CLICK, this, this.onImg2);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = null;
            this._control = null;
            super.destroy();
        }
    }
}