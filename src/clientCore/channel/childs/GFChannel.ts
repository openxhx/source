namespace channel.childs {
    export class PayParams {
        productId: number;
        payId: string;
        orderId: string;
        constructor() { }
    }
    /**
     * 台湾版本
     */
    export class GFChannel extends BaseChannel {
        private readonly TAG: string = 'GF_CLIENT';
        private readonly appkey: string = 'abd0d65e23ab0203f2a26b12ab824376';
        private readonly openProxy: string = 'http://210.244.39.40:61001/login/u8sLogin/';

        // private readonly u8_server_path: string = 'http://10.1.3.161:8080';
        private readonly u8_server_path: string = 'http://210.244.39.40:8080';

        private channelLoginHandler: Laya.Handler;
        private gameLoginHandler: Laya.Handler;
        //params
        private token: string;
        private userId: string;
        private u8UserId: string;
        private channelId: number; //google 51 facebook 52

        private payParams: PayParams;

        init(handler: Laya.Handler): void {
            //init info
            this.channelLoginHandler = handler;
            this.addEvents();
            //show view
            clientCore.ModuleManager.open('twlogin.TwloginModule');
        }

        private addEvents(): void {
            BC.addEvent(this, EventManager, globalEvent.TAIWAN_LOGIN, this, this.loginChannel);
            BC.addEvent(this, EventManager, globalEvent.ENTER_GEME, this, this.initPay);
            window["onSupplementOrder"] = this.onSupplementOrder;
        }

        private removeView(): void {
            clientCore.ModuleManager.closeModuleByName('twlogin');
        }

        private loginChannel(type: number): void {
            clientCore.NativeMgr.instance.dispath('loginGF', { type: type }, new Laya.Handler(this, (data) => {
                data.loginType == '1' ? this.handleGoogle(data) : this.handlerFacebook(data);
                this.channelLoginHandler?.run();
                this.removeView();
            }));
        }


        // 512 425
        /**
         * google登录返回
         * @param data 
         */
        private handleGoogle(data): void {
            this.channelId = 51;
            this.token = data.token;
            this.userId = data.id;
        }

        /**
         * facebook登录返回
         * @param data 
         */
        private handlerFacebook(data): void {
            this.channelId = 52;
            this.token = data.token;
            this.userId = data.userId;
        }

        public loginServer(handler: Laya.Handler): void {
            this.gameLoginHandler = handler;
            this.loginU8Server();
        }

        /**
         * 登录U8服务器
         * login params {appID,channelID,extension,sign}  extension { session, userId, userName}
         */
        private loginU8Server(): void {
            let data: Object = {
                appID: 1,
                channelID: this.channelId,
                extension: JSON.stringify({ token: this.token, userId: this.userId, userName: this.userId })
            }
            let md5Str: string = `appID=1channelID=${this.channelId}extension=${data["extension"]}${this.appkey}`;
            data['sign'] = util.Md5Util.encrypt(md5Str);
            Log.i(this.TAG, 'now login u8.' + JSON.stringify(data));
            utils.HttpUtils.httpPost(`${this.u8_server_path}/user/getToken`, new Laya.Handler(this, this.loginResult), data);
        }

        private loginResult(data): void {
            Log.i(this.TAG, 'u8 login result.' + data);
            data = JSON.parse(data);
            if (data.state != 1) {
                Log.e(this.TAG, 'u8 login fail.' + data.state);
                return;
            }
            let loginParams: Object = {
                userID: data.data.userID,
                token: data.data.token,
                channelID: this.channelId,
                subChannelID: ChannelConfig.subChannelId
            }
            this.u8UserId = data.data.userID;
            utils.HttpUtils.httPGet(this.openProxy, this.gameLoginHandler, loginParams);
        }

        private initPay(): void {
            Log.i(this.TAG, 'start init pay.');
            let array: xls.rechargeShopTaiwan[] = xls.get(xls.rechargeShopTaiwan).getValues();
            array = _.filter(array, (element: xls.rechargeShopTaiwan) => { return element.payId != ''; });
            let products: string = array.join(';');;
            clientCore.NativeMgr.instance.dispath('initPayGF', { type: 1, products: products });
        }

        /**
         * 向服务器请求支付
         * @param data 
         */
        public payToServer(data: xls.rechargeShopTaiwan): void {
            if (data.payId == '') {
                alert.showFWords('该商品暂不支持购买哦~');
                return;
            }
            Log.i(this.TAG, 'start get orderId from u8server.');
            this.payParams = null;
            this.payParams = new PayParams();
            this.payParams.productId = data.id;
            this.payParams.payId = data.payId;
            this.getOrder(data, new Laya.Handler(this, this.orderResult));
        }

        private getOrder(data: xls.rechargeShopTaiwan, handler: Laya.Handler): void {
            let os: string = Laya.Browser.onAndroid ? "android" : "ios";
            let payInfo: Object = {
                md5SignRule: 1,
                userID: this.u8UserId,
                productID: data.id,
                productName: data.name,
                productDesc: data.name,
                money: data.cost * 100,
                roleID: clientCore.LocalInfo.uid,
                roleName: clientCore.LocalInfo.userInfo.nick,
                roleLevel: clientCore.LocalInfo.userLv,
                serverID: clientCore.GlobalConfig.serverId,
                serverName: clientCore.GlobalConfig.serverName,
                notifyUrl: '',
                signType: 'md5',
                extension: JSON.stringify({
                    phoneOS: os,
                    productName: data.name,
                    subChannelID: channel.ChannelConfig.subChannelId
                })
            }
            payInfo['sign'] = this.paySign(payInfo);
            utils.HttpUtils.httpPost(`${this.u8_server_path}/pay/getH5OrderID`, handler, payInfo);
        }

        private paySign(payInfo: Object): string {
            let arr: string[] = [
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
            let md5Str: string = encodeURIComponent(arr.join('&') + `${this.appkey}`);
            Log.i(this.TAG, md5Str);
            return util.Md5Util.encrypt(md5Str);
        }

        private orderResult(data: any): void {
            data = JSON.parse(data);
            if (data.state != 1) {
                Log.i(this.TAG, 'get order id fail.' + data.state);
                return;
            }
            this.payParams.orderId = data.data.orderID;
            clientCore.NativeMgr.instance.dispath('payGF', { type: 1, productID: this.payParams.payId }, new Laya.Handler(this, this.triggerVerify));
        }

        private triggerVerify(data: any): void {
            Log.i(this.TAG, 'pay: orderId ' + this.payParams.orderId + ' data ' + JSON.stringify(data));
            let verifyInfo: Object = {
                orderId: this.payParams.orderId,
                packageName: data.packname,
                productId: this.payParams.productId,
                payId: data.productID,
                token: data.token
            }
            Log.i(this.TAG, 'pay u8server: ' + JSON.stringify(verifyInfo));
            utils.HttpUtils.httpPost(`${this.u8_server_path}/pay/google/activeValidate`, new Laya.Handler(this, this.verifyResult), verifyInfo);
        }

        private verifyResult(result: string) {
            try {
                let data: Object = JSON.parse(result);
            } catch (e) {
                Log.i(this.TAG, '订单验证错误，信息无法解析.');
            }
        }


        /**
         * 补单操作
         * @param params 
         */
        private onSupplementOrder(params: string): void {
            Log.i(this.TAG, 'supple: ' + params);
            let data = JSON.parse(params);
            let shops: xls.rechargeShopTaiwan[] = xls.get(xls.rechargeShopTaiwan).getValues();
            let cls: xls.rechargeShopTaiwan = _.find(shops, (element: xls.rechargeShopTaiwan) => { return element.payId == data.productID; });
            if (!cls) return;
            this.getOrder(cls, new Laya.Handler(this, (args) => {
                args = JSON.parse(args);
                if (args.state != 1) {
                    Log.i(this.TAG, 'supple get order id fail.' + data.state);
                    return;
                }
                let verifyInfo: Object = {
                    orderId: data.data.orderID,
                    packageName: data.packname,
                    productId: cls.id,
                    payId: data.productID,
                    token: data.token
                }
                Log.i(this.TAG, 'pay u8server: ' + JSON.stringify(verifyInfo));
                utils.HttpUtils.httpPost(`${this.u8_server_path}/pay/google/activeValidate`, new Laya.Handler(this, this.verifyResult), verifyInfo);
            }))
        }
    }
}