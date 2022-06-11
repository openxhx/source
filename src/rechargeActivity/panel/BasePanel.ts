namespace rechargeActivity {
    export class BasePanel extends Laya.Sprite {
        public needLoading: boolean = false;
        protected oriDataArr: xls.rechargeActivity[];
        protected dataArr: { data: xls.rechargeActivity, flag: boolean }[];
        protected rechargeInfo: pb.sc_get_activity_gift_bag_info;
        protected _mainUI: core.BaseModule;
        protected bitData: number;
        public type: number = 0;
        private _endTime: number;

        constructor() {
            super();
        }

        init(data: xls.rechargeActivity[], info: pb.sc_get_activity_gift_bag_info) {
            this.oriDataArr = data.slice();
            this.rechargeInfo = info;
            this._endTime = util.TimeUtil.formatTimeStrToSec(data[0].closeDate)
            this.refreshGetBitData();
        }

        refreshGetBitData() {

        }

        waitLoading() {

        }

        putRewardGetBack() {
            let getArr: { data: xls.rechargeActivity, flag: boolean }[] = [];
            let notGetArr: { data: xls.rechargeActivity, flag: boolean }[] = [];
            for (const o of this.oriDataArr) {
                let getFlg = util.getBit(this.bitData, o.packageID);
                if (getFlg)
                    getArr.push({data: o, flag: true});
                else
                    notGetArr.push({data: o, flag: false});
            }
            this.dataArr = [...notGetArr, ...getArr];
        }

        initPanel() {
            if (this._mainUI.hasOwnProperty("rewardList")) {
                this.putRewardGetBack();
                this._mainUI["rewardList"].vScrollBarSkin = null;
                this._mainUI["rewardList"].itemRender = RechargeRender;
                this._mainUI["rewardList"].renderHandler = new Laya.Handler(this, this.itemRender);
                this._mainUI["rewardList"].mouseHandler = new Laya.Handler(this, this.itemClick);
                this._mainUI["rewardList"].array = this.dataArr;
                this.onScroll();
            }
        }

        protected itemRender(item: RechargeRender, index: number) {
        }

        private onScroll() {
            let scroll = this._mainUI["rewardList"].scrollBar;
            this._mainUI["imgScroll"].y = scroll.value / scroll.max * (this._mainUI['boxScroll'].height - this._mainUI['imgScroll'].height);
        }

        private itemClick(e: Laya.Event, index: number) {
            if (e.type != Laya.Event.CLICK) return;

            switch (e.target.name) {
                case "btnGetReward":
                    this.getReward(this.type, this.dataArr[index].data.packageID);
                    break;
                case "btnCumulativeGetReward":
                    this.getReward(this.type, this.dataArr[index].data.packageID);
                    break;
            }
        }

        protected async getReward(type: number, giftID: number): Promise<boolean> {
            return new Promise<boolean>(resolve => {
                net.sendAndWait(new pb.cs_get_activity_gift_pay_reward({
                    type: type,
                    giftId: giftID
                })).then((data: pb.sc_get_activity_gift_pay_reward) => {
                    if (type == 2) {
                        alert.showReward(clientCore.GoodsInfo.createArray(data.item), "恭喜获得", {
                            callBack: {
                                caller: this, funArr: [() => {
                                    if (clientCore.SuitsInfo.getSuitInfo(2110468).allGet) {
                                        // clientCore.ModuleManager.open("suitComplete.SuitCompleteModule", 2110468);
                                        this.showContinueRechargeFinishedPanel();
                                    }
                                }]
                            }
                        });
                    } else {
                        alert.showReward(clientCore.GoodsInfo.createArray(data.item), "恭喜获得");
                    }
                    EventManager.event("RECHARGE_ACTIVITY_GET_REWARD");
                    util.RedPoint.reqRedPointRefresh(5301 + type);
                    resolve(true);
                }).catch(e => {
                    resolve(false);
                });
            });
        }

        /**
         * 显示套装达成面板
         */
        private showContinueRechargeFinishedPanel(): void {
            let panel: ContinueRechargeFinishedPanel = new ContinueRechargeFinishedPanel();
            clientCore.DialogMgr.ins.open(panel);
            clientCore.Logger.sendLog('2021年8月20日活动', '【付费】蒸汽迷梦连充', '打开蒸汽迷梦面板');
        }

        refresh() {
            if (this._mainUI.hasOwnProperty("rewardList")) {
                this.refreshGetBitData();
                this.putRewardGetBack();
                let startIndex = this._mainUI["rewardList"].startIndex;
                this._mainUI["rewardList"].array = this.dataArr;
                this._mainUI["rewardList"].startIndex = startIndex;
            }
        }

        refreshTime() {
            let serverTime = clientCore.ServerManager.curServerTime;
            let disTime = this._endTime - serverTime;
            if (disTime < 0) {
                disTime = 0;
            }
            let d = Math.floor(disTime / 86400);
            disTime = disTime % 86400;
            let h = Math.floor(disTime / 3600);
            disTime = disTime % 3600;
            let m = Math.floor(disTime / 60);

            if (this._mainUI['txtDay']) {
                this._mainUI["txtDay"].text = d.toString();
                this._mainUI["txtHour"].text = h.toString();
                this._mainUI["txtMinute"].text = m.toString();
            }
        }

        hide() {
            this.removeSelf();
        }

        show() {

        }

        addEventListenters() {
            if (this._mainUI.hasOwnProperty("rewardList")) {
                BC.addEvent(this, this._mainUI["rewardList"].scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            }
        }

        removeEventListeners() {

        }

        destroy() {
            this.removeEventListeners();
        }
    }
}