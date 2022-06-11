namespace channel.childs {
    /** 平台登录地址*/
    const LOGIN_CHANNEL_ADRESS: string = "http://account-co.61.com/UserIdentity/authenticate";
    /** session验证地址实际上 通过这个获取scope 取年龄*/
    const CHECK_SESSION: string = "http://account-co.61.com/UserIdentity/check";
    /**报名 */
    const BUNDLE_ID: string = 'com.taomee.huahios.';
    /**最大重复验证次数 */
    const MAX_RE_VERIFY_COUNT = 5;

    //-----------------------------审核--------------------------------------------------
    const LOGIN_SERVER_ADRESS_TEST: string = 'http://hap-xhx.61.com:61002/login/u8sLogin/';
    /** u8登录地址*/
    const LOGIN_U8_ADRESS_TEST: string = "http://hap-xhx.61.com:8080/user/getToken";
    /** 获取U8订单ID地址*/
    const GET_ORDER_ADDRESS_TEST: string = "http://hap-xhx.61.com:8080/pay/getH5OrderID";
    /** IOS支付验证地址*/
    const PAY_CHECK_ADRESS_TEST: string = "http://hap-xhx.61.com:8080/pay/ios/validate";
    const APP_KEY_TEST: string = '7219b7035b270a713c31137df3b1a897';

    //--------------------------正式--------------------------
    const LOGIN_SERVER_ADRESS: string = 'http://tm-xhx.61.com/login/u8sLogin/';
    /** u8登录地址*/
    const LOGIN_U8_ADRESS: string = "http://u8t-xhx.61.com/user/getToken";
    /** 获取U8订单ID地址*/
    const GET_ORDER_ADDRESS: string = "http://u8t-xhx.61.com/pay/getH5OrderID";
    /** IOS支付验证地址*/
    const PAY_CHECK_ADRESS: string = "http://u8t-xhx.61.com/pay/ios/validate";
    const APP_KEY: string = '8bb87fc16f46685fad22ef326d6cd433';


    /** CODE: 4002 未成年用户游戏时间超限，次日可正常登入*/
    const DAILY_TIME_OUT: number = 4002;

    interface IverifyInfo {
        transationId: string;
        recepit: string;
        onceOrderID: string;
        product_id: string;
    }

    export class IOSChannel extends BaseChannel {
        private u8Info: Object; //U8登录参数
        private checkInfo: Object; //检查实名年龄的参数
        private paramData: Object;
        private _hanlder: Laya.Handler;
        private readonly appkey: string;
        private userID: number; //用户登录认证之后u8server生成的userID，每个用户唯一

        /**apple connect获取到的商品列表 key是商品id（带包名）*/
        private iosProductInfos: util.HashMap<any>;
        /** 待验证的map key是transactionId*/
        private _verifyQueueMap: util.HashMap<string>;
        private _nowVerifyInfo: IverifyInfo;
        private _reVerifyCount: number = 0;

        constructor() {
            super();
            this.iosProductInfos = new util.HashMap();
            this._verifyQueueMap = new util.HashMap();
            this.appkey = APP_KEY;
        }

        public init(handler: Laya.Handler): void {
            this.paramData = { tad: 2, gameId: 695 };
            this.checkInfo = { tad: 2, game: 695, scope: "age" };
            this.u8Info = { appID: 1, channelID: ChannelConfig.channelId };
            this._hanlder = handler;
            EventManager.on(globalEvent.SYN_ACCOUNT, this, this.onSynAccount);
            EventManager.on(globalEvent.IOS_IAP_START, this, this.startIAP);
        }

        private startIAP() {
            //-------------下面的事件都是oc端抛过来的
            EventManager.on('ios_verify_payment', this, this.payOkAndVerifyPayment);
            EventManager.on('ios_products', this, this.onProductsInfoBack);
            EventManager.on('ios_pay_failed', this, this.onPayFailed);
            //--------------
            clientCore.NativeMgr.instance.initIAP();
            this.reqAllProductInfo();
        }

        private onSynAccount(accountId: string, pw: string) {
            this.loginChannel(accountId, pw).then(() => {
                this._hanlder.run();
            })
        }

        /** 渠道方登录*/
        private loginChannel(accountId: string, pw: string): Promise<void> {
            return new Promise((suc) => {
                let http: Laya.HttpRequest = new Laya.HttpRequest();
                http.once(Laya.Event.COMPLETE, this, (data: any) => {
                    if (data) {
                        data = this.formatHttpData(data);
                        //4003未实名  这里先通过，后面还会验证实名
                        if (data.result == 0 || data.result == 4003) {
                            this.u8Info["extension"] = { session: data.data.session, userId: data.data.uid, userName: data.data.uid };
                            this.checkInfo["accountId"] = data.data.uid;
                            this.checkInfo["session"] = data.data.session;
                            channel.ChannelConfig.channelUserID = data.data.uid;
                            Laya.LocalStorage.setItem('ios_session', data.data.session);
                            Laya.LocalStorage.setItem('ios_session_time', Date.now().toString());
                            EventManager.off(globalEvent.SYN_ACCOUNT, this, this.onSynAccount);
                            suc();
                        }
                        else {
                            let txt = data.err_desc ? data.err_desc : '登录失败，错误码' + data.result;
                            switch (data.result) {
                                case DAILY_TIME_OUT:
                                    txt = '亲爱的玩家，根据国家相关法规规定，未成年玩家只能在周五、周六、周日和法定节假日每日20:00~21:00上线。请您合理安排游戏时间，劳逸结合。';
                                    break;
                            }
                            alert.showSmall(txt, {
                                btnType: alert.Btn_Type.ONLY_SURE,
                                needClose: false,
                                clickMaskClose: false,
                                callBack: {
                                    caller: this, funArr: [() => {
                                        window.location.reload();
                                    }]
                                }
                            });
                        }
                    }
                })
                http.http.withCredentials = true;
                let postStr: string = `account=${accountId}&rememberAcc=${0}&passwd=${util.Md5Util.encrypt(pw)}&rememberPwd=${0}&game=695&tad=unknown`;
                http.send(LOGIN_CHANNEL_ADRESS, postStr, "post");
            })
        }

        protected getLoginParams(): Object {
            return this.paramData;
        }

        private formatHttpData(data: string): Object {
            let result: string[] = data.match(/\(([^)]*)\)/);
            return JSON.parse(result[1]);
        }

        private onPayFailed(reason: string) {
            console.log(`[IAP] JS FAILED: ` + reason);
            clientCore.LoadingManager.hideSmall(true);
        }

        public async payToServer(data: xls.rechargeShopOffical): Promise<void> {
            let productId = data.id;
            let payInfo = {
                product_id: BUNDLE_ID + productId,//转换成appconnect上配置的id
                amount: 1
            };
            //已经有这个商品信息了,直接支付
            if (this.iosProductInfos.has(payInfo.product_id)) {
                clientCore.LoadingManager.showSmall();
                clientCore.NativeMgr.instance.dispath('pay:', payInfo, null);//调用ios原生支付
            }
            else {
                alert.showFWords('并未查询到该商品，请稍后再试');
                this.reqAllProductInfo();
            }
        }

        private reqAllProductInfo() {
            let allShopInfo = clientCore.RechargeManager.getAllShopInfo();
            let ids = _.map(allShopInfo.getKeys(), (id) => { return BUNDLE_ID + id });
            console.log('[IAP] JS 开始请求所有商品信息');
            clientCore.NativeMgr.instance.requestAllProductInfo(ids);
        }

        private onProductsInfoBack(str: string) {
            let ids = str.split(',');
            this.iosProductInfos.clear();
            for (const info of ids) {
                let iosProid = info.split('-')[0];
                let prodid = _.last(iosProid.split('.'));
                let price = info.split('-')[1];
                this.iosProductInfos.add(iosProid, true);
                let xlsPrice = clientCore.RechargeManager.getShopInfo(prodid);
                if (xlsPrice && xlsPrice.cost != parseInt(price)) {
                    console.log(`${iosProid}价格不对 appleconnect上配置为${price}`);
                }
            }
            console.log(`[IAP] JS 商品信息获取成功,共${this.iosProductInfos.length}个商品`);
        }

        /**
         * ios端支付完成,将需要验证的票据缓存起来
         */
        private payOkAndVerifyPayment(args: string) {
            let argsArr = args.split(',');
            let transationId = argsArr[0];
            if (!this._verifyQueueMap.has(transationId)) {
                this._verifyQueueMap.add(transationId, args);
                console.log(`[IAP] JS 新增待验证票据,当前共有${this._verifyQueueMap.length}个票据待验证`);
                this.verifyNextPayment();
            }
        }

        /**开始验证缓存队列中的票据 */
        private verifyNextPayment() {
            //当前有正在验证的
            if (this._nowVerifyInfo)
                return;
            //当前无票据需要验证
            if (this._verifyQueueMap.length == 0)
                return;
            this._nowVerifyInfo = { transationId: '', onceOrderID: '', product_id: '', recepit: '' };
            let args = this._verifyQueueMap.getValues().shift();
            let argsArr = args.split(',');
            let transationId = argsArr[0];
            let recepit = argsArr[1];
            let product_id: string = argsArr[2];//app connect传回的商品id 前缀是（包名）
            let productId = _.last(product_id.split('.'));//转换为我们自己的商品id（数字）
            this.paySuccess(parseInt(productId));
            console.log('[IAP] JS 开始验证流程 transId:' + transationId + ' productId:' + productId)
            this.getOrder(productId, transationId, recepit);
        }

        /**向u8下单 */
        private getOrder(productId: string, transationId: string, recepit: string) {
            console.log('[IAP] JS 开始获取订单号，商品id' + productId)
            let data = clientCore.RechargeManager.getShopInfo(productId);
            if (!data) {
                console.log('[IAP] JS 商品表中没有数据')
                return Promise.resolve('');
            }
            let productName: string = data.name.replace(" ", "");
            let productDesc: string = data.desc == "" ? productName : data.desc.replace(" ", "");
            let payInfo: object = {
                payChannel: 81,
                md5SignRule: 1,
                userID: this.userID,
                productID: productId,
                productName: productName,
                productDesc: productDesc,
                money: data.cost * 100,
                roleID: clientCore.LocalInfo.uid,
                roleLevel: clientCore.LocalInfo.userLv,
                serverID: clientCore.GlobalConfig.serverId,
                serverName: clientCore.GlobalConfig.serverName,
                notifyUrl: "",
                signType: "md5",
                extension: JSON.stringify({
                    phoneOS: 'ios',
                    productName: productName,
                    subChannelID: channel.ChannelConfig.subChannelId,
                    // channelProductID: this._nowVerifyInfo.transationId
                })
            }
            payInfo["sign"] = this.getSign(payInfo);
            channel.requestByHttp(GET_ORDER_ADDRESS, Laya.Handler.create(this, (data) => {
                console.log('[IAP] JS 订单号获取完成');
                try {
                    data = JSON.parse(data);
                    if (data.state && data.state == 1) {
                        this._nowVerifyInfo.transationId = transationId;
                        this._nowVerifyInfo.recepit = recepit;
                        this._nowVerifyInfo.onceOrderID = data.data.orderID;
                        this._nowVerifyInfo.product_id = productId;
                        this.verifyCurrRecepit();
                    }
                    else {
                        clientCore.LoadingManager.hideSmall(true);
                        alert.showFWords('订单获取失败');
                    }
                }
                catch (e) {
                    clientCore.LoadingManager.hideSmall(true);
                    alert.showFWords('订单获取失败');
                }
            }), payInfo, "post")
        }

        /**验证当前处理的票据 */
        private verifyCurrRecepit() {
            let verifyInfo = {
                order_id: this._nowVerifyInfo.onceOrderID,
                pay_id: this._nowVerifyInfo.product_id,
                inapp_purchase_data: this._nowVerifyInfo.recepit,
                sign: this.getVerifySign(this._nowVerifyInfo.onceOrderID, parseInt(this._nowVerifyInfo.product_id))
            }
            console.log('[IAP] JS 开始验证');
            channel.requestByHttp(PAY_CHECK_ADRESS, Laya.Handler.create(this, this.onVerifyOver), verifyInfo, 'post');
        }

        private onVerifyOver(backData: string) {
            console.log(`[IAP] JS 票据验证返回: transId:${this._nowVerifyInfo.transationId} backData:${backData}`);
            try {
                let data = JSON.parse(backData);
                if (data.state) {
                    if (data.state == 1 || data.state == 116) {
                        this.verifySucssAndNext();
                    }
                    else {
                        clientCore.LoadingManager.hideSmall(true);
                        alert.showSmall('订单验证错误' + data.msg + '\n是否重试?', { callBack: { caller: this, funArr: [this.reVerifyRecepit] } });
                    }
                }
            }
            catch (e) {
                clientCore.LoadingManager.hideSmall(true);
                alert.showSmall('订单验证错误：无法解析');
            }
        }

        /**验证失败，重复验证（包含重试逻辑） */
        private reVerifyRecepit() {
            this._reVerifyCount++;
            if (this._reVerifyCount >= MAX_RE_VERIFY_COUNT) {
                alert.showSmall('重复次数过多，请稍后尝试', { btnType: alert.Btn_Type.ONLY_SURE });
                this.clearVerifyInfoAndNext();
            }
            else {
                this.verifyCurrRecepit();
            }
        }

        /**票据验证成功 */
        private verifySucssAndNext() {
            console.log(`[IAP] JS 调用IOS结束订单:${this._nowVerifyInfo.transationId}`);
            clientCore.NativeMgr.instance.finishTransation(this._nowVerifyInfo.transationId);
            this.clearVerifyInfoAndNext();
        }

        private clearVerifyInfoAndNext() {
            clientCore.LoadingManager.hideSmall(true);
            this._verifyQueueMap.remove(this._nowVerifyInfo.transationId);
            this._nowVerifyInfo = null;
            this._reVerifyCount = 0;
            this.verifyNextPayment();
        }

        private getSign(payInfo: Object): string {
            let arr = [
                `userID=${payInfo["userID"]}`,
                `productID=${payInfo["productID"]}`,
                `productName=${payInfo["productName"]}`,
                `productDesc=${payInfo["productDesc"]}`,
                `money=${payInfo["money"]}`,
                `roleID=${payInfo["roleID"]}`,
                `roleLevel=${payInfo["roleLevel"]}`,
                `serverID=${payInfo["serverID"]}`,
                `serverName=${payInfo["serverName"]}`,
                `extension=${payInfo["extension"]}`,
            ]
            return util.Md5Util.encrypt(encodeURIComponent(arr.join('&') + `${this.appkey}`));
        }

        /**获取验证票据的签名 */
        private getVerifySign(order_id: string, pay_id: number) {
            let str = `order_id=${order_id}&pay_id=${pay_id}&${this.appkey}`;
            return util.Md5Util.encrypt(str);
        }

        private loginU8(): Promise<void> {
            return new Promise<void>((suc) => {
                let value: string = `appID=${this.u8Info["appID"]}channelID=${this.u8Info["channelID"]}extension=${JSON.stringify(this.u8Info["extension"])}${this.appkey}`
                this.u8Info["sign"] = util.Md5Util.encrypt(value);
                console.log('u8 login:' + JSON.stringify(this.u8Info));
                channel.requestByHttp(LOGIN_U8_ADRESS, Laya.Handler.create(this, async (data) => {
                    console.log('u8 loginBack:' + data);
                    data = JSON.parse(data);
                    if (data.state != 1) {
                        alert.showFWords("U8登录失败了~");
                    } else {
                        let args = data.data;
                        this.userID = args.userID;
                        await channel.ChannelControl.ins.queryAntiAddiction("第一次实名认证查询...");
                        //第一次实名认证，没有认证过弹出
                        if (clientCore.LocalInfo.age == 0) {
                            clientCore.ModuleManager.open('realName.RealNameModule');
                        }
                        this.paramData = {
                            userID: args.userID,
                            token: args.token,
                            channelID: ChannelConfig.channelId,
                            subChannelID: ChannelConfig.subChannelId
                        }
                        suc();
                    }
                }), this.u8Info, "post");
            })
        }

        public async loginServer(handler: Laya.Handler): Promise<void> {
            await this.loginU8();
            channel.requestByHttp(LOGIN_SERVER_ADRESS, handler, this.paramData, "post");
        }

        public async queryAntiAddiction(): Promise<number> {
            return new Promise((suc) => {
                channel.requestByHttp(CHECK_SESSION, Laya.Handler.create(this, (data) => {
                    try {
                        data = JSON.parse(data);
                        if (data && data.result == 0) {
                            let age: number = data.data.age >> 0;
                            suc(age);
                        } else {
                            suc(0);
                        }
                    }
                    catch {
                        suc(0);
                    }
                }), this.checkInfo, "post");
            })
        }
    }
}