namespace defendFarm {
    export class BuyPanel extends ui.defendFarm.panel.BuyPanelUI {
        public readonly EVENT_BUY: string = "buy";  //成功购买
        public readonly EVENT_SHOWCOINBOX: string = "showCoinBox";//刷新货币列表

        private _sign: number;

        private _model: DefendFarmModel;
        private _control: DefendFarmControl;
        private _cls: xls.commonBuy;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this._sign) as DefendFarmModel;
            this._control = clientCore.CManager.getControl(this._sign) as DefendFarmControl;
            this._cls = this._model.getBuyInfo()[this._model.buyTimes];

            this.labCost.text = this._cls.itemCost.v2.toString();
            let reward = clientCore.LocalInfo.sex == 1 ? this._cls.femaleAward[0].v2 : this._cls.maleAward[0].v2;
            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(this._cls.itemCost.v1);
            this.imgNum.skin = "defendFarm/x" + reward + ".png";

            clientCore.UIManager.setMoneyIds([this._model.item_id2, this._cls.itemCost.v1]);
        }

        private onBuy(): void {
            let reward = clientCore.LocalInfo.sex == 1 ? this._cls.femaleAward[0] : this._cls.maleAward[0];
            let has: number = clientCore.ItemsInfo.getItemNum(this._cls.itemCost.v1);
            if (has < this._cls.itemCost.v2) {
                if (this._cls.itemCost.v1 == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(this._cls.itemCost.v2 - has);
                    }));
                } else if (this._cls.itemCost.v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                }
                return;
            }
            alert.showBuyTimesPanel({
                nowTime: this._model.buyTimes, maxTime: this._model.buyTimesMax, coinNum: this._cls.itemCost.v2, coinId: this._cls.itemCost.v1, buyNum: reward.v2, buyId: reward.v1, sureHanlder: Laya.Handler.create(this, () => {
                    this._control.commonBuy(Laya.Handler.create(this, (msg: pb.sc_common_buy) => {
                        this.event(this.EVENT_BUY);
                        this.close();
                        alert.showReward(msg.item);
                    }));
                }), noIcon: `确认消耗${this._cls.itemCost.v2}${clientCore.ItemsInfo.getItemName(this._cls.itemCost.v1)}购买${reward.v2}${clientCore.ItemsInfo.getItemName(reward.v1)}吗？`
            });
        }

        close() {
            this.event(this.EVENT_SHOWCOINBOX);
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = null;
            this._control = null;
            this._cls = null;
            super.destroy();
        }
    }
}