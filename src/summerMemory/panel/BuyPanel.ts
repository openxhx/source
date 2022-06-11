namespace summerMemory {
    export class BuyPanel extends ui.summerMemory.panel.BuyPanelUI {
        private _sign: number;
        constructor() {
            super();
            this.sideClose = true;
        }

        public setInfo(sign: number) {
            this._sign = sign;
            let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
            if (model._curBuyIndex >= model._buyIdArr.length) {
                // alert.showSmall("摩卡今天已经喝饱了~");
                this.close();
                return;
            }
            let cls: xls.commonBuy = xls.get(xls.commonBuy).get(model._buyIdArr[model._curBuyIndex]);
            this.imgCostIcon.skin = clientCore.ItemsInfo.getItemIconUrl(cls.itemCost.v1);
            this.labCost.text = cls.itemCost.v2.toString();
            let reward = clientCore.LocalInfo.sex == 1 ? cls.femaleAward[0].v2 : cls.maleAward[0].v2;
            this.labGetCount.text = "x" + reward;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnChallenge, Laya.Event.CLICK, this, this.toBuy);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
        }

        toBuy() {
            let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
            if (model._curBuyIndex >= model._buyIdArr.length) {
                // alert.showSmall("摩卡今天已经喝饱了~");
                this.close();
                return;
            }
            let cls: xls.commonBuy = xls.get(xls.commonBuy).get(model._buyIdArr[model._curBuyIndex]);
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
            alert.showSmall(`是否花费${cls.itemCost.v2}${clientCore.ItemsInfo.getItemName(cls.itemCost.v1)}兑换？`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        net.sendAndWait(new pb.cs_common_buy({ activityId: 150 })).then((msg: pb.sc_common_buy) => {
                            alert.showReward(clientCore.GoodsInfo.createArray(msg.item), null, {
                                callBack: {
                                    caller: this, funArr: [() => {
                                        let model = clientCore.CManager.getModel(this._sign) as SummerMemoryModel;
                                        model._curBuyIndex++;
                                        this.close();
                                    }]
                                }
                            });
                            EventManager.event("MOKA_COIN_CHANGE");
                        })
                    }]
                }
            })

        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }

    }
}