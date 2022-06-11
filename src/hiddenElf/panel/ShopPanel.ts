namespace hiddenElf {
    /**
     * 神秘商人
     */
    export class ShopPanel extends ui.hiddenElf.panel.ShopPanelUI {
        private _model: HiddenElfModel;
        private _control: HiddenElfControl;
        private _array: xls.commonBuy[];
        constructor() { super(); }
        show(sign: number): void {
            this._array = _.filter(xls.get(xls.commonBuy).getValues(), (element: xls.commonBuy) => { return element.type == 109; });
            if (this._array.length == 0) {
                this._array = null;
                alert.showFWords(`配置信息有误~`);
                return;
            }
            this._model = clientCore.CManager.getModel(sign) as HiddenElfModel;
            this._control = clientCore.CManager.getControl(sign) as HiddenElfControl;
            this.updateView();
            clientCore.DialogMgr.ins.open(this);
            clientCore.UIManager.setMoneyIds([this._model.ACTIVITY_ID, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this._array.length = null;
            this._array = this._model = this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private updateView(): void {
            let data: xls.commonBuy = this._array[this._model.buyTimes];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            let cost: xls.pair = data.itemCost;
            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(cost.v1);
            this.imgGet.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            this.txtCost.changeText(`x${cost.v2}`);
            this.txtGet.changeText(`x${reward.v2}`);
            this.btnBuy.disabled = clientCore.ItemsInfo.getItemNum(cost.v1) < cost.v2;
        }

        private onBuy(): void {
            let cls: xls.commonBuy = this._array[this._model.buyTimes];
            let reward = clientCore.LocalInfo.sex == 1 ? cls.femaleAward[0] : cls.maleAward[0];
            let has: number = clientCore.ItemsInfo.getItemNum(cls.itemCost.v1);
            if (has < cls.itemCost.v2) {
                if (cls.itemCost.v1 == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(cls.itemCost.v2 - has);
                    }));
                } else if (cls.itemCost.v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                }
                return;
            }
            alert.showBuyTimesPanel({
                nowTime: this._model.buyTimes, maxTime: 4, coinNum: cls.itemCost.v2, coinId: cls.itemCost.v1, buyNum: reward.v2, buyId: reward.v1, sureHanlder: Laya.Handler.create(this, () => {
                    this._control.buyDaily(new Laya.Handler(this, () => {
                        alert.showFWords('购买成功~');
                        if (this._closed) return;
                        if (++this._model.buyTimes >= 4) { //已经购买了4次
                            alert.showFWords('今日购买次数已达上限了哦~');
                            this.hide();
                            return;
                        }
                        this.updateView();
                    }))
                }), noIcon: `确认消耗${cls.itemCost.v2}${clientCore.ItemsInfo.getItemName(cls.itemCost.v1)}购买${reward.v2}${clientCore.ItemsInfo.getItemName(reward.v1)}吗？`
            });

        }
    }
}