namespace gameTime {
    export class GameTimeBuyPanel extends ui.gameTime.GameTimeBuyUI {
        private curCut: number = 0;
        private limit: number;
        constructor() {
            super();
            this.sideClose = true;
            this.initView();
        }

        private initView() {
            let config = xls.get(xls.eventExchange).get(2642);
            this.labCount1.text = "x" + config.femaleProperty[0].v2;
            this.labCost1.text = "" + config.cost[0].v2;
            this.curCut = this.limit = config.limit.v2;
            this.labLimit.text = "/" + this.limit;
            config = xls.get(xls.eventExchange).get(2643);
            this.labCount2.text = "x" + config.femaleProperty[0].v2;
            this.labCost2.text = "" + config.cost[0].v2;
        }

        public show(_isBuy: number) {
            if (this.curCut == this.limit) {
                this.curCut = _isBuy;
                this.labTimes.text = "" + this.curCut;
                this.btnBuy1.disabled = this.curCut == 0;
            }
            clientCore.DialogMgr.ins.open(this);
        }

        private buy(id: number) {
            let config = xls.get(xls.eventExchange).get(id);
            let cost = config.cost[0].v2;
            if (!this.checkMoney(config.cost[0].v1, cost)) return;
            alert.showSmall(`确定花费${cost}${clientCore.ItemsInfo.getItemName(config.cost[0].v1)}购买游园券?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_common_exchange({ exchangeId: id, activityId: 153 })).then((msg: pb.sc_common_exchange) => {
                            alert.showReward(msg.item);
                            if (id == 2642) {
                                this.curCut -= 1;
                                this.labTimes.text = "" + this.curCut;
                                this.btnBuy1.disabled = this.curCut == 0;
                            }
                        })
                    }]
                }
            })
        }

        /**检查余额 */
        private checkMoney(costId: number, costValue: number) {
            let has = clientCore.ItemsInfo.getItemNum(costId);
            if (has < costValue) {
                if (costId == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(costValue - has);
                    }));
                } else {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                }
                return false;
            }
            return true;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.buy, [2642]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.buy, [2643]);
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}