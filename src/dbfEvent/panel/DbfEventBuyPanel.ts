namespace dbfEvent {
    export class DbfEventBuyPanel extends ui.dbfEvent.panel.DbfEventBuyPanelUI {
        private _sign: number;

        private curLeafBuyInfo: xls.commonBuy;
        private curCoinBuyInfo: xls.commonBuy;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }

        public showInfo() {
            let model = clientCore.CManager.getModel(this._sign) as DbfEventModel;
            this.btnBuy1.disabled = model.leafBuyTimes >= model.leafBuyIds.length;
            this.btnBuy2.disabled = model.coinBuyTimes >= model.coinBuyIds.length;
            let target1 = model.leafBuyTimes >= model.leafBuyIds.length ? model.leafBuyIds.length - 1 : model.leafBuyTimes;
            let target2 = model.coinBuyTimes >= model.coinBuyIds.length ? model.coinBuyIds.length - 1 : model.coinBuyTimes;
            this.curLeafBuyInfo = xls.get(xls.commonBuy).get(model.leafBuyIds[target1]);
            this.curCoinBuyInfo = xls.get(xls.commonBuy).get(model.coinBuyIds[target2]);
            this.imgCost1.skin = clientCore.ItemsInfo.getItemIconUrl(this.curLeafBuyInfo.itemCost.v1);
            this.imgCost2.skin = clientCore.ItemsInfo.getItemIconUrl(this.curCoinBuyInfo.itemCost.v1);
            this.labCost1.value = this.curLeafBuyInfo.itemCost.v2.toString();
            this.labCost2.value = this.curCoinBuyInfo.itemCost.v2.toString();
        }

        toBuy(type: number) {
            let model = clientCore.CManager.getModel(this._sign) as DbfEventModel;
            let cls = type == 1 ? this.curLeafBuyInfo : this.curCoinBuyInfo;
            let _nowTime = type == 1 ? model.leafBuyTimes : model.coinBuyTimes;
            let _maxTime = type == 1 ? model.leafBuyIds.length : model.coinBuyIds.length;
            let reward = clientCore.LocalInfo.sex == 1 ? cls.femaleAward : cls.maleAward;
            let has: number = clientCore.ItemsInfo.getItemNum(cls.itemCost.v1);
            if (has < cls.itemCost.v2) {
                if (cls.itemCost.v1 == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(cls.itemCost.v2 - has);
                    }));
                } else if (cls.itemCost.v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.showFWords("菖蒲叶不足");
                }
                return;
            }
            let des = "确认消耗" + cls.itemCost.v2 + clientCore.ItemsInfo.getItemName(cls.itemCost.v1) + "购买";
            for (let i: number = 0; i < reward.length; i++) {
                des += reward[i].v2 + clientCore.ItemsInfo.getItemName(reward[i].v1);
                if (i < reward.length - 1) {
                    des += "、";
                }
            }
            des += "吗？"
            alert.showBuyTimesPanel({
                nowTime: _nowTime, maxTime: _maxTime, coinNum: cls.itemCost.v2, coinId: cls.itemCost.v1, buyNum: reward[0].v2, buyId: reward[0].v1, sureHanlder: Laya.Handler.create(this, () => {
                    net.sendAndWait(new pb.cs_dragon_boat_festival_buy_food_materials({ type: type - 1 })).then((msg: pb.sc_dragon_boat_festival_buy_food_materials) => {
                        model.coinBuyTimes = msg.coinBuyTimes;
                        model.leafBuyTimes = msg.leavesBuyTimes;
                        this.showInfo();
                        alert.showReward(clientCore.GoodsInfo.createArray(msg.items), null, {
                            callBack: {
                                caller: this, funArr: [() => {
                                    model.getMaxDraw();
                                    EventManager.event("BOX_BUY_BACK");
                                }]
                            }
                        });
                    })
                }), noIcon: des
            });
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.toBuy, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.toBuy, [2]);
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