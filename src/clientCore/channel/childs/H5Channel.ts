namespace channel.childs{
    /** session验证地址实际上 通过这个获取scope 取年龄*/
    const CHECK_SESSION: string = "http://account-co.61.com/UserIdentity/check";
    /** 平台登录地址*/
    const LOGIN_CHANNEL_ADRESS: string = 'http://account-co.61.com/UserIdentity/authenticate';
    /** U8服务器*/
    const U8_SERVER: string = 'http://129.211.109.200:8080';
    const APP_KEY: string = '7219b7035b270a713c31137df3b1a897';
    const TAG: string = 'TM_H5';
    const SDK_URL: string = 'http://h5.61.com/sdk/taomeeh5sdk-internal-1.0.0.min.js';
    /**
     * H5channel
     */
    export class H5Channel extends BaseChannel{
        protected loginServerAdress: string = 'http://129.211.109.200:61002/login/u8sLogin/';
        private _loginHandler: Laya.Handler;
        private _u8Params: object;
        private _loginParams: object;
        private _checkParams: object;
        private _u8uid: string;
        init(handler: Laya.Handler): void{
            let self: H5Channel = this;
            channel.loadScript(SDK_URL,false,()=>{
                let params: object = {
                    gameId: 695,
                    payCallback: (data)=>{ console.log('pay call: ',data); }
                }
                self.opeater = new Laya.Browser.window.TAOMEE_SDK(params);
                self._u8Params = { appID: 1, channelID: ChannelConfig.channelId };
                self._checkParams = { tad: 2, game: 695, scope: "age" };
                self._loginHandler = handler;
                self.addEvents();
            })
        }
        private addEvents(): void{
            BC.addEvent(this,EventManager,globalEvent.SYN_ACCOUNT,this,this.onSynAccount);
        }
        private removeEvents(): void{
            BC.removeEvent(this);
        }
        private onSynAccount(accountId: string, pw: string) {
            this.loginChannel(accountId, pw).then(() => {
                this._loginHandler.run();
            })
        }
        /** 渠道方登录*/
        private loginChannel(accountId: string, pw: string): Promise<void> {
            return new Promise((ok) => {
                let params: object = {
                    account: accountId,
                    rememberAcc: 0,
                    passwd: util.Md5Util.encrypt(pw),
                    rememberPwd: 0,
                    game: 695,
                    tad: 'unknown'
                }
                utils.HttpUtils.httpPost(LOGIN_CHANNEL_ADRESS,new Laya.Handler(this,this.loginResult,[ok]),params);
            })
        }
        private loginResult(ok: Function,data: any): void{
            if(!data)return;
            data = this.formatHttpData(data);
            if (data.result == 0) {
                this._checkParams["accountId"] = data.data.uid;
                this._checkParams["session"] = data.data.session;
                Laya.LocalStorage.setItem('ios_session', data.data.session);
                Laya.LocalStorage.setItem('ios_session_time', Date.now().toString());
                this._u8Params['extension'] = JSON.stringify({ session: data.data.session, userId: data.data.uid, userName: data.data.uid });
                this.removeEvents();
                let uid: number = data.data.uid;
                channel.ChannelConfig.channelUserID = uid;
                ok();
            }else {
                let txt = data.err_desc ? data.err_desc : '登录失败，错误码' + data.result;
                alert.showSmall(txt, { btnType: alert.Btn_Type.ONLY_SURE });
            }
        }
        private formatHttpData(data: string): Object {
            let result: string[] = data.match(/\(([^)]*)\)/);
            return JSON.parse(result[1]);
        }

        /** U8服务器登录*/
        loginServer(handler: Laya.Handler): void{
            this.loginU8().then(async()=>{ 
                await ChannelControl.ins.queryAntiAddiction('第一次实名认证查询...');
                clientCore.LocalInfo.age == 0 && clientCore.ModuleManager.open('realName.RealNameModule');
                super.loginServer(handler); 
            })
        }
        private loginU8(): Promise<void>{
            return new Promise((ok)=>{
                let value: string = `appID=${this._u8Params["appID"]}channelID=${this._u8Params["channelID"]}extension=${this._u8Params["extension"]}${APP_KEY}`;
                this._u8Params["sign"] = util.Md5Util.encrypt(value);
                utils.HttpUtils.httpPost(`${U8_SERVER}/user/getToken`,new Laya.Handler(this,this.u8LoginResult,[ok]),this._u8Params);
            })
        }
        private u8LoginResult(ok: Function,data: any): void{
            data = JSON.parse(data);
            if (data.state != 1) {
                alert.showFWords("get token fail.");
                return;
            }
            this._u8uid = data.data.userID;
            this._loginParams = {
                userID: this._u8uid,
                token: data.data.token,
                channelID: ChannelConfig.channelId,
                subChannelID: ChannelConfig.subChannelId
            }
            ok();
        }
        protected getLoginParams(): object{
            return this._loginParams;
        }

        payToServer(data: xls.rechargeShopOffical): void{
            let os: string = Laya.Browser.onAndroid ? "android" : "ios";
            let payInfo: Object = {
                md5SignRule: 1,
                userID: this._u8uid,
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
            utils.HttpUtils.httpPost(`${U8_SERVER}/pay/getH5OrderID`,new Laya.Handler(this,this.orderResult,[data]), payInfo);
        }

        async queryAntiAddiction(): Promise<number> {
            return new Promise((ok: Function) => {
                utils.HttpUtils.httpPost(CHECK_SESSION,new Laya.Handler(this,this.checkResult,[ok]),this._checkParams);
            })
        }

        private checkResult(ok: Function,data: any): void{
            try {
                data = JSON.parse(data);
                if (data && data.result == 0) {
                    let age: number = data.data.age >> 0;
                    ok(age);
                } else {
                    ok(0);
                }
            }
            catch {
                ok(0);
            }
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
            let md5Str: string = encodeURIComponent(arr.join('&') + `${APP_KEY}`);
            return util.Md5Util.encrypt(md5Str);
        }
        private orderResult(cfg: xls.rechargeShopOffical,data: any): void {
            data = JSON.parse(data);
            if (data.state != 1) {
                Log.i(TAG, 'get order id fail.' + data.state);
                return;
            }
            this.pay(cfg,data.data.orderID);
        }
        private pay(data: xls.rechargeShopOffical, orderID: string): void{
            let params: object = {
                game: 695,
                userid: channel.ChannelConfig.channelUserID,
                product_name: data.name,
                price: data.cost*100,
                order_id: orderID,
                server_id: clientCore.GlobalConfig.serverId,
                role_id: clientCore.LocalInfo.uid,
                extent: ''
            }
            params['sign'] = this.channelPaySign(params);
            this.opeater?.pay(params)
        }
        private channelPaySign(payInfo: Object): string {
            let arr: string[] = [
                `extent=${payInfo["extent"]}`,
                `game=${payInfo["game"]}`,
                `order_id=${payInfo["order_id"]}`,
                `price=${payInfo["price"]}`,
                `product_name=${payInfo["product_name"]}`,
                `role_id=${payInfo["role_id"]}`,
                `server_id=${payInfo["server_id"]}`,
                `userid=${payInfo["userid"]}`,
                `key=a83rJIkdja`
            ]
            let md5Str: string = encodeURIComponent(arr.join('&'));
            return util.Md5Util.encrypt(md5Str);
        }
    }
}