namespace clientAppBean {
    export class LoginChargeAlertBean extends BaseLoginAlertBean {
        /**当前是否在累计充值活动时间内*/
        private _timeFlg: boolean = false;
        /**累充金额 */
        private _accumulatePayCnt: number;
        /**vip经验值（总充值金额）缓存，主要为了在充值通知中计算插值，来获取本次充值增加的累计充值金额 */
        private _vipExp: number;
        async start() {
            if (clientCore.GlobalConfig.isIosTest)
                return Promise.resolve();
            await xls.load(xls.ads);
            await xls.load(xls.rechargeActivity);
            await net.sendAndWait(new pb.cs_get_activity_gift_bag_info({})).then((data: pb.sc_get_activity_gift_bag_info) => {
                this._accumulatePayCnt = data.accumulatePayCnt;
            });
            this.checkTimeFlg();
            this._vipExp = clientCore.LocalInfo.srvUserInfo.vipExp;
            this.showAdsBtn();
            EventManager.on(globalEvent.USER_VIP_EXP_CHANGE, this, this.onChargeMoney);
            window['testAds'] = this.test;
            this.openNext();
        }

        private checkTimeFlg() {
            let info = _.find(xls.get(xls.rechargeActivity).getValues(), (o) => { return o.type == 4 });
            if (info) {
                let st = util.TimeUtil.formatTimeStrToSec(info.openDate);
                let et = util.TimeUtil.formatTimeStrToSec(info.closeDate);
                let serverTime = clientCore.ServerManager.curServerTime;
                this._timeFlg = serverTime >= st && serverTime <= et;
            }
        }

        private async alertAdsModule() {
            let xlsInfo = this.getNextAdsInfo();
            this.showAdsBtn();
            if (xlsInfo) {
                while (clientCore.ModuleManager.opening)
                    await util.TimeUtil.awaitTime(200);
                let isReward: boolean;//如果没有领取过首充奖励，永远弹出1
                await net.sendAndWait(new pb.cs_get_first_recharge_gift_info()).then((msg: pb.sc_get_first_recharge_gift_info) => { //获取信息
                    isReward = msg.rewardStatus == 1;
                })
                let mod = await clientCore.ModuleManager.open('loginAds.LoginAdsModule', isReward ? xlsInfo.id : 1);
                if (mod) {
                    mod.once(Laya.Event.CLOSE, this, this.openNext);
                }
            }
            else{
                this.openNext();
            }
        }

        private showAdsBtn() {
            let xlsInfo = this.getNextAdsInfo();
            //有就显示按钮，没有就隐藏（传空字符串 HomeMainUI那边会处理）
            if (xlsInfo) {
                let str = xlsInfo.sex ? `${xlsInfo.id}_${clientCore.LocalInfo.sex}` : xlsInfo.id;
                EventManager.event(globalEvent.SHOW_ADS_BTN, `res/vipAds/alertAds/btn_${str}.png`);
            }
            else {
                EventManager.event(globalEvent.SHOW_ADS_BTN, '');
            }
        }

        /**根据当前时间（累充活动限时）和充值的数量，获取下一个广告的信息 可能是undefined */
        private getNextAdsInfo() {
            let xlsInfo: xls.ads;
            let all = xls.get(xls.ads).getValues();
            let cumulaXlsInfoArr = _.filter(all, o => o.type == 1)//累充的数据
            let normalXlsInfoArr = _.filter(all, o => o.type != 1);//其他数据
            if (this._timeFlg && clientCore.LocalInfo.srvUserInfo.vipExp >= 98) {
                for (const o of cumulaXlsInfoArr) {
                    if (this._accumulatePayCnt < o.cost) {
                        xlsInfo = o;
                        break;
                    }
                }
            }
            //没有找到累充数据，再找普通数据
            if (!xlsInfo)
                for (const o of normalXlsInfoArr) {
                    if (clientCore.LocalInfo.srvUserInfo.vipExp < o.cost) {
                        xlsInfo = o;
                        break;
                    }
                }
            return xlsInfo;
        }

        private onChargeMoney() {
            //如果在累充活动时间中，要计算下累充金额
            if (this._timeFlg) {
                let chargeNum = clientCore.LocalInfo.srvUserInfo.vipExp - this._vipExp;
                this._accumulatePayCnt += chargeNum;
                this._vipExp = clientCore.LocalInfo.srvUserInfo.vipExp
            }
            if (clientCore.LocalInfo.getLvInfo().lv >= 8 && !clientCore.GuideMainManager.instance.isGuideAction) {
                this.showAdsBtn();
            }
        }

        /**测试广告弹窗 */
        private test(cumula: number, total: number) {
            if (total < cumula) {
                console.log('总充值金额小于累充金额!');
                return;
            }
            let xlsInfo: xls.ads;
            let all = xls.get(xls.ads).getValues();
            let cumulaXlsInfoArr = _.filter(all, o => o.type == 1)//累充的数据
            let normalXlsInfoArr = _.filter(all, o => o.type != 1);//其他数据
            //先找累充数据
            if (total >= 98)
                for (const o of cumulaXlsInfoArr) {
                    if (cumula < o.cost) {
                        xlsInfo = o;
                        break;
                    }
                }
            //没有再找普通数据
            if (!xlsInfo)
                for (const o of normalXlsInfoArr) {
                    if (total < o.cost) {
                        xlsInfo = o;
                        break;
                    }
                }
            //显示按钮    
            if (xlsInfo) {
                console.log('id:' + xlsInfo.id + ' ' + xlsInfo.description);
            }
        }
    }
}