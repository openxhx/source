namespace chrysanthemumAlcohol {
    export class BuyPanel extends ui.chrysanthemumAlcohol.panel.BuyPanelUI {
        private _sign: number;

        private _model: ChrysanthemumAlcoholModel;
        private _control: ChrysanthemumAlcoholControl;

        private buyInfo: xls.commonBuy;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any = null) {
            this._model = clientCore.CManager.getModel(this._sign) as ChrysanthemumAlcoholModel;
            this._control = clientCore.CManager.getControl(this._sign) as ChrysanthemumAlcoholControl;
            this.buyInfo = this._model.getBuyInfo();

            this.imgNum.skin = "chrysanthemumAlcohol/buy_num_" + (this._model.buyTimes + 1) + ".png"
            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(this.buyInfo.itemCost.v1);
            this.labNum.text = this.buyInfo.itemCost.v2 + "";

            clientCore.UIManager.setMoneyIds([this.buyInfo.itemCost.v1, this._model.itemId1]);
            clientCore.UIManager.showCoinBox();
        }

        private onBuy(): void {
            let reward = clientCore.LocalInfo.sex == 1 ? this.buyInfo.femaleAward[0] : this.buyInfo.maleAward[0];
            let has: number = clientCore.ItemsInfo.getItemNum(this.buyInfo.itemCost.v1);
            if (has < this.buyInfo.itemCost.v2) {
                if (this.buyInfo.itemCost.v1 == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(this.buyInfo.itemCost.v2 - has);
                    }));
                } else if (this.buyInfo.itemCost.v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                }
                return;
            }
            alert.showBuyTimesPanel({
                nowTime: this._model.buyTimes, maxTime: this._model.buyTimesMax, coinNum: this.buyInfo.itemCost.v2, coinId: this.buyInfo.itemCost.v1, buyNum: reward.v2, buyId: reward.v1, sureHanlder: Laya.Handler.create(this, () => {
                    this._control.commonBuy(Laya.Handler.create(this, (msg: pb.sc_common_buy) => {
                        alert.showFWords("满意度提升" + reward.v2);
                        clientCore.DialogMgr.ins.close(this);
                        this.event("ON_UPDATE_BUY", msg);
                    }));
                }), noIcon: `确认消耗${this.buyInfo.itemCost.v2}${clientCore.ItemsInfo.getItemName(this.buyInfo.itemCost.v1)}购买${reward.v2}${clientCore.ItemsInfo.getItemName(reward.v1)}吗？`
            });
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
            this.event("ON_CLOSE_BUY");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = this._control = null;
            this.buyInfo = null;
            super.destroy();
        }
    }
}