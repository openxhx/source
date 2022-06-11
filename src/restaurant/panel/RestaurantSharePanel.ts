namespace restaurant {
    export class RestaurantSharePanel extends ui.restaurant.panel.RestaurantSharePanelUI {
        private _model: RestaurantModel;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as RestaurantModel;
        }

        public init() {
            //普通宣传
            let xlsN = xls.get(xls.diningBase).get(1).commonAdvertise.split("/");
            this.imgCost1.skin = clientCore.ItemsInfo.getItemIconUrl(Number(xlsN[0]));
            this.labCost1.text = xlsN[1];
            this.labEffect1.text = `进客间隔减${xlsN[3]}秒 持续${xlsN[2]}分钟`;
            this.labLimit1.text = `今日限制:${3 - this._model.curShareCntN}/3`;
            //高级宣传
            let xlsH = xls.get(xls.diningBase).get(1).advancedAdvertise.split("/");
            this.imgCost2.skin = clientCore.ItemsInfo.getItemIconUrl(Number(xlsH[0]));
            this.labCost2.text = xlsH[1];
            this.labEffect2.text = `进客间隔减${xlsH[3]}秒 持续${xlsH[2]}分钟`;
            this.labLimit2.text = `今日限制:${3 - this._model.curShareCntH}/3`;
        }

        show() {
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.setUI();
            clientCore.DialogMgr.ins.open(this);
        }

        private setUI() {
            this.btnShare1.visible = this.btnShare2.visible = this._model.shareEndTimeH <= clientCore.ServerManager.curServerTime && this._model.shareEndTimeN <= clientCore.ServerManager.curServerTime;
            this.imgTime1.visible = this.labTime1.visible = this._model.shareEndTimeN > clientCore.ServerManager.curServerTime;
            this.imgTime2.visible = this.labTime2.visible = this._model.shareEndTimeH > clientCore.ServerManager.curServerTime;
            if (this._model.shareEndTimeH > clientCore.ServerManager.curServerTime) {
                this.labTime2.text = "剩余:" + util.TimeUtil.formatSecToStr(this._model.shareEndTimeH - clientCore.ServerManager.curServerTime);
                Laya.timer.loop(1000, this, this.secondDo);
            } else if (this._model.shareEndTimeN > clientCore.ServerManager.curServerTime) {
                this.labTime1.text = "剩余:" + util.TimeUtil.formatSecToStr(this._model.shareEndTimeN - clientCore.ServerManager.curServerTime);
                Laya.timer.loop(1000, this, this.secondDo);
            }
        }

        private secondDo() {
            if (this._model.shareEndTimeH > clientCore.ServerManager.curServerTime) {
                this.labTime2.text = "剩余:" + util.TimeUtil.formatSecToStr(this._model.shareEndTimeH - clientCore.ServerManager.curServerTime);
            } else if (this._model.shareEndTimeN > clientCore.ServerManager.curServerTime) {
                this.labTime1.text = "剩余:" + util.TimeUtil.formatSecToStr(this._model.shareEndTimeN - clientCore.ServerManager.curServerTime);
            } else {
                Laya.timer.clear(this, this.secondDo);
                this.setUI();
            }
        }

        private share(type: number) {
            let xlsData = type == 1 ? xls.get(xls.diningBase).get(1).commonAdvertise.split("/") : xls.get(xls.diningBase).get(1).advancedAdvertise.split("/");
            let have = clientCore.ItemsInfo.getItemNum(Number(xlsData[0]));
            let cost = Number(xlsData[1]);
            if (have < cost) {
                if (Number(xlsData[0]) == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(cost - have);
                    }));
                    return;
                } else if (Number(xlsData[0]) == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                    return;
                }
            }
            let typeStr = type == 1 ? "普通宣传" : "高级宣传";
            alert.showSmall(`是否花费${cost}${clientCore.ItemsInfo.getItemName(Number(xlsData[0]))}进行${typeStr}？`, {
                callBack: {
                    funArr: [() => {
                        net.sendAndWait(new pb.cs_restaurant_propagandize({ type: type })).then((msg: pb.sc_restaurant_propagandize) => {
                            if (type == 1) {
                                this._model.curShareCntN++;
                                this._model.shareEndTimeN = msg.endTime;
                                this.labLimit1.text = `今日限制:${3 - this._model.curShareCntN}/3`;
                            } else {
                                this._model.curShareCntH++;
                                this._model.shareEndTimeH = msg.endTime;
                                this.labLimit2.text = `今日限制:${3 - this._model.curShareCntH}/3`;
                            }
                            this.setUI();
                            EventManager.event("SHARE_RESTAURANT_BACK");
                        });
                    }], caller: this
                }
            });
        }

        private closeClick() {
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnShare1, Laya.Event.CLICK, this, this.share, [1]);
            BC.addEvent(this, this.btnShare2, Laya.Event.CLICK, this, this.share, [2]);

        }

        removeEventListeners() {
            Laya.timer.clear(this, this.secondDo);
            BC.removeEvent(this);
        }

        destroyData() {
            this._model = null;
            this.destroy();
        }

        destroy() {
            super.destroy();
        }
    }
}