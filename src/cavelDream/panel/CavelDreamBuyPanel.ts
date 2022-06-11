namespace cavelDream {
    export class CavelDreamBuyPanel extends ui.cavelDream.panel.CavelDreamBuyPanelUI {
        private isInit: boolean;
        private total1: number;
        private total2: number;
        private times1: number;
        private times2: number;
        show() {
            this.updateTimeInfo();
            clientCore.DialogMgr.ins.open(this);
        }

        public initInfo(timeInfo: pb.sc_get_mermaid_of_love_info) {
            if (this.isInit) return;
            this.total1 = xls.get(xls.eventExchange).get(3179).limit.v2;
            this.total2 = xls.get(xls.eventExchange).get(3180).limit.v2;
            this.times1 = this.total1 - _.find(timeInfo.buyItems, (o) => { return o.id == 3179 }).buyCnt;
            this.times2 = this.total2 - _.find(timeInfo.buyItems, (o) => { return o.id == 3180 }).buyCnt;
            this.isInit = true;
        }

        private updateTimeInfo() {
            this.txtTime_0.text = this.times1 + '/' + this.total1;
            this.txtTime_1.text = this.times2 + '/' + this.total2;
            this.btnBuy_0.disabled = this.times1 <= 0;
            this.btnBuy_1.disabled = this.times2 <= 0;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onExchange(idx: number) {
            let info = _.filter(xls.get(xls.eventExchange).getValues(), o => o.type == 234)[idx];
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
                if (info.cost[0].v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall(`是否花费${info.cost[0].v2}灵豆购买10个牛角包?`, {
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
            net.sendAndWait(new pb.cs_common_exchange({ activityId: 234, exchangeId: id })).then((data: pb.sc_common_exchange) => {
                alert.showReward(data.item);
                if (idx == 0)
                    this.times1 = Math.max(0, this.times1 - 1);
                else
                    this.times2 = Math.max(0, this.times2 - 1);
                this.updateTimeInfo();
            })
        }

        private onGo(idx: number) {
            if (idx == 0) {
                clientCore.ModuleManager.closeAllOpenModule();
                //关闭所有弹窗
                clientCore.DialogMgr.ins.closeAllDialog();
                //700004
                clientCore.ModuleManager.open('produce.ProduceModule');
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