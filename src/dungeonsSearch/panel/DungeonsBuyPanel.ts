namespace dungeonsSearch {
    export class DungeonsBuyPanel extends ui.dungeonsSearch.panel.DungeonsBuyPanelUI {
        private _sign: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }
        public showInfo() {
            let model = clientCore.CManager.getModel(this._sign) as DungeonsSearchModel;
            let target = model.buyCnt == 4 ? 4 : model.buyCnt + 1;
            let cls: xls.commonBuy = xls.get(xls.commonBuy).get(model.giftIds[target]);
            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(cls.itemCost.v1);
            this.labCost.text = cls.itemCost.v2.toString();
            let reward = clientCore.LocalInfo.sex == 1 ? cls.femaleAward[0].v2 : cls.maleAward[0].v2;
            this.labTarget.text = reward.toString();
            this.btnBuy.disabled = model.buyCnt >= 4;
        }

        toBuy() {
            let model = clientCore.CManager.getModel(this._sign) as DungeonsSearchModel;
            let target = model.buyCnt == 4 ? 4 : model.buyCnt + 1;
            let cls: xls.commonBuy = xls.get(xls.commonBuy).get(model.giftIds[target]);
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
                nowTime: model.buyCnt, maxTime: 4, coinNum: cls.itemCost.v2, coinId: cls.itemCost.v1, buyNum: reward.v2, buyId: reward.v1, sureHanlder: Laya.Handler.create(this, () => {
                    net.sendAndWait(new pb.cs_common_buy({ activityId: 50 })).then((msg: pb.sc_common_buy) => {
                        alert.showReward(msg.item);
                        model.buyCnt++;
                        this.showInfo();
                    })
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
            super.destroy();
        }
    }
}