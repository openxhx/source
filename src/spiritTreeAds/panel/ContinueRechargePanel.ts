namespace spiritTreeAds {
    /**
     * spiritTreeAds.ContinueRechargePanel
     */
    export class ContinueRechargePanel extends ui.spiritTreeAds.panel.RechargePanelUI {
        private _rechargeInfo: pb.sc_get_activity_gift_bag_info;
        private _rechargeXlsArr: xls.rechargeActivity[];
        private _curDay: number;
        private _endTime: number;
        constructor() {
            super();
            this.addPreLoad(this.checkRechargeInfo());
            this.addPreLoad(xls.load(xls.godTreeCounter));
            this.addPreLoad(xls.load(xls.rechargeActivity));
        }
        async checkRechargeInfo() {
            return net.sendAndWait(new pb.cs_get_activity_gift_bag_info({})).then((data: pb.sc_get_activity_gift_bag_info) => {
                this._rechargeInfo = data;
            });
        }
        onPreloadOver() {
            this._rechargeXlsArr = [];
            let arr = xls.get(xls.rechargeActivity).getValues();
            for (let info of arr) {
                if (info.type == 2) {
                    this._rechargeXlsArr.push(info)
                }
            }
            this._endTime = util.TimeUtil.formatTimeStrToSec(this._rechargeXlsArr[0].closeDate);
            this._curDay = this._rechargeInfo.sequencePayCurDay;

            this.showReward();

            let index = this._curDay - 1;
            if (this._rechargeInfo.dailySequencePayCnt < 10) {
                index--;
            }
            if (index < 0) {
                this.imgProgress.width = 0;
            }
            else {
                index = _.clamp(index, 0, 4);
                let item: ui.spiritTreeAds.render.RechargeRewardRenderUI = this["reward_" + index];
                this.imgProgress.width = item.x + item.width / 2 - this.imgProgress.x;
            }

            this.txtRechargeNum.text = "" + this._rechargeInfo.dailySequencePayCnt;
            this.showTime();
            Laya.timer.loop(500, this, this.showTime);

        }
        showTime() {
            let disTime = this._endTime - clientCore.ServerManager.curServerTime;
            let day = Math.floor(disTime / 86400);
            let hour = Math.floor((disTime % 86400) / 3600);
            if ((day + hour > 0)) {
                this.txtTime.text = "" + (day > 0 ? day + "日" : "") + (hour > 0 ? hour + "时" : "");
            }
            else {
                this.txtTime.text = '不足1小时'
            }
        }
        private showReward() {
            for (let i = 0; i < 5; i++) {
                let item: ui.spiritTreeAds.render.RechargeRewardRenderUI = this["reward_" + i];
                item.txtNum.text = "x10";
                let day = i + 1;
                if (day < this._curDay) {
                    if (util.getBit(this._rechargeInfo.sequencePayStatus, day) == 0) {
                        item.imgGet.visible = false;
                        item.imgCanGet.visible = true;
                    }
                    else {
                        item.imgGet.visible = true;
                        item.imgCanGet.visible = false;
                    }
                }
                else if (day == this._curDay) {
                    if (this._rechargeInfo.dailySequencePayCnt >= 10) {
                        if (util.getBit(this._rechargeInfo.sequencePayStatus, day) == 0) {
                            item.imgGet.visible = false;
                            item.imgCanGet.visible = true;
                        }
                        else {
                            item.imgGet.visible = true;
                            item.imgCanGet.visible = false;
                        }
                    }
                    else {
                        item.imgGet.visible = false;
                        item.imgCanGet.visible = false;
                    }
                }
                else {
                    item.imgGet.visible = false;
                    item.imgCanGet.visible = false;
                }
            }
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            for (let i = 0; i < 5; i++) {
                BC.addEvent(this, this["reward_" + i], Laya.Event.CLICK, this, this.onRewardClick, [i + 1]);
            }
        }
        onRewardClick(day: number) {
            if (day == this._curDay) {
                if (this._rechargeInfo.dailySequencePayCnt < 10) {
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open('moneyShop.MoneyShopModule');
                }
                else {
                    if (util.getBit(this._rechargeInfo.sequencePayStatus, day) == 0) {//未领取奖励
                        this.getReward(day);
                    }
                }
            }
            else if (day < this._curDay) {
                if (util.getBit(this._rechargeInfo.sequencePayStatus, day) == 0) {//未领取奖励
                    this.getReward(day);
                }
            }
        }
        protected getReward(day: number) {
            net.sendAndWait(new pb.cs_get_activity_gift_pay_reward({ type: 2, giftId: day })).then((data: pb.sc_get_activity_gift_pay_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.item), "恭喜获得");
                this._rechargeInfo.sequencePayStatus = util.setBit(this._rechargeInfo.sequencePayStatus, day, 1);
                this.showReward();
                util.RedPoint.reqRedPointRefresh(5303);
            });
        }
        destroy() {
            Laya.timer.clear(this, this.showTime);
            BC.removeEvent(this);
            super.destroy();
        }
    }
}