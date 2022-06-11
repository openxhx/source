
namespace clientCore {
    /**
     * 充值相关
     */

    interface IBuyTimes {
        /**支付成功次数 */
        payOkTimes: number
        /**到账成功次数 */
        payFinTimes: number
        /**上次购买时间(到账时间) */
        lastTime: number
    }
    export class RechargeManager {
        private static _resolveCall: Function;//支付到账调用
        private static _rejectCall: Function;//支付取消/失败调用
        private static _buyTimesHash: util.HashMap<IBuyTimes>;

        private static _waiting: boolean;
        static async setup(): Promise<void> {
            //到账通知
            net.listen(pb.sc_pay_finish_notify, this, this.onPayNotify);
            EventManager.on(globalEvent.PAY_OK, this, this.onPayOk);
            return this.getPayOrderInfo();
        }

        /**查询某个商品的支付信息
         * @return xlsInfo 商品表信息
         * @return payOkTimes 支付成功次数
         * @return payFinTimes 到账成功次数
         * @return lastTime 上次购买时间
         */
        static checkBuyLimitInfo(id: number) {
            let xlsInfo = Laya.Browser.onIOS ? xls.get(xls.rechargeShopOffical).get(id) : xls.get(xls.rechargeShopChannel).get(id);
            let payTimesInfo = this._buyTimesHash.get(id);
            return {
                xlsInfo: xlsInfo,
                /**支付成功次数 */
                payOkTimes: payTimesInfo ? payTimesInfo.payOkTimes : 0,
                /**支付到账次数 */
                payFinTimes: payTimesInfo ? payTimesInfo.payFinTimes : 0,
                /**上次购买时间 */
                lastTime: payTimesInfo ? payTimesInfo.lastTime : 0
            }
        }

        /**打印所有商品支付信息 */
        static testAllBuyLimitInfo() {
            console.table(this._buyTimesHash.getValues());
        }

        /**获取玩家所有支付订单信息 */
        private static getPayOrderInfo() {
            this._buyTimesHash = new util.HashMap();
            return net.sendAndWait(new pb.cs_get_user_product_info()).then((data: pb.sc_get_user_product_info) => {
                for (const o of data.infos) {
                    this._buyTimesHash.add(o.productID, { payOkTimes: Math.max(o.payCount, o.finishCount), payFinTimes: o.finishCount, lastTime: o.payTimestamp });
                }
            })
        }

        /**获取商品信息 */
        static getShopInfo(id: number | string) {
            return channel.ChannelControl.ins.isOfficial ? xls.get(xls.rechargeShopOffical).get(id) : xls.get(xls.rechargeShopChannel).get(id);
        }

        /**获取所有商品信息 */
        static getAllShopInfo() {
            return channel.ChannelControl.ins.isOfficial ? xls.get(xls.rechargeShopOffical) : xls.get(xls.rechargeShopChannel);
        }

        /**开始支付流程
         * @description 
         * 开始支付会打开转圈loading，支付失败/到账后才会关闭loading
         * @returns 本函数返回到账后的数据包,如果支付取消或失败，触发reject,需要在catch中处理，参数globalEvent.PAY_CANCLE/globalEvent.PAY_FAIL
         * 
         */
        static pay(id: number) {
            if (this._waiting) return new Promise<pb.Isc_pay_finish_notify>((ok, reject) => { });
            this._waiting = true;
            return new Promise<pb.Isc_pay_finish_notify>((ok, reject) => {
                //检查未成年人是否可以充值
                let xlsData: xls.rechargeShopChannel | xls.rechargeShopOffical = channel.ChannelControl.ins.isOfficial ? xls.get(xls.rechargeShopOffical).get(id) : xls.get(xls.rechargeShopChannel).get(id);
                if (xlsData && RealManager.ins.checkRecharge(xlsData.cost)) {
                    this._resolveCall = ok;
                    this._rejectCall = reject;
                    EventManager.once(globalEvent.PAY_CANCLE, this, this.onPayFail, [globalEvent.PAY_CANCLE]);
                    EventManager.once(globalEvent.PAY_FAIL, this, this.onPayFail, [globalEvent.PAY_FAIL]);
                    this.sendPayData(id);
                }
            })
        }

        /**开始正式支付（内网走测试协议，外网走sdk） */
        private static sendPayData(id: number) {
            // LoadingManager.showSmall('正在支付。。。');
            if (channel.ChannelControl.ins.isInterior) { //是内部么?
                //内网 支付成功需要手动调用
                this.onPayOk(id);
                let testChannelId = window['testChannelId'] ?? 999;
                net.send(new pb.cs_online_test_pay({ prodcutID: id, channelID: testChannelId }))
            } else {
                let xlsData: xls.rechargeShopChannel | xls.rechargeShopOffical = Laya.Render.isConchApp && Laya.Browser.onIOS ? xls.get(xls.rechargeShopOffical).get(id) : xls.get(xls.rechargeShopChannel).get(id);
                channel.ChannelControl.ins.payToServer(xlsData);
            }
        }

        /**支付到账 */
        private static onPayNotify(data: pb.Isc_pay_finish_notify) {
            if (this._buyTimesHash.has(data.productID)) {
                this._buyTimesHash.get(data.productID).payFinTimes += 1;
                this._buyTimesHash.get(data.productID).lastTime = clientCore.ServerManager.curServerTime;
            }
            else {
                this._buyTimesHash.add(data.productID, { payFinTimes: 1, payOkTimes: 1, lastTime: clientCore.ServerManager.curServerTime })
            }
            if (this._buyTimesHash.get(data.productID).payOkTimes < this._buyTimesHash.get(data.productID).payFinTimes) {
                this._buyTimesHash.get(data.productID).payOkTimes = this._buyTimesHash.get(data.productID).payFinTimes;
            }
            let xlsData: xls.rechargeShopChannel | xls.rechargeShopOffical = channel.ChannelControl.ins.isOfficial ? xls.get(xls.rechargeShopOffical).get(data.productID) : xls.get(xls.rechargeShopChannel).get(data.productID);
            RealManager.ins.rechargeCnt += xlsData.cost;
            LoadingManager.hideSmall(true);
            //如果有回调，在回调中打开奖励面板
            console.log(`[IAP] JS 到账通知 ` + data.productID)
            if (this._resolveCall) {
                this._resolveCall.call(this, data);
            }
            else {
                //没有回调，直接弹出奖励（主要是ios补单会出现这种情况）
                console.log(`[IAP] JS 补单通知 ` + data.productID)
                let info = RechargeManager.getShopInfo(data.productID);
                if (info) {
                    alert.showSmall(`${info.name.replace('（小花仙手游）', '')}\n已到账，请注意查收！`, { btnType: alert.Btn_Type.ONLY_SURE });
                }
            }
        }

        /**支付成功 */
        private static onPayOk(id: number) {
            this._waiting = false;
            console.log(`[IAP] JS 支付成功 productId:${id}`)
            // net.send(new pb.cs_add_product_pay_times({ productID: id }));
            if (this._buyTimesHash.has(id)) {
                this._buyTimesHash.get(id).payOkTimes += 1;
            }
            else {
                this._buyTimesHash.add(id, { payFinTimes: 0, payOkTimes: 1, lastTime: 0 })
            }
        }

        /**支付失败 */
        private static onPayFail(reason: string) {
            this._waiting = false;
            if (this._rejectCall) {
                this._rejectCall.call(this, reason);
                LoadingManager.hideSmall(true);
            }
        }
    }
}