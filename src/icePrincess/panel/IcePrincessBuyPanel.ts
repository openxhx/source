namespace icePrincess {
    export class IcePrincessBuyPanel extends ui.icePrincess.panel.IcePrincessBuyPanelUI {
        private _timeInfo: pb.sc_snow_house_panel;

        show(timeInfo: pb.sc_snow_house_panel) {
            this._timeInfo = timeInfo;
            this.updateTimeInfo();
            clientCore.DialogMgr.ins.open(this);
        }

        private updateTimeInfo() {
            let total1 = xls.get(xls.eventExchange).get(2322).limit.v2;
            let total2 = xls.get(xls.eventExchange).get(2323).limit.v2;
            this.txtTime_0.text = this._timeInfo.makeTimes + '/' + total1;
            this.txtTime_1.text = this._timeInfo.beanBuyTimes + '/' + total2;
            this.btnBuy_0.disabled = this._timeInfo.makeTimes <= 0;
            this.btnBuy_1.disabled = this._timeInfo.beanBuyTimes <= 0;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onExchange(idx: number) {
            let info = _.filter(xls.get(xls.eventExchange).getValues(), o => o.type == 95)[idx];
            let have = clientCore.ItemsInfo.getItemNum(info.cost[0].v1);
            let cost = info.cost[0].v2;
            if (have < cost) {
                let type = idx == 0 ? 0 : 1;
                this.onGo(type);
                return;
            }
            if (idx == 2) {
                alert.alertQuickBuy(info.femaleProperty[0].v1, 1)
            }
            else {
                net.sendAndWait(new pb.cs_common_exchange({ activityId: 95, exchangeId: info.id })).then((data: pb.sc_common_exchange) => {
                    alert.showReward(data.item);
                    if (idx == 0)
                        this._timeInfo.makeTimes = Math.max(0, this._timeInfo.makeTimes - 1);
                    else
                        this._timeInfo.beanBuyTimes = Math.max(0, this._timeInfo.beanBuyTimes - 1);
                    this.updateTimeInfo();
                })
            }
        }

        private onGo(idx: number) {
            if (idx == 0) {
                clientCore.ModuleManager.closeAllOpenModule();
                //关闭所有弹窗
                clientCore.DialogMgr.ins.closeAllDialog();
                clientCore.ModuleManager.open('produce.ProduceModule', 400007);
            }
            else {
                clientCore.ToolTip.gotoMod(50);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnGo_0, Laya.Event.CLICK, this, this.onGo, [0]);
            BC.addEvent(this, this.btnGo_1, Laya.Event.CLICK, this, this.onGo, [1]);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['btnBuy_' + i], Laya.Event.CLICK, this, this.onExchange, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}