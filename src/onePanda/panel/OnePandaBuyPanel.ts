namespace onePanda {

    export class OnePandaBuyPanel extends ui.onePanda.panel.OnePandaBuyPanelUI {
        private _timeInfo: pb.sc_cavel_dream_panel;


        show(timeInfo: pb.sc_cavel_dream_panel) {
            this._timeInfo = timeInfo;
            this.updateTimeInfo();
            clientCore.DialogMgr.ins.open(this);
        }

        private updateTimeInfo() {
            let total1 = xls.get(xls.eventExchange).get(3206).limit.v2;
            let total2 = xls.get(xls.eventExchange).get(3207).limit.v2;
            this.txtTime_0.text = this._timeInfo.makeTimes + '/' + total1;
            this.txtTime_1.text = this._timeInfo.beanBuyTimes + '/' + total2;
            this.btnBuy_0.disabled = this._timeInfo.makeTimes <= 0;
            this.btnBuy_1.disabled = this._timeInfo.beanBuyTimes <= 0;
            let id = xls.get(xls.eventExchange).get(3206).cost[0].v1;
            this.numTxt.text =  xls.get(xls.eventExchange).get(3206).cost[0].v2 + `/` + clientCore.ItemsInfo.getItemNum(id);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onExchange(idx: number) {
            let info = _.filter(xls.get(xls.eventExchange).getValues(), o => o.type == ACTIVITY_ID)[idx];
            let have = clientCore.ItemsInfo.getItemNum(info.cost[0].v1);
            let cost = info.cost[0].v2;
            if (have < cost) {
                let type = idx == 0 ? 0 : 1;
                this.onGo(type);
                return;
            }
            if (idx == 2) {
                alert.alertQuickBuy(info.femaleProperty[0].v1, 1);
            }
            else {
                if (info.cost[0].v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall(`是否花费${info.cost[0].v2}灵豆购买10个蓝玫瑰?`, {
                        callBack: {
                            caller: this, funArr: [() => {
                                this.sureExchange(info.id, idx);
                            }]
                        }
                    })
                } else {
                    this.sureExchange(info.id, idx);
                }
            }
        }

        private sureExchange(id: number, idx: number) {
            net.sendAndWait(new pb.cs_common_exchange({ activityId: ACTIVITY_ID, exchangeId: id })).then((data: pb.sc_common_exchange) => {
                alert.showReward(data.item);
                if (idx == 0)
                    this._timeInfo.makeTimes = Math.max(0, this._timeInfo.makeTimes - 1);
                else
                    this._timeInfo.beanBuyTimes = Math.max(0, this._timeInfo.beanBuyTimes - 1);
                this.updateTimeInfo();
            })
        }

        private onGo(idx: number) {
            if (idx == 0) {
                clientCore.ModuleManager.closeAllOpenModule();
                //关闭所有弹窗
                clientCore.DialogMgr.ins.closeAllDialog();
                clientCore.ModuleManager.open('produce.ProduceModule');
            }
            else {
                clientCore.ToolTip.gotoMod(50);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['btnBuy_' + i], Laya.Event.CLICK, this, this.onExchange, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}