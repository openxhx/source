namespace clientCore {
    export class LittleRechargManager {
        public static _ins: LittleRechargManager;
        private _hash: util.HashMap<LittleRechargeInfo>;
        static get instacne() {
            this._ins = this._ins || new LittleRechargManager();
            return this._ins;
        }

        constructor() {
            this._hash = new util.HashMap();
        }

        async setup() {
            const data = await net.sendAndWait(new pb.cs_get_little_pay_limit());
            for (const o of data.limits) {
                this._hash.add(o.limitID, new LittleRechargeInfo(o.limitID, o));
            }
        }

        /**获取正在倒计时的数组 */
        getRecentArr() {
            return _.sortBy(_.filter(this._hash.getValues(), (o) => {
                return o.isCounting;
            }), (o) => {
                return o.leftTime;
            });
        }

        getInfoById(id: number) {
            return this._hash.get(id);
        }

        checkCanShow(id:number){
            let info = this._hash.get(id);
            let canActive = info && info.canShow && !info.isCounting;
            return canActive;
        }

        payByiId(id: number) {
            return RechargeManager.pay(this._hash.get(id).xlsInfo.shopId).then((data) => {
                alert.showReward(GoodsInfo.createArray(data.items), '购买成功', { btnType: alert.Btn_Type.ONLY_SURE });
                this._hash.get(id).srvInfo.timeStamp = 0;
            })
        }

        /**根据id激活限时小充面板（rechargeLittle中的id） 方法内部会判断是否能打开弹窗 */
        async activeWindowById(id: number) {
            if (!GlobalConfig.isPayFunctionOpen) {
                return;
            }
            let info = this._hash.get(id);
            let canActive = info && info.canShow && !info.isCounting;
            if (canActive) {
                net.send(new pb.cs_happen_little_pay_limit({ limitID: id }));
                this._hash.get(id).srvInfo.timeStamp = ServerManager.curServerTime;
                if (!GuideMainManager.instance.isGuideAction) {
                    await ModuleManager.open('littleCharge.LittleChargeModule', id);
                    this._hash.get(id).srvInfo.happenTimes += 1;
                }
                EventManager.event(globalEvent.ACTIVE_UI_TIMER);
            }
            else if (clientCore.GlobalConfig.isInnerNet) {
                //下掉测试弹框
                return;
                if (info) {
                    if (info.canShow) {
                        if (info.isCounting) {
                            if (info.srvInfo.timeStamp > clientCore.ServerManager.curServerTime)
                                alert.showFWords(`当前时间错误：当前服务器时间:${new Date(ServerManager.curServerTime * 1000)}\n上次弹窗时间${new Date(info.srvInfo.timeStamp * 1000).toString()}`)
                            else
                                alert.showFWords(`${id}正在倒计时中, 倒数${info.leftTime}秒`)
                        }
                    }
                    else {
                        if (info.srvInfo.happenTimes > 0)
                            alert.showFWords(`${id}不满足弹框条件, 周期内已购买${info.srvInfo.happenTimes}次`)
                        else
                            alert.showFWords(`${id}不满足弹框条件, 上次弹窗时间${new Date(info.srvInfo.timeStamp * 1000).toString()}`)
                    }
                }
                else {
                    alert.showFWords('没有找到id' + id);
                }
            }
        }
    }

    export class LittleRechargeInfo {
        public srvInfo: pb.IlittlePayLimit;
        public readonly xlsInfo: xls.rechargeLimit;
        constructor(id: number, srv: pb.IlittlePayLimit) {
            this.srvInfo = srv;
            this.xlsInfo = xls.get(xls.rechargeLimit).get(id);
        }

        /**剩余时间 0为未开启或者已购买/过期 */
        get leftTime() {
            let rtn = 0;
            if (this.srvInfo.timeStamp != 0) {
                rtn = this.xlsInfo.limitTime * 60 - (ServerManager.curServerTime - this.srvInfo.timeStamp);
            }
            return rtn;
        }

        /**是否能弹出面板 */
        get canShow() {
            let maxTimes = this.xlsInfo.ejectLimit.v2;
            let nowTimes = this.srvInfo.happenTimes;
            if (nowTimes < maxTimes) {
                //满足次数限制，判断是否超出时间范围
                if (this.srvInfo.timeStamp == 0)
                    return true;
                else
                    return this.leftTime > 0;
            }
            else {
                //不满足次数限制
                return false;
            }
        }

        /**是否正在倒计时 */
        get isCounting() {
            return this.srvInfo.timeStamp > 0 && this.leftTime > 0;
        }

        get rewards() {
            let shop = RechargeManager.getShopInfo(this.xlsInfo.shopId);
            if (shop) {
                return LocalInfo.sex == 1 ? shop.rewardFamale : shop.rewardMale;
            }
            return [];
        }

        get price() {
            let shop = RechargeManager.getShopInfo(this.xlsInfo.shopId);
            if (shop) {
                return shop.cost;
            }
            return 0;
        }
    }
}