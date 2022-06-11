namespace timeAmbulatory {
    export class GiftBuyPanel extends ui.timeAmbulatory.panel.GiftBuyPanelUI {
        private _rechargeIDArr = [31, 35, 36, 37];
        private _limitInfo: xls.pair[];
        private _detailsPanel: BuyDetailsPanel;
        constructor() {
            super();
            this.init();
        }

        init() {
            this.sideClose = true;
            this._detailsPanel = new BuyDetailsPanel();
            let isSameDay = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) == clientCore.LimitRechargeManager.instance.timeAmbulatoryTime;
            if (!isSameDay || !clientCore.LimitRechargeManager.instance.timeAmbulatoryInfo) {
                this.getBuyInfo();
            }
            this.setUI();
        }

        showInfo() {
            if (!clientCore.LimitRechargeManager.instance.timeAmbulatoryInfo) return;
            for (let i: number = 0; i < this._rechargeIDArr.length; i++) {
                this["labLimit" + i].text = (this._limitInfo[i].v2 - clientCore.LimitRechargeManager.instance.timeAmbulatoryInfo[i]) + "/" + this._limitInfo[i].v2;
                this["btnBuy" + i].disabled = this._limitInfo[i].v2 <= clientCore.LimitRechargeManager.instance.timeAmbulatoryInfo[i];

            }
        }

        private setUI() {
            this._limitInfo = [];
            for (let i: number = 0; i < this._rechargeIDArr.length; i++) {
                let rechargeInfo = clientCore.RechargeManager.getShopInfo(this._rechargeIDArr[i]);
                let reward = clientCore.LocalInfo.sex == 1 ? rechargeInfo.rewardFamale : rechargeInfo.rewardMale;
                for (let j = 0; j < reward.length; j++) {
                    if (reward[j].v1 == 1511025) {
                        clientCore.GlobalConfig.setRewardUI(this["item" + i], { id: reward[j].v1, cnt: reward[j].v2, showName: false });
                        this["item" + i].num.visible = true;
                    }
                }
                this._limitInfo.push(xls.get(xls.rechargeEvent).get(i + 1).limit[0]);
                if (this._limitInfo[i].v1 == 1) {
                    this["labType" + i].text = "今日剩余："
                } else if (this._limitInfo[i].v1 == 2) {
                    this["labType" + i].text = "本周剩余："
                }
            }
        }

        /**获取购买次数 */
        private getBuyInfo() {
            net.sendAndWait(new pb.cs_time_cloister_pay_product_times()).then((msg: pb.sc_time_cloister_pay_product_times) => {
                clientCore.LimitRechargeManager.instance.timeAmbulatoryInfo = msg.times;
                clientCore.LimitRechargeManager.instance.timeAmbulatoryTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            })
        }

        /**礼包详情 */
        private showGiftDetails(idx: number) {
            if (this._limitInfo[idx].v2 <= clientCore.LimitRechargeManager.instance.timeAmbulatoryInfo[idx]) return;
            this._detailsPanel.showInfo(this._rechargeIDArr[idx]);
            clientCore.DialogMgr.ins.open(this._detailsPanel);
        }

        /**超值礼包购买 */
        private buyOrderGift(id: number) {
            if (!this._rechargeIDArr.includes(id)) return;
            let idx = this._rechargeIDArr.indexOf(id);
            clientCore.RechargeManager.pay(id).then((data) => {
                alert.showReward(data.items);
                clientCore.LimitRechargeManager.instance.timeAmbulatoryInfo[idx] += 1;
                this.showInfo();
            });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy0, Laya.Event.CLICK, this, this.showGiftDetails, [0]);
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.showGiftDetails, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.showGiftDetails, [2]);
            BC.addEvent(this, this.btnBuy3, Laya.Event.CLICK, this, this.showGiftDetails, [3]);
            BC.addEvent(this, this.item0, Laya.Event.CLICK, this, this.showGiftDetails, [0]);
            BC.addEvent(this, this.item1, Laya.Event.CLICK, this, this.showGiftDetails, [1]);
            BC.addEvent(this, this.item2, Laya.Event.CLICK, this, this.showGiftDetails, [2]);
            BC.addEvent(this, this.item3, Laya.Event.CLICK, this, this.showGiftDetails, [3]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            EventManager.on("TIMEAMBULATORY_GIFT_BUY", this, this.buyOrderGift);
        }

        private onCloseClick(e: Laya.Event) {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("TIMEAMBULATORY_GIFT_BUY", this, this.buyOrderGift);
        }

        destroy() {
            super.destroy();
        }
    }
}