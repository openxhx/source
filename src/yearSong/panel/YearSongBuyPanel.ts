namespace yearSong {
    export class YearSongBuyPanel extends ui.yearSong.panel.YearSongGiftPanelUI {

        private eventId: number[] = [3, 4, 5];
        private waiting: boolean = false;
        private length:number

        constructor() {
            super();
            this.sideClose = false;
        }

        public async setData() {
            let timeArr: number[] = await clientCore.LimitRechargeManager.instance.getInfo();
            this.length = timeArr.length;
            for (let i: number = 1; i < 4; i++) {
                let event: xls.rechargeEvent = xls.get(xls.rechargeEvent).get(this.eventId[i - 1]);
                let limit: xls.pair = event.limit;
                let times: number = timeArr[event.id - 1];
                this["numTxt" + i].text = `${limit.v2 - times}/${limit.v2}`;
                this["buyBtn" + i].disabled = times >= limit.v2;
            }
            this["numTxt0"].text = `${1 - timeArr[timeArr.length - 2]}/1`;
            this["buyBtn0"].disabled = timeArr[timeArr.length - 2] >= 1;
        }

        private async onClick(i: number) {
            let id = this.eventId[i - 1];
            if (i >= 1) {
                if (this.waiting) return;
                this.waiting = true;
                let event: xls.rechargeEvent = xls.get(xls.rechargeEvent).get(id);
                let key: number = id - 1;
                let value: number = await clientCore.LimitRechargeManager.instance.gettimes(key);
                net.sendAndWait(new pb.cs_common_buy_times_check({ id: event.chargeId })).then((msg: pb.sc_common_buy_times_check) => {
                    if(msg.flag){
                        clientCore.RechargeManager.pay(event.chargeId).then((data) => {
                            alert.showReward(data.items);
                            let limit: xls.pair = event.limit;
                            this["buyBtn" + i].disabled = ++value >= event.limit.v2;
                            this["numTxt" + i].text = `${limit.v2 - value}/${limit.v2}`;
                            clientCore.LimitRechargeManager.instance.settimes(key, value);
                            this.waiting = false;
                        }).catch(() => {
                            this.waiting = false;
                        });
                    }else{
                        alert.showFWords("购买次数已到上限");
                    }
                })
            } else {
                net.sendAndWait(new pb.cs_common_buy({ activityId: 197 })).then((msg: pb.sc_common_buy) => {
                    alert.showReward(msg.item);
                    this["numTxt0"].text = `0/1`;
                    this["buyBtn0"].disabled = true;
                    clientCore.LimitRechargeManager.instance.settimes(this.length-2, 1);
                })

            }
        }

        onClose() {
            BC.removeEvent(this);
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            for (let i: number = 0; i < 4; i++) {
                BC.addEvent(this, this["buyBtn" + i], Laya.Event.CLICK, this, this.onClick, [i]);
            }
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        clear() {
            this.eventId = this.waiting = null;
        }
    }
}