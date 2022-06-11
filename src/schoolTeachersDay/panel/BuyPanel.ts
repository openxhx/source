namespace schoolTeachersDay {
    export class BuyPanel extends ui.schoolTeachersDay.panel.BuyPanelUI {
        private readonly ZANSHANGID: number = 9900060;

        private _onCloseFun: Function;

        private _sign: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any) {
            let model = clientCore.CManager.getModel(this._sign) as SchoolTeachersDayModel;
            let cls: xls.commonBuy = model.getBuyInfo()[model.buyTimes];
            this.labCost.text = cls.itemCost.v2.toString();
            let reward = clientCore.LocalInfo.sex == 1 ? cls.femaleAward[0].v2 : cls.maleAward[0].v2;
            this.labTar.text = '+' + reward.toString();
            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(cls.itemCost.v1);

            this._onCloseFun = data.onCloseFun;
        }

        toBuy() {
            let model = clientCore.CManager.getModel(this._sign) as SchoolTeachersDayModel;
            let cls: xls.commonBuy = model.getBuyInfo()[model.buyTimes];
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
                nowTime: model.buyTimes, maxTime: model.buyTimesMax, coinNum: cls.itemCost.v2, coinId: cls.itemCost.v1, buyNum: reward.v2, buyId: reward.v1, sureHanlder: Laya.Handler.create(this, () => {
                    let control = clientCore.CManager.getControl(this._sign) as SchoolTeachersDayControl;
                    control.commonBuy(Laya.Handler.create(this, (msg: pb.sc_common_buy) => {
                        model.buyTimes++;
                        model.updateBuyTimes();
                        this._onCloseFun({ rewardItems: msg.item });
                        clientCore.DialogMgr.ins.close(this);
                    }));
                }), noIcon: `确认消耗${cls.itemCost.v2}${clientCore.ItemsInfo.getItemName(cls.itemCost.v1)}购买${reward.v2}${clientCore.ItemsInfo.getItemName(reward.v1)}吗？`
            });
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.toBuy);
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