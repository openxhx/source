namespace anniversary2021 {
    export class GiftPanel extends ui.anniversary2021.panel.GiftPanelUI {
        private _model: Anniversary2021Model;
        private _control: Anniversary2021Control;
        private _array: xls.eventExchange[];

        private readonly ITEM_ID: number = 700011;
        constructor() { super(); }
        show(sign: number): void {
            this._model = clientCore.CManager.getModel(sign) as Anniversary2021Model;
            this._control = clientCore.CManager.getControl(sign) as Anniversary2021Control;
            this._array = _.map([2538,2539,2540],(element: number)=>{ return xls.get(xls.eventExchange).get(element); })
            this.updateExchange();
            this.updateBuy();
            clientCore.DialogMgr.ins.open(this);
            clientCore.UIManager.setMoneyIds([this.ITEM_ID,clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(this.ITEM_ID);
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
                        alert.showFWords('兑换材料不足~');
                        return;
                    }
                    this._control.buy(cfg.id,cfg.type, new Laya.Handler(this, () => {
                        if (this._closed) return;
                        this._model.buyTimes[0].buyCnt++;
                        this.updateExchange();
                    }))
                    break;
                case 2:
                    if (clientCore.ItemsInfo.getItemNum(cfg.cost[0].v1) < cfg.cost[0].v2) {
                        alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                        return;
                    }
                    alert.showSmall(`确定花费${cfg.cost[0].v2}灵豆购买商品?`, {
                        callBack: {
                            caller: this.visible, funArr: [() => {
                                this._control.buy(cfg.id, cfg.type, new Laya.Handler(this, () => {
                                    if (this._closed) return;
                                    this._model.buyTimes[1].buyCnt++;
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
        /** 更新材料兑换*/
        private updateExchange(): void {
            let cfg: xls.eventExchange = this._array[0];
            let msg: pb.IcommonShop = this._model.buyTimes[0];
            this.numTxt.changeText(clientCore.ItemsInfo.getItemNum(this.ITEM_ID) + '/' + cfg.cost[0].v2);
            let all: number = cfg.limit.v2;
            this.txt_1.changeText((all - msg.buyCnt) + '/' + all);
            this.btnEx_1.disabled = msg.buyCnt >= all;
        }
        /** 更新超值礼包*/
        private updateBuy(): void {
            let cfg: xls.eventExchange = this._array[1];
            let msg: pb.IcommonShop = this._model.buyTimes[1];
            let all: number = cfg.limit.v2;
            this.txt_2.changeText((all - msg.buyCnt) + '/' + all);
            this.btnEx_2.disabled = msg.buyCnt >= all;
        }
    }
}