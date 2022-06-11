namespace doubleNinth {
    /**
     * 重阳节茱萸小店
     * doubleNinth.StarGiftPanel
     * 2021.10.15
     */
    export class StarGiftPanel extends ui.doubleNinth.panel.StarGiftPanelUI {
        private eventId: number = 10;
        async show() {
            let event: xls.rechargeEvent = xls.get(xls.rechargeEvent).get(this.eventId);
            let key: number = this.eventId - 1;
            let value: number = await clientCore.LimitRechargeManager.instance.gettimes(key);
            let limit: xls.pair = event.limit;
            this.labSurplus.changeText(`今日剩余：${limit.v2 - value}/${limit.v2}`);
            this.btnBuy.disabled = value >= event.limit.v2;
            clientCore.DialogMgr.ins.open(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }
        private waiting: boolean = false;
        private async onClick(): Promise<void> {
            if (this.waiting) return;
            let event: xls.rechargeEvent = xls.get(xls.rechargeEvent).get(this.eventId);
            let key: number = this.eventId - 1;
            let value: number = await clientCore.LimitRechargeManager.instance.gettimes(key);
            this.waiting = true;
            net.sendAndWait(new pb.cs_common_buy_times_check({ id: event.chargeId })).then((msg: pb.sc_common_buy_times_check) => {
                if (msg.flag) {
                    clientCore.RechargeManager.pay(event.chargeId).then((data) => {
                        alert.showReward(data.items);
                        let limit: xls.pair = event.limit;
                        if (event.limit.v1 != 3) this.btnBuy.disabled = ++value >= event.limit.v2;
                        this.labSurplus.changeText(limit.v1 == 1 ? `今日剩余：${limit.v2 - value}/${limit.v2}` : ``);
                        clientCore.LimitRechargeManager.instance.settimes(key, value);
                        this.waiting = false;
                    }).catch(() => {
                        this.waiting = false;
                    });
                } else {
                    alert.showFWords("购买次数已到上限");
                }
            })
        }
    }
}