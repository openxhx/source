namespace rechargeCoin {
    /**
     * 充值购买代币礼包
     */
    export class RechargeCoinModule1 extends ui.rechargeCoin.RechargeCoinModule1UI {
        private eventId: number[];
        private waiting: boolean = false;
        private length: number

        constructor() {
            super();
            this.sideClose = false;
        }

        init(ids: number[]) {
            this.eventId = ids;
            this.addPreLoad(xls.load(xls.rechargeEvent));
        }

        onPreloadOver() {
            this.setData();
        }

        private async setData() {
            let timeArr: number[] = await clientCore.LimitRechargeManager.instance.getInfo();
            this.length = timeArr.length;
            for (let i: number = 2; i <= 4; i++) {
                let event: xls.rechargeEvent = xls.get(xls.rechargeEvent).get(this.eventId[i - 1]);
                let limit: xls.pair = event.limit;
                let times: number = timeArr[event.id - 1];
                this["labLimit" + i].text = `本周上限:${limit.v2 - times}/${limit.v2}`;
                this["btnBuy" + i].disabled = times >= limit.v2;
            }
            this.labLimit1.text = `本周上限:${1 - timeArr[timeArr.length - 2]}/1`;
            this.btnBuy1.disabled = timeArr[timeArr.length - 2] >= 1;
        }

        private async onClick(i: number) {
            let id = this.eventId[i - 1];
            if (i >= 2) {
                if (this.waiting) return;
                this.waiting = true;
                let event: xls.rechargeEvent = xls.get(xls.rechargeEvent).get(id);
                let key: number = id - 1;
                let value: number = await clientCore.LimitRechargeManager.instance.gettimes(key);
                net.sendAndWait(new pb.cs_common_buy_times_check({ id: event.chargeId })).then((msg: pb.sc_common_buy_times_check) => {
                    if (msg.flag) {
                        clientCore.RechargeManager.pay(event.chargeId).then((data) => {
                            alert.showReward(data.items);
                            let limit: xls.pair = event.limit;
                            this["btnBuy" + i].disabled = ++value >= event.limit.v2;
                            this["labLimit" + i].text = `本周上限:${limit.v2 - value}/${limit.v2}`;
                            clientCore.LimitRechargeManager.instance.settimes(key, value);
                            this.waiting = false;
                        }).catch(() => {
                            this.waiting = false;
                        });
                    } else {
                        alert.showFWords("购买次数已到上限");
                    }
                })
            } else {
                net.sendAndWait(new pb.cs_common_buy({ activityId: this.eventId[0] })).then((msg: pb.sc_common_buy) => {
                    alert.showReward(msg.item);
                    this.labLimit1.text = `本周上限:0/1`;
                    this.btnBuy1.disabled = true;
                    clientCore.LimitRechargeManager.instance.settimes(this.length - 2, 1);
                })
            }
        }

        addEventListeners() {
            for (let i: number = 1; i <= 4; i++) {
                BC.addEvent(this, this["btnBuy" + i], Laya.Event.CLICK, this, this.onClick, [i]);
            }
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy(){
            this.eventId = null;
            super.destroy();
        }
    }
}