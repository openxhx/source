namespace awakeSpring {
    export class AwakeSpringBuyPanel extends ui.awakeSpring.panel.AwakeSpringBuyUI {
        private curGift: number;
        private giftIds: number[] = [0, 132, 133, 134, 135];
        constructor(curTarget: number) {
            super();
            this.sideClose = true;
            this.curGift = curTarget;
            this.showInfo();
        }

        private showInfo() {
            let target = this.curGift == 4 ? 4 : this.curGift + 1;
            let cls: xls.commonBuy = xls.get(xls.commonBuy).get(this.giftIds[target]);
            this.iconCost.skin = clientCore.ItemsInfo.getItemIconUrl(cls.itemCost.v1);
            this.labCost.text = cls.itemCost.v2.toString();
            let reward = clientCore.LocalInfo.sex == 1 ? cls.femaleAward[0].v2 : cls.maleAward[0].v2;
            this.labTarget.text = reward.toString();
            this.btnBuy.disabled = this.curGift >= 4;
        }

        public show() {
            clientCore.DialogMgr.ins.open(this, false);
        }

        private toBuy() {
            let target = this.curGift == 4 ? 4 : this.curGift + 1;
            let cls: xls.commonBuy = xls.get(xls.commonBuy).get(this.giftIds[target]);
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
                nowTime: this.curGift, maxTime: 4, coinNum: cls.itemCost.v2, coinId: cls.itemCost.v1, buyNum: reward.v2, buyId: reward.v1, sureHanlder: Laya.Handler.create(this, () => {
                    net.sendAndWait(new pb.cs_common_buy({ activityId: 121 })).then((msg: pb.sc_common_buy) => {
                        alert.showReward(msg.item);
                        this.curGift++;
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