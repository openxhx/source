namespace moneyShop {
    export class VipViewControl {
        private ui: ui.moneyShop.panel.VipVIewUI;
        private _currPage: number = -1;
        private _totalPage: number;
        private _rewardedArr: boolean[];//对应vip等级是否已领取奖励标记数组
        constructor(v: ui.moneyShop.panel.VipVIewUI, arr: boolean[]) {
            this.ui = v;
            this._rewardedArr = arr;
            this._currPage = clientCore.LocalInfo.vipLv;
            this._totalPage = _.last(xls.get(xls.vipLevel).getValues()).level;
            this.changePage(0);
            this.addEvent();
        }

        changePage(diff: number) {
            this._currPage = _.clamp(this._currPage + diff, 1, this._totalPage);//页数等于等级
            this.ui.txtPage.text = this._currPage + '/' + this._totalPage;
            this.ui.btnPrev.visible = this._currPage != 1;
            this.ui.btnNext.visible = this._currPage != this._totalPage;
            this.ui.imgAds.skin = 'res/vipAds/' + (clientCore.LocalInfo.sex == 1 ? 'woman' : 'man') + '/' + this._currPage + '.png';
            //领奖状态
            let canReward = clientCore.LocalInfo.vipLv >= this._currPage;
            let rewarded = this._rewardedArr[this._currPage - 1];
            this.ui.btnGetReward.disabled = rewarded || !canReward;
            let beforeHaveReward = false;
            for (let i = 0; i < this._currPage - 1; i++) {
                let needLv = i + 1;
                if (clientCore.LocalInfo.vipLv >= needLv && !this._rewardedArr[i]) {
                    beforeHaveReward = true;
                    break;
                }
            }
            let afterHaveReward = false;
            for (let i = this._currPage; i < this._totalPage; i++) {
                let needLv = i + 1;
                if (clientCore.LocalInfo.vipLv >= needLv && !this._rewardedArr[i]) {
                    afterHaveReward = true;
                    break;
                }
            }
            this.ui.imgPrevRed.visible = beforeHaveReward && this.ui.btnPrev.visible;
            this.ui.imgNextRed.visible = afterHaveReward && this.ui.btnNext.visible;
        }

        private onGetVipRwd() {
            net.sendAndWait(new pb.cs_get_vip_level_reward({ vipLevel: this._currPage })).then((data: pb.sc_get_vip_level_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewardInfo), '领取成功');
                this._rewardedArr[this._currPage - 1] = true;
                let index: number = this._currPage + 1;
                this.changePage(clientCore.LocalInfo.vipLv >= index && !this._rewardedArr[index] ? 1 : 0);
                util.RedPoint.reqRedPointRefresh(5001);
            })
        }

        private addEvent() {
            BC.addEvent(this, this.ui.btnPrev, Laya.Event.CLICK, this, this.changePage, [-1]);
            BC.addEvent(this, this.ui.btnNext, Laya.Event.CLICK, this, this.changePage, [1]);
            BC.addEvent(this, this.ui.btnGetReward, Laya.Event.CLICK, this, this.onGetVipRwd);
        }

        destory() {
            BC.removeEvent(this);
            this.ui = null;
        }
    }
}