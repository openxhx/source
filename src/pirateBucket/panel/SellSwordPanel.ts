namespace pirateBucket {
    export class SellSwordPanel extends ui.pirateBucket.panel.SellPanelUI {
        private goodId: number[] = [0, 2125, 2126, 2127];
        private _sign: number;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
        }

        public showGoodInfo() {
            let model = clientCore.CManager.getModel(this._sign) as PirateBucketModel;
            for (let i: number = 1; i <= 3; i++) {
                let config = xls.get(xls.eventExchange).get(this.goodId[i]);
                let reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0] : config.maleProperty[0];
                this["labCount" + i].text = "x" + reward.v2;
                this["imgCost" + i].skin = clientCore.ItemsInfo.getItemIconUrl(config.cost[0].v1);
                this["labCost" + i].text = config.cost[0].v2;
                if (config.limit.v2 > 0) {
                    let curTimes = model._buyMedalInfo[i - 1].value;
                    this["labTimes" + i].text = "今日剩余：" + (config.limit.v2 - curTimes) + "/" + config.limit.v2;
                    this.btn1.disabled
                    this["btn" + i].disabled = curTimes >= config.limit.v2;
                } else {
                    this["labTimes" + i].text = "";
                }
            }  
        }

        private buyGood(id: number) {
            let config = xls.get(xls.eventExchange).get(this.goodId[id]) as xls.eventExchange;
            let need = config.cost[0].v2;
            let has = clientCore.ItemsInfo.getItemNum(config.cost[0].v1);
            if (has < need) {
                if (config.cost[0].v1 == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(need - has);
                    }));
                    return;
                } else if (config.cost[0].v1 == clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID) {
                    alert.alertQuickBuy(clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID, need - has, true);
                    return;
                }
            }
            net.sendAndWait(new pb.cs_common_exchange({ activityId: 33, exchangeId: this.goodId[id] })).then((data: pb.sc_common_exchange) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.item),"",{callBack:{caller:this,funArr:[()=>{
                    EventManager.event("UPDATE_SWORD_ITEM");
                }]}});
                if (id < 3) {
                    let model = clientCore.CManager.getModel(this._sign) as PirateBucketModel;
                    model._buyMedalInfo[id - 1].value = model._buyMedalInfo[id - 1].value + 1;
                    clientCore.MedalManager.setMedal([{ id: model._buyMedalArr[id - 1], value: model._buyMedalInfo[id - 1].value }]);
                    this.showGoodInfo();
                }
            })
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this["btn" + i], Laya.Event.CLICK, this, this.buyGood, [i]);
            }
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}