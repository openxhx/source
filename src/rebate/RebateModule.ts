namespace rebate {
    enum STATE {
        /**无奖励可领取（没有购买礼包或者买了没到对应天数） */
        NO_REWARD,
        /**有奖励可领 */
        HAVE_REWARD,
        /**已领取 */
        GETED_REWARD
    }
    const SHOP_ID: number = 23;//购买的商品id

    /**
     * 返利礼包
     * rebate.RebateModule
     */
    export class RebateModule extends ui.rebate.RabateModuleUI {
        /**存放对应天数的奖励状态  key：天数（1开始，第0天的通过下面的flg判断） */
        private _rewardStateMap: util.HashMap<STATE>;
        /**是否购买了礼包 */
        private _haveBuyItemFlg: boolean;
        /**今天可以领取哪一天的奖励 1或2, 0就是本日不可再领取了 */
        private _todayCanGetRwdDay: number;
        /**明天能领取奖励的天数 */
        private _tomorrowCanGetDay: number;
        init(d: any) {
            super.init(d);
            this._rewardStateMap = new util.HashMap();
            this.addPreLoad(xls.load(xls.rechargeRebate));
            this._haveBuyItemFlg = clientCore.RechargeManager.checkBuyLimitInfo(SHOP_ID).payFinTimes > 0;
            this.addPreLoad(net.sendAndWait((new pb.cs_get_pay_back_reward_status())).then((data: pb.sc_get_pay_back_reward_status) => {
                for (let i = 1; i <= 2; i++) {
                    let haveRwd = util.getBit(data.status, i);
                    let getRwd = util.getBit(data.flag, i);
                    if (haveRwd == 1)
                        this._rewardStateMap.add(i, STATE.HAVE_REWARD);
                    else if (getRwd == 1)
                        this._rewardStateMap.add(i, STATE.GETED_REWARD);
                    else
                        this._rewardStateMap.add(i, STATE.NO_REWARD);
                }
                let arr = this._rewardStateMap.getValues();
                let idx = _.findIndex(arr, (o) => { return o == STATE.NO_REWARD });
                this._tomorrowCanGetDay = idx + 1;
                return Promise.resolve();
            }))
            this.imgSuit.skin = `unpack/rebate/${clientCore.LocalInfo.sex == 1 ? 'woman' : 'man'}.png`;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            let now = clientCore.ServerManager.curServerTime;
            let diff = Math.ceil((clientCore.SystemOpenManager.ins.getActTimeZone(7)[1] - now) / (3600 * 24));
            this.txtDay.text = diff + '天';
        }

        onPreloadOver() {
            this.list.dataSource = [0, 1, 2];
            this.refreshBtnState();
        }

        private refreshBtnState() {
            this.list.startIndex = this.list.startIndex;
            //购买按钮
            this.btnBuy.visible = !this._haveBuyItemFlg;
            //如果购买了，判断是否有可领取的
            if (this._haveBuyItemFlg) {
                let arr = this._rewardStateMap.getValues();
                let idx = _.findIndex(arr, (o) => { return o == STATE.HAVE_REWARD });
                this._todayCanGetRwdDay = idx + 1;
                this.btnGetRwd.fontSkin = idx == -1 ? 'rebate/t_tomorrow.png' : 'rebate/t_getReward.png';
            }
            else {
                this._todayCanGetRwdDay = 0;
            }
        }

        private onDetail(p: number) {
            switch (p) {
                case 0:
                    clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2100149);
                    break;
                case 1:
                    clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2100134);
                    break;
                case 2:
                    clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2300012);
                    break;
                default:
                    break;
            }
        }

        private onListRender(cell: ui.rebate.render.RebateRenderUI, idx: number) {
            let day = idx;
            let xlsInfo = xls.get(xls.rechargeRebate).get(idx + 1);
            let rwd = clientCore.LocalInfo.sex == 1 ? xlsInfo.rewardFamale : xlsInfo.rewardMale;
            cell.imgIcon.skin = 'rebate/icon_' + idx + '.png';
            cell.listRwd.dataSource = _.map(rwd, (o) => {
                return {
                    id: o.v1,
                    num: { value: o.v2 },
                    imgBg: { skin: clientCore.ItemsInfo.getItemIconBg(o.v1) },
                    ico: { skin: clientCore.ItemsInfo.getItemIconUrl(o.v1) }
                }
            });
            cell.listRwd.mouseHandler = new Laya.Handler(this, this.onShowTips);
            cell.listRwd.repeatX = rwd.length;
            if (day == 0) {
                cell.imgGet.visible = this._haveBuyItemFlg;
                cell.boxTitle.visible = !this._haveBuyItemFlg;
                cell.imgTitle.skin = 'rebate/购买即得.png';
            }
            else {
                let state = this._rewardStateMap.get(day);
                cell.imgGet.visible = state == STATE.GETED_REWARD;
                cell.boxTitle.visible = false;
                if (state == STATE.NO_REWARD) {
                    //还不能领的，要显示领取条件
                    cell.boxTitle.visible = true;
                    cell.imgTitle.skin = day == this._tomorrowCanGetDay ? 'rebate/明日可领.png' : 'rebate/第3天可领.png'
                }
            }
        }

        private onShowTips(e: Laya.Event) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.currentTarget, { id: e.currentTarget['dataSource'].id });
            }
        }

        private onGetTodayReward() {
            if (this._todayCanGetRwdDay == 0) {
                this.destroy();
            }
            else {
                net.sendAndWait(new pb.cs_get_pay_back_reward({ day: this._todayCanGetRwdDay })).then((data: pb.sc_get_pay_back_reward) => {
                    alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                    this._rewardStateMap.add(this._todayCanGetRwdDay, STATE.GETED_REWARD);
                    this.refreshBtnState();
                });
            }
        }

        private onBuy() {
            if (clientCore.RechargeManager.checkBuyLimitInfo(SHOP_ID).payFinTimes == 0)
                clientCore.RechargeManager.pay(SHOP_ID).then((data) => {
                    this._haveBuyItemFlg = true;
                    this.refreshBtnState();
                    alert.showReward(clientCore.GoodsInfo.createArray(data.items.concat(data.extItms)));
                });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGetRwd, Laya.Event.CLICK, this, this.onGetTodayReward);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['btnDetail_' + i], Laya.Event.CLICK, this, this.onDetail, [i]);
            }
        }

        removeEventListeners() {
            this.destroy();
        }

        destroy() {
            super.destroy();
            this._rewardStateMap?.clear();
        }
    }
}