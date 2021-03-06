namespace foreignLands {
    export class BuyPanel extends ui.foreignLands.BuyPanelUI {
        private _model: ForeignLandsModel;
        private _control: ForeignLandsControl;
        private _array: xls.eventExchange[];
        constructor() { super(); }
        show(sign: number): void {
            this._model = clientCore.CManager.getModel(sign) as ForeignLandsModel;
            this._control = clientCore.CManager.getControl(sign) as ForeignLandsControl;
            this._array = _.filter(xls.get(xls.eventExchange).getValues(), (element: xls.eventExchange) => { return element.type == this._model.ACTIVITY_ID; });
            this.updateExchange();
            this.updateBuy();
            clientCore.DialogMgr.ins.open(this);
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }
        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this._array.length = 0;
            this._array = null;
            this._model = null;
            this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            for (let i: number = 1; i < 4; i++) {
                BC.addEvent(this, this['btnEx_' + i], Laya.Event.CLICK, this, this.onClick, [i]);
            }
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.openProduce);
            BC.addEvent(this, this.btnMoney, Laya.Event.CLICK, this, this.openMoneyShop);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private onClick(index: number): void {
            let cfg: xls.eventExchange = this._array[index - 1];
            switch (index) {
                case 1:
                    if (clientCore.ItemsInfo.getItemNum(cfg.cost[0].v1) < cfg.cost[0].v2) {
                        alert.showFWords('??????????????????~');
                        return;
                    }
                    this._control.exchange(cfg.type, cfg.id, new Laya.Handler(this, () => {
                        if (this._closed) return;
                        this._model.makeTimes--;
                        this.updateExchange();
                    }))
                    break;
                case 2:
                    if (clientCore.ItemsInfo.getItemNum(cfg.cost[0].v1) < cfg.cost[0].v2) {
                        alert.showSmall("????????????????????????????????????", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                        return;
                    }
                    alert.showSmall(`????????????${cfg.cost[0].v2}???????????????????`, {
                        callBack: {
                            caller: this.visible, funArr: [() => {
                                this._control.exchange(cfg.type, cfg.id, new Laya.Handler(this, () => {
                                    if (this._closed) return;
                                    this._model.buyTimes--;
                                    this.updateBuy();
                                }))
                            }]
                        }
                    })
                    break;
                case 3:
                    alert.alertQuickBuy(this._model.ACTIVITY_MONEY_ID, 10);
                    break;
            }
        }
        /** ??????????????????*/
        private updateExchange(): void {
            let cfg: xls.eventExchange = this._array[0];
            this.numTxt.changeText(clientCore.ItemsInfo.getItemNum(700011) + '/' + cfg.cost[0].v2);
            let all: number = cfg.limit.v2;
            this.txt_1.changeText(this._model.makeTimes + '/' + all);
            this.btnEx_1.disabled = this._model.makeTimes <= 0;
        }
        /** ??????????????????*/
        private updateBuy(): void {
            let cfg: xls.eventExchange = this._array[1];
            let all: number = cfg.limit.v2;
            this.txt_2.changeText(this._model.buyTimes + '/' + all);
            this.btnEx_2.disabled = this._model.buyTimes <= 0;
        }
        private openMoneyShop(): void {
            clientCore.ToolTip.gotoMod(50);
        }
        private openProduce(): void {
            clientCore.JumpManager.jumpByItemID(700011);
        }
    }
}