namespace moneyShop {
    enum TAB {
        CHARGE,//充值
        PRIVILEGE//权益
    }
    enum VIEW_TYPE {
        NEWBIE,
        TODAY,
        MONEY,
        EVENT,
        DAWN
    }
    export enum STATE {
        /**无奖励可领取（没有购买礼包或者买了没到对应天数） */
        NO_REWARD,
        /**有奖励可领 */
        HAVE_REWARD,
        /**已领取 */
        GETED_REWARD
    }

    export const NEWBIE_CHARGE_IDS = [16, 17, 18, 19, 20];//新手礼包商品id
    export const NEED_CHECK_SEX = [19];//需要换性别的图idx
    export const IOS_TEST_IDS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];//ios需要排除的id

    /**
     * 新手礼包-灵豆充值-每日礼包三合一
     * moneyShop.MoneyShopModule
     * 传入参数
     * 0:新手礼包
     * 1:每日礼包
     * 2:灵豆礼包
     * 3:活动礼包
     */
    export class MoneyShopModule extends ui.moneyShop.MoneyShopModuleUI {
        private _tab: TAB = -1;
        private _viewType: VIEW_TYPE;
        private _vipAdsView: VipViewControl;
        private _tipsView: TipsViewControl;
        /**vip奖励领取状态 */
        private _vipRwdArr: boolean[];
        /**key=4的特殊处理 当key为4，day==1代表今日已买 */
        private _rewardStateMap: util.HashMap<{ id: number, state: STATE, day: number }>;
        private _previewPanel: DawnPrevPanel;
        private _tipsPanel: DawnTipsPanel;
        init(d: any) {
            super.init(d);
            this.addPreLoad(xls.load(xls.rechargeMoneyShop));
            this.addPreLoad(xls.load(xls.rechargeToday));
            this.addPreLoad(xls.load(xls.rechargeEvent));
            this.addPreLoad(xls.load(xls.dawnBlossoms));
            this.addPreLoad(this.checkEventRed());
            this.addPreLoad(clientCore.ModuleManager.loadatlas('moneyShop/newbie'));
            this.addPreLoad(clientCore.ModuleManager.loadatlas('moneyShop/dawn'));
            this._viewType = d != undefined && _.inRange(d, 0, 4) ? d : VIEW_TYPE.NEWBIE;
            this.listMoney.vScrollBarSkin = null;
            this.listMoney.renderHandler = new Laya.Handler(this, chargeRenderFunc);
            this.listMoney.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.listNewbie.renderHandler = new Laya.Handler(this, newbieRenderFunc);
            this.listNewbie.mouseHandler = new Laya.Handler(this, this.onListNewBieMouse);
            this.listToday.renderHandler = new Laya.Handler(this, listTodayRender);
            this.listToday.mouseHandler = new Laya.Handler(this, this.onListTodayMouse);
            this.listEvent.renderHandler = new Laya.Handler(this, listEventRenderFunc);
            this.listEvent.mouseHandler = new Laya.Handler(this, this.onListEventMouse);
            this.dawn.list.renderHandler = new Laya.Handler(this, listDawnRenderFunc);
            this.dawn.list.mouseHandler = new Laya.Handler(this, this.onListDawnMouse);
            this.addPreLoad(net.sendAndWait(new pb.cs_get_vip_level_reward_status()).then((data: pb.sc_get_vip_level_reward_status) => {
                this._vipRwdArr = _.reverse(data.status.split('').map((s) => {
                    return s == '1';
                }));
                util.print("Money Console: ", "4");
                return Promise.resolve();
            }));
            this.showMoney();
            this.checkChargeEvent();
            this.addPreLoad(this.reqTodayRwdState());
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private async checkEventRed() {
            let info = await clientCore.MedalManager.getMedal([MedalConst.ANNIVERSARY_OPEN_EVENT_BUY_1]);
            this.imgEventRed.visible = info[0].value == 0;
        }

        private checkChargeEvent() {
            let open = !clientCore.SystemOpenManager.ins.checkActOver(28);
            this.imgChargeTip.visible = open;
            if (!open) this.imgChargeEvent.visible = false;
        }

        private reqTodayRwdState() {
            return net.sendAndWait(new pb.cs_get_pay_back_reward_status()).then((data: pb.sc_get_pay_back_reward_status) => {
                this._rewardStateMap = new util.HashMap();
                for (let i = 1; i <= 5; i++) {
                    let haveRwd = util.getBit(data.status, i);
                    let getRwd = util.getBit(data.flag, i);
                    if (haveRwd == 1)
                        this._rewardStateMap.add(i, { id: i, state: STATE.HAVE_REWARD, day: 0 });
                    else if (getRwd == 1)
                        this._rewardStateMap.add(i, { id: i, state: STATE.GETED_REWARD, day: 0 });
                    else
                        this._rewardStateMap.add(i, { id: i, state: STATE.NO_REWARD, day: 0 });
                }
                this._rewardStateMap.get(2).day = data.floorDay1;
                this._rewardStateMap.get(3).day = data.floorDay2;
                this._rewardStateMap.get(4).day = data.floorDay3;
                this._rewardStateMap.get(5).day = data.floorDay4;
                // console.table(this._rewardStateMap.getValues())
                util.print("Money Console: ", "5");
                return Promise.resolve();
            })
        }

        onPreloadOver() {
            this.onCheckDawnLimitInfo(true)
            this._vipAdsView = new VipViewControl(this.viewAds, this._vipRwdArr);
            this._tipsView = new TipsViewControl(this.tips);
            let arr = xls.get(xls.rechargeMoneyShop).getValues();
            if (!clientCore.GlobalConfig.isIosTest)
                arr = _.filter(arr, (o) => { return o.showRule == 1; });
            this.listMoney.dataSource = arr;
            this.listNewbie.dataSource = NEWBIE_CHARGE_IDS;
            this.listToday.dataSource = _.filter(xls.get(xls.rechargeToday).getValues(), (element) => {
                let data: { id: number, state: STATE, day: number } = this._rewardStateMap.get(element.id);
                let status: number = this._tipsView.checkTodayRecharge(element.id);
                return status == 0 || (status == 1 && data.state == STATE.HAVE_REWARD);
            });
            this.listEvent.dataSource = _.filter(xls.get(xls.rechargeEvent).getValues(), (o) => { return o.shopShow == 1 });
            this.showVipInfo();
            this.showListByType();
            this._data = parseInt(this._data)
            this.showTab(this._data == 999 ? TAB.PRIVILEGE : TAB.CHARGE);
            if (_.inRange(this._data, VIEW_TYPE.NEWBIE, VIEW_TYPE.DAWN + 1)) {
                this.onChangeViewType(this._data)
            }
            clientCore.Logger.sendLog('付费系统', '直接充值', '打开充值灵豆界面')
        }

        private showTab(tab: TAB) {
            if (this._tab != tab) {
                this._tab = tab;
                this.listMoney.visible = this.listNewbie.visible = this.listToday.visible = tab == TAB.CHARGE;
                // this.imgNotice.visible = tab == TAB.CHARGE;
                this.imgShower.visible = tab == TAB.CHARGE;
                this.viewAds.visible = tab == TAB.PRIVILEGE;
                this.boxTab.visible = tab == TAB.CHARGE;
                // this.boxDawn.visible = tab == TAB.CHARGE;
                this.imgTab.skin = `moneyShop/tab${this._tab == TAB.PRIVILEGE ? 1 : 2}.png`
                this.imgRed.visible = tab == TAB.CHARGE;
                // this.dawn.visible = tab == TAB.CHARGE;
                if (tab == TAB.CHARGE)
                    this.showListByType();
                if (this._tab == TAB.PRIVILEGE) {
                    this._vipAdsView.changePage(0);
                    clientCore.Logger.sendLog('付费系统', 'VIP', '查看VIP权益界面')
                }
            }
        }

        private showVipInfo() {
            let vipInfo = clientCore.LocalInfo.parseVipInfoByExp(clientCore.LocalInfo.srvUserInfo.vipExp);
            this.txtVip.value = vipInfo.lv.toString();
            let isFull = vipInfo.currExp >= (vipInfo.nextLvNeed + vipInfo.currExp);
            let nextLv = _.clamp(vipInfo.lv + 1, 0, _.last(xls.get(xls.vipLevel).getValues()).level);
            if (isFull) {
                this.txtProgress.text = '经验值已满';
                this.boxFull.visible = false;
            }
            else {
                this.txtProgress.text = vipInfo.currExp + '/' + (vipInfo.nextLvNeed + vipInfo.currExp);
                this.boxFull.visible = true;
                this.txtNextNeed.innerHTML = this.getStr('再充值', 'white') + this.getStr(vipInfo.nextLvNeed.toString(), 'yellow') + this.getStr('元', 'white');
                this.txtNextLv.innerHTML = this.getStr('可升至', 'white') + this.getStr(`VIP${nextLv}`, 'yellow');
            }
            this.vipNext.value = nextLv.toString();
            this.vipNow.value = vipInfo.lv.toString();
            this.imgMask.y = this.imgProgress.height * (1 - vipInfo.expPercent);
            this.imgBar.y = this.imgProgress.bottom + vipInfo.expPercent * this.imgProgress.height;
        }

        private getStr(str: string, type: 'white' | 'yellow') {
            if (type == 'white') {
                return `<span style="color:#263c59;font-family:汉仪中圆简;stroke:3;strokeColor:#ffffff;fontSize:22;lineJoin:round;align:center">${str} </span>`
            }
            if (type == 'yellow') {
                return `<span style="color:#fff600;font-family:汉仪中圆简;fontSize:22;lineJoin:round;align:center">${str}</span>`
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let item: xls.rechargeMoneyShop = this.listMoney.getItem(idx);
                clientCore.RechargeManager.pay(item.chargeId).then((data) => {
                    this.listMoney.startIndex = this.listMoney.startIndex;
                    alert.showReward(clientCore.GoodsInfo.createArray(data.items.concat(data.extItms)));
                    this._vipAdsView.changePage(0);
                });
            }
        }

        private onListNewBieMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                this._tipsView.showNewbie({
                    cell: this.listNewbie.getCell(idx),
                    productId: this.listNewbie.getItem(idx) as number
                });
            }
        }

        private onListTodayMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data: xls.rechargeToday = this.listToday.array[idx];
                this._tipsView.showToday(this._rewardStateMap.get(data.id), this.listToday.getCell(idx));
            }
        }

        private onListEventMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data: xls.rechargeEvent = this.listEvent.array[idx];
                this._tipsView.showEvent({
                    cell: this.listEvent.getCell(idx),
                    cfg: data
                });
            }
        }

        private onListDawnMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && !this._closed) {
                let data = this.dawn.list.getItem(idx) as pb.IPickUpFlowerSuit;
                let cell = this.dawn.list.getCell(idx);
                if (!cell['imgGet'].visible)
                    MoneyShopModel.buyLimitSuit(data.idx);
            }
        }

        private changeTab() {
            this.showTab(1 - this._tab);
        }

        private onChangeViewType(t: VIEW_TYPE) {
            if (this._viewType != t) {
                this._viewType = t;
                this.showListByType();
            }
        }

        private showListByType() {
            //新手全买过了 隐藏新手礼包
            let allNewbieGiftBuy = true;
            for (const id of NEWBIE_CHARGE_IDS) {
                if (clientCore.RechargeManager.checkBuyLimitInfo(id).payFinTimes == 0) {
                    allNewbieGiftBuy = false;
                    break;
                }
            }
            if (allNewbieGiftBuy) {
                if (this._viewType == VIEW_TYPE.NEWBIE)
                    this._viewType = VIEW_TYPE.TODAY;
                this.boxNewbie.visible = false;
                this.boxEvent.y = this.boxNewbie.y;
            }
            //活动礼包全部过期了，隐藏活动礼包
            let allEventGiftOff = true;
            for (const config of xls.get(xls.rechargeEvent).getValues()) {
                if (config.shopShow == 1 && clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec(config.closeDate)) {
                    allEventGiftOff = false;
                    break;
                }
            }
            if (allEventGiftOff) {
                if (this._viewType == VIEW_TYPE.EVENT)
                    this._viewType = VIEW_TYPE.TODAY;
                this.boxEvent.visible = false;
            }
            this.listMoney.visible = this._viewType == VIEW_TYPE.MONEY;
            this.imgChargeEvent.visible = this.listMoney.visible && !clientCore.SystemOpenManager.ins.checkActOver(28);
            this.listToday.visible = this._viewType == VIEW_TYPE.TODAY;
            this.listNewbie.visible = this._viewType == VIEW_TYPE.NEWBIE;
            this.listEvent.visible = this._viewType == VIEW_TYPE.EVENT;
            // this.dawn.visible = this._viewType == VIEW_TYPE.DAWN;
            for (let i = 0; i < 5; i++) {
                this['clip_' + i].skin = this._viewType == i ? 'moneyShop/选中效果.png' : 'moneyShop/未选中效果.png';
            }
            this.imgChargeTip.x = this._viewType == 2 ? -3 : 27;
            this.mcDownTips.x = this._viewType == 1 ? -3 : 27;
            if (this._viewType == VIEW_TYPE.EVENT && this.imgEventRed.visible) {
                this.imgEventRed.visible = false;
                clientCore.MedalManager.setMedal([{ id: MedalConst.ANNIVERSARY_OPEN_EVENT_BUY_1, value: 1 }]);
            }
            if (this._viewType == VIEW_TYPE.DAWN) {
                clientCore.Logger.sendLog('2020年9月4日活动', '【付费】朝花夕拾', '打开活动页签面板')
            }
        }

        private onRefresh(needReq: boolean) {
            this.listNewbie.startIndex = this.listNewbie.startIndex;
            this.listToday.startIndex = this.listToday.startIndex;
            this.listEvent.startIndex = this.listEvent.startIndex;
            this.showListByType();
            if (needReq) {
                this.reqTodayRwdState().then(() => {
                    if (this.listToday)
                        this.listToday.startIndex = this.listToday.startIndex;
                })
            }
        }

        private showMoney() {
            this.txtMoney.text = clientCore.LocalInfo.srvUserInfo.vipExp.toString();
            this.dawn.txtStone.text = clientCore.ItemsInfo.getItemNum(9900068).toString();
            if (this._viewType == VIEW_TYPE.DAWN)
                this.dawn.list.startIndex = this.dawn.list.startIndex;
        }

        private onDawnPrev() {
            this._previewPanel = this._previewPanel || new DawnPrevPanel();
            this._previewPanel.show();
        }

        private onDawnStone() {
            clientCore.Logger.sendLog('2020年9月4日活动', '【付费】朝花夕拾', '点击朝夕石按钮')
            this._tipsPanel = this._tipsPanel || new DawnTipsPanel();
            this._tipsPanel.show();
        }

        private onDawnDaily() {
            if (this.dawn.imgGet.visible)
                return;
            if (MoneyShopModel.canReward) {
                net.sendAndWait(new pb.cs_morning_flowers_night_pick_up_get_weekly_reward()).then((data: pb.sc_morning_flowers_night_pick_up_get_weekly_reward) => {
                    alert.showReward(data.item);
                    MoneyShopModel.canReward = false;
                    this.dawn.imgGet.visible = true;
                })
            }
            else {
                if (clientCore.FlowerPetInfo.petType > 0) {
                    alert.showFWords('本周奖励已领取')
                }
                else {
                    alert.showSmall('你还不是奇妙花宝，是否前往成为奇妙花宝？', { callBack: { caller: this, funArr: [this.goPet] } })
                }
            }
        }

        private goPet() {
            clientCore.ToolTip.gotoMod(52)
        }

        private onNotify(data: pb.sc_morning_flowers_night_pick_up_refresh_notify) {
            MoneyShopModel.limitArr = _.sortBy(data.suitInfo.slice(), o => o.isSpec == 0);
            this.dawn.list.dataSource = MoneyShopModel.limitArr;
        }

        private onCheckDawnLimitInfo(force: boolean) {
            if (this._viewType == VIEW_TYPE.DAWN || force) {
                MoneyShopModel.refreshLimitInfo().then(() => {
                    if (!this._closed) {
                        this.dawn.list.dataSource = MoneyShopModel.limitArr;
                        this.dawn.imgNotOpen.visible = MoneyShopModel.limitArr.length == 0;
                        this.dawn.imgGet.visible = !MoneyShopModel.canReward;
                    }
                })
            }
        }

        private onDawnTimer() {
            if (this._viewType == VIEW_TYPE.DAWN) {
                let now = clientCore.ServerManager.curServerTime;
                let target = util.TimeUtil.floorTime(now) + 3600 * 12;
                target = now > target ? target + 3600 * 24 : target;
                this.dawn.txtTime.text = '距离下次刷新：' + util.StringUtils.getTime(Math.max(0, target - now), '{hour}:{min}:{sec}');
            }
        }

        private onClothChange() {
            this.dawn.list.startIndex = this.dawn.list.startIndex;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTab, Laya.Event.CLICK, this, this.changeTab);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.showVipInfo);
            BC.addEvent(this, this._tipsView, Laya.Event.CHANGED, this, this.onRefresh);
            BC.addEvent(this, this.dawn.btnPreview, Laya.Event.CLICK, this, this.onDawnPrev);
            BC.addEvent(this, this.dawn.btnStone, Laya.Event.CLICK, this, this.onDawnStone);
            BC.addEvent(this, this.dawn.btnDaily, Laya.Event.CLICK, this, this.onDawnDaily);
            net.listen(pb.sc_morning_flowers_night_pick_up_refresh_notify, this, this.onNotify);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.showMoney);
            EventManager.on(globalEvent.CLOTH_CHANGE, this, this.onClothChange);
            for (let i = 0; i < 5; i++) {
                BC.addEvent(this, this['clip_' + i], Laya.Event.CLICK, this, this.onChangeViewType, [i]);
            }
            Laya.timer.loop(10000, this, this.onCheckDawnLimitInfo);
            Laya.timer.loop(1000, this, this.onDawnTimer);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.showMoney);
            net.unListen(pb.sc_morning_flowers_night_pick_up_refresh_notify, this, this.onNotify);
            Laya.timer.clear(this, this.onCheckDawnLimitInfo);
            Laya.timer.clear(this, this.onDawnTimer);
        }

        destroy() {
            this._previewPanel?.destroy();
            this._previewPanel = null;
            this._tipsPanel?.destroy();
            this._tipsPanel = null;
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
            this._tipsView?.destory();
        }
    }
}