namespace orderSystem {
    export class OrderPanel extends ui.orderSystem.OrderModuleUI {

        private _taskUIList: OrderTaskRender[];
        private _orderConfig: OrderBaseDB;
        private _detailPanel: OrderDetailPanel;
        private _waitPanel: OrderWaitPanel;
        private _buyTimePanel: OrderBuyTimePanel;
        private _notEnoughPanel: OrderNotEnoughPanel;
        private _countText: laya.ui.Label;
        private _count: number;
        private _max: number;
        private _maxBuyTime: number;//每日订单可以购买总次数
        private _restBuyTime: number;//每日订单可以购买剩余次数
        private _taskDataList: OrderData[];
        private _selectIndex: number;

        private _refreshAllNums: number = 0;
        private _freeRefreshAllNums: number = 0;
        private _beinActivityId: number = 0;   //当前所处活动id

        private _orderData: pb.sc_get_user_order_info;

        constructor() {
            super();
        }

        init(d: any) {
            super.init(d);
            this._waitPanel = new OrderWaitPanel(this.waitPanel);
            this._notEnoughPanel = new OrderNotEnoughPanel();
            this._waitPanel.visible = false;
            this._detailPanel = new OrderDetailPanel(this.taskPanel);
            this._detailPanel.visible = false;
            this.enough.visible = true;
            this.havenot.visible = false;
            this._selectIndex = -1;

            this._countText = this.countText;
            this._taskUIList = [];
            this._taskDataList = [];
            for (let i: number = 0; i < 12; i++) {
                this._taskUIList[i] = new OrderTaskRender(this["task_" + i]);
            }
            this._taskDataList.length = this._taskUIList.length;
            this._orderConfig = new OrderBaseDB(xls.get(xls.orderBase));
            this.updateImgEvent();
            this.showOrderData();
            this.checkRefreshAllNums();
        }

        private updateImgEvent(): void {
            if (!clientCore.SystemOpenManager.ins.checkActOver(238)) {
                this._beinActivityId = 238;
                this.imgEvent.visible = true;
            } else {
                this.imgEvent.visible = false;
            }
        }

        public preLoadOrderData() {
            return net.sendAndWait(new pb.cs_get_user_order_info()).then((data: pb.sc_get_user_order_info) => {
                this._count = data.finishOrderCnt;
                this._max = data.OrderMaxCnt;
                this._restBuyTime = data.residueNum;
                this._maxBuyTime = data.canBuySubmitCnt;

                this._orderData = data;
            }).catch(() => { });
        }

        private showOrderData() {
            this.refreshAllData(this._orderData.order);
            this.refreshAllOrderUI(false);
            this.setSelectAndRightPanel();
        }
        public getDeliverBtn() {
            return this.taskPanel.accept;
        }
        public getRefreshAllBtn() {
            return this.refreshAll;
        }
        public getOneOrder() {
            for (let i = 0; i < this._taskUIList.length; i++) {
                if (this._taskUIList[i].ui.visible == true) {
                    if (clientCore.GlobalConfig.guideAutoPlay) {
                        return this._taskUIList[i].ui;
                    }
                    else {
                        return this._taskUIList[i].ui.imgBg;
                    }
                }
            }
            alert.showSmall("新手引导阶段没有刷出订单！");
        }

        private setSelectAndRightPanel() {
            let data = this._taskDataList[this._selectIndex];
            //如果没有选中的 随便选一个
            if (!data) {
                for (let i = 0; i < 12; i++) {
                    if (this._taskDataList[i]) {
                        this._selectIndex = i;
                        break;
                    }
                }
            }
            this.showRightPanel();
        }

        private showRightPanel() {
            this._countText.text = this._count + "/" + this._max;
            this.havenot.visible = false;
            this.taskPanel.visible = false;
            this.waitPanel.visible = false;
            this.enough.visible = false;
            this.changeSelectImg();
            if (_.compact(this._taskDataList).length == 0) {
                //一个订单都没有
                this.havenot.visible = true;
                return;
            }
            if (this._count == this._max) {
                this.enough.visible = true;
                return;
            }
            let data = this._taskDataList[this._selectIndex];
            if (data) {
                if (data.data.refreshInterval > 0) {
                    this._waitPanel.visible = true;
                    this._waitPanel.data = data;
                }
                else {
                    this._detailPanel.visible = true;
                    this._detailPanel.data = data;
                }
            }
        }


        private _firstAni: boolean = false;//第一次不需要显示3星动画
        private refreshAllData(orders: pb.IOrder[]) {
            this._taskDataList = [];
            _.map(orders, (order) => {
                this.refreshOneData(order, this._firstAni);
            });
            this._firstAni = true;
        }

        private refreshOneData(order: pb.IOrder, play3StarAni: boolean = true) {
            console.log(`刷新order ID ${order.orderId} ${order.orderPos} ${order.state}`);
            let pos: number = order.orderPos - 1;
            let config: xls.orderBase = this._orderConfig.getOrderById(order.orderId);
            this._taskDataList[pos] = new OrderData(config, order);
            if (config.orderQuality == 3 && order.refreshInterval == 0 && !this.refreshThreeStar.isPlaying && play3StarAni)
                this.refreshThreeStar.play(0, false);
        }

        private refreshAllOrderUI(needAni: boolean) {
            for (let i = 0; i < 12; i++) {
                this.refreshOneOrderUI(i, needAni);
            }
        }

        private refreshOneOrderUI(idx: number, needAni: boolean) {
            let taskUI = this._taskUIList[idx];
            let data = this._taskDataList[idx];
            taskUI.setOrderUI(data, needAni);
        }

        private changeSelectImg() {
            _.map(this._taskUIList, (v, idx) => {
                v.ui.imgSelect.visible = this._selectIndex == idx;
            })
        }

        private onRefreshOneClick() {
            net.sendAndWait(new pb.cs_refresh_user_order({ getTime: this._taskDataList[this._selectIndex].data.getTime })).then(
                (data: pb.sc_refresh_user_order) => {
                    util.RedPoint.reqRedPointRefresh(1301);
                    if (data.order) {
                        this.refreshOneData(data.order);
                    }
                    else {
                        this._taskDataList[this._selectIndex] = null;
                    }
                    this.refreshOneOrderUI(this._selectIndex, true);
                    this.setSelectAndRightPanel();
                }).catch(() => { });
        }

        private checkRefreshAllNums() {
            net.sendAndWait(new pb.cs_get_refresh_num({})).then((data: pb.sc_get_refresh_num) => {
                this._refreshAllNums = data.refreshNum;
                this._freeRefreshAllNums = data.freeRefreshCnt;
            })
        }

        private onRefreshAll(): void {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickOrderSystemRefreshAllBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            let needLeafNum = xls.get(xls.globaltest).get(1).allOrderRefreshCost + this._refreshAllNums * 5;
            if (needLeafNum > 100)
                needLeafNum = 100;
            if (this._freeRefreshAllNums > 0) {
                alert.showSmall(`本次刷新免费，剩余免费${this._freeRefreshAllNums}次`, {
                    btnType: alert.Btn_Type.ONLY_SURE,
                    callBack: {
                        funArr: [this.onRefreshAllClick],
                        caller: this
                    }
                });
            }
            else {
                alert.showSmall(`是否消耗${needLeafNum}神叶刷新全部订单？`, {
                    callBack: {
                        funArr: [function (): void {
                            let diff: number = needLeafNum - clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
                            if (diff <= 0) {
                                this.onRefreshAllClick()
                            }
                            else {
                                alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                                    alert.AlertLeafEnough.showAlert(diff);
                                }));
                                // alert.AlertLeafEnough.showAlert(diff);
                            }
                        }],
                        caller: this
                    }
                });
            }
        }

        private async onRefreshAllClick() {
            return net.sendAndWait(new pb.cs_refresh_user_all_order()).then((data: pb.sc_refresh_user_all_order) => {
                util.RedPoint.reqRedPointRefresh(1301);
                this.refreshAllData(data.order);
                if (clientCore.GuideMainManager.instance.isGuideAction) {/**新手的时候，不要动画，不然挖孔位置不对 */
                    this.refreshAllOrderUI(false);
                }
                else {
                    this.refreshAllOrderUI(true);
                }

                this.setSelectAndRightPanel();
                if (data.order.length > 0) {
                    if (this._freeRefreshAllNums <= 0)
                        this._refreshAllNums++;
                    this._freeRefreshAllNums--;
                }
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAlertShowSmallSureBtn") {
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    });
                }
            }).catch(() => { });
        }

        private onImmediate() {
            net.sendAndWait(new pb.cs_god_leaves_speed_up_refresh_time({ getTime: this._taskDataList[this._selectIndex].data.getTime })).then(
                (data: pb.sc_god_leaves_speed_up_refresh_time) => {
                    this.refreshOneData(data.order);
                    this.refreshOneOrderUI(data.order.orderPos - 1, true);
                    this.setSelectAndRightPanel();
                    util.RedPoint.reqRedPointRefresh(1301);
                }).catch(() => { });
        }

        /** 交付*/
        private onComplete() {
            if (this.checkItemEnough()) {
                net.sendAndWait(new pb.cs_submit_order({ getTime: this._taskDataList[this._selectIndex].data.getTime })).then(
                    (data: pb.sc_submit_order) => {
                        if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickOrderSystemDeliver") {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                        this.onCompleteBack(data);
                        util.RedPoint.reqRedPointRefresh(1301);
                    }).catch(() => { });
            } else {
                //打开神叶交付面板
                clientCore.DialogMgr.ins.open(this._notEnoughPanel);
                this._notEnoughPanel.data = this._taskDataList[this._selectIndex].data;
                this._notEnoughPanel.visible = true;
            }
        }

        /** 神叶交付*/
        private onUseLeafComplete() {
            net.sendAndWait(new pb.cs_god_leaves_submit_order({ getTime: this._taskDataList[this._selectIndex].data.getTime })).then(
                (data: pb.sc_god_leaves_submit_order) => {
                    this.onCompleteBack(data);
                    util.RedPoint.reqRedPointRefresh(1301);
                }).catch(() => { });
        }

        //通用交付返回处理
        private onCompleteBack(data: pb.sc_god_leaves_submit_order | pb.sc_submit_order) {
            EventManager.event(globalEvent.ORDER_FINISH);
            ////活动额外产出
            // if (this._beinActivityId == 230) {
            //     util.RedPoint.reqRedPointRefresh(29328);
            // }
            ///////////////
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl('coin'));
            if (data.item && data.item.length > 0)
                this._count++;
            let pos = _.find(this._taskDataList, (a) => {
                return a && a.data.getTime == data.oldGetTime;
            }).data.orderPos - 1;
            this.showRewardPanel(data, this._taskDataList[pos].config.publishNPC);
            this._taskDataList[pos] = null;
            _.map(data.order, (order) => {
                this.refreshOneData(order, this._firstAni);
            });
            this.refreshOneOrderUI(pos, true);
            this.refreshAllOrderUI(false);
            this.setSelectAndRightPanel();
        }

        private showRewardPanel(data: pb.sc_god_leaves_submit_order | pb.sc_submit_order, orderNpcId: number) {
            let arr: clientCore.GoodsInfo[] = [];
            arr = _.map(data.item, (o) => { return { itemID: o.id, itemNum: o.cnt } });
            arr.push({ itemID: clientCore.MoneyManager.EXP_ID, itemNum: data.rewardExp })
            if (clientCore.RoleManager.instance.getRoleById(orderNpcId)) {
                arr.push({ itemID: clientCore.MoneyManager.FAVOR_ID, itemNum: data.rewardFriendLiness });
            }
            alert.showReward(arr);
        }

        private checkItemEnough(): boolean {
            let data: pb.IOrder = this._taskDataList[this._selectIndex].data;
            for (let i: number = 0; i < data.orderItemInfo.length; i++) {
                if (!clientCore.ItemsInfo.checkItemsEnough([new clientCore.GoodsInfo(data.orderItemInfo[i].needCollectItemId, data.orderItemInfo[i].needItemTotalCnt)])) {
                    return false;
                }
            }
            return true;
        }

        private onTimeUp(data: OrderData) {
            this.refreshOneOrderUI(data.data.orderPos - 1, true);
            this.setSelectAndRightPanel();

            util.RedPoint.reqRedPointRefresh(1301);
        }

        private showItemTips(e: Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let data: pb.IOrderItemInfo = (e.target as any).itemInfo;
            }
        }

        private hideTips(e: Laya.Event) {
            this.callLater(() => {
                this.stage.off(Laya.Event.MOUSE_DOWN, this, this.hideTips);
            });
            // this._tipsPanel.visible = false;
        }

        private onTaskClick(idx: number) {
            if (this._selectIndex != idx) {
                core.SoundManager.instance.playSound(pathConfig.getSoundUrl('bubble'));
                this._selectIndex = idx;
                this.setSelectAndRightPanel();
            }
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "selectOrderSystemTask") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private onBuyTime() {
            if (!this._buyTimePanel)
                this._buyTimePanel = new OrderBuyTimePanel();
            this._buyTimePanel.setData(this._maxBuyTime, this._restBuyTime, this, this.onBuyTimeClick);
            clientCore.DialogMgr.ins.open(this._buyTimePanel);
        }

        private onBuyTimeClick(buyTime: number) {
            net.sendAndWait(new pb.cs_add_order_submit_limit_num({ addSubmitLimitNum: buyTime }))
                .then((data: pb.sc_add_order_submit_limit_num) => {
                    this._restBuyTime = data.residueNum;
                    this._max = data.OrderMaxCnt;
                    this.setSelectAndRightPanel();
                }).catch(e => { });
        }

        public addEventListeners() {
            this.refreshAll.on(Laya.Event.CLICK, this, this.onRefreshAll);
            for (let i: number = 0; i < 12; i++) {
                this._taskUIList[i].ui.on(Laya.Event.CLICK, this, this.onTaskClick, [i]);
            }
            this._detailPanel.refreshHandler = Laya.Handler.create(this, this.onRefreshOneClick, null, false);
            this._detailPanel.completeHandler = Laya.Handler.create(this, this.onComplete, null, false);
            this._detailPanel.tipHandler = Laya.Handler.create(this, this.showItemTips, null, false);
            this._waitPanel.immediateHandler = Laya.Handler.create(this, this.onImmediate, null, false);
            // this._waitPanel.timeUpHandler = Laya.Handler.create(this, this.onTimeUp, null, false);
            this._notEnoughPanel.okHandler = Laya.Handler.create(this, this.onUseLeafComplete, null, false);
            BC.addEvent(this, this.addCount, Laya.Event.CLICK, this, this.onBuyTime);
            this._detailPanel.addEventListeners();
            this._waitPanel.addEventListeners();

            BC.addEvent(this, EventManager, "ORDER_ITEM_TIME_REFRESH_OUT", this, this.onTimeUp);
        }

        public removeEventListeners() {
            BC.removeEvent(this);
            this.refreshAll.offAll();
            for (let i: number = 0; i < 12; i++) {
                this._taskUIList[i].ui.offAll();
            }
            if (this._detailPanel) {
                this._detailPanel.removeEventListeners();
                this._detailPanel.refreshHandler.recover();
                this._detailPanel.completeHandler.recover();
                this._detailPanel.tipHandler.recover();
            }
            if (this._waitPanel) {
                this._waitPanel.immediateHandler.recover();
                this._waitPanel.removeEventListeners();
                // this._waitPanel.timeUpHandler.recover();
            }
            if (this._notEnoughPanel)
                this._notEnoughPanel.okHandler.recover();
        }

        public destroy() {
            this._detailPanel.destory();
            this._notEnoughPanel.destory();
            super.destroy();
            this._waitPanel && this._waitPanel.dispose();
            this._waitPanel = null;
        }
    }
}