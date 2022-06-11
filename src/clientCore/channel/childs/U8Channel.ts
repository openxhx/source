

namespace channel.childs {
    /**
     * U8聚合平台
     */
    export class U8Channel extends BaseChannel {

        private _paramData: Object;
        private _loginHandler: Laya.Handler;
        private _waitLogin: boolean;

        constructor() { super() }

        init(handler: Laya.Handler): void {
            ChannelConfig.u8Channel = true;
            this.initListeners();
            this.setLoginServer();
            this._waitLogin = false;
            this._loginHandler = handler;
            if (channel.ChannelConfig.channelId != ChannelEnum.XIAOMI) this.login();
        }

        login(): void {
            if (this._waitLogin) {
                alert.showFWords("小花仙，正在登录请稍候哦^_^");
                return;
            }

            this._waitLogin = true;
            clientCore.NativeMgr.instance.dispath("login", null, Laya.Handler.create(this, async (data) => {
                //登录失败了
                if (data["errorCode"] != void 0) {
                    this._waitLogin = false;
                    return;
                }
                //获取实名认证
                await ChannelControl.ins.queryAntiAddiction("第一次实名认证查询...");
                ChannelConfig.subChannelId = clientCore.NativeMgr.instance.getLogicChannel();
                if (ChannelConfig.subChannelId == channel.subChannelEnum.热云)
                    clientCore.NativeMgr.instance.tracking_init(getSubChannelName(ChannelConfig.subChannelId));
                util.print("js client: ", "subchannel is", ChannelConfig.subChannelId);
                util.print("js client: ", "token is", data.token);
                util.print("js client: ", "sdkUserID is", data.sdkUserID);
                ChannelConfig.channelUserID = data.sdkUserID;
                this._paramData = {
                    userID: data.userID,
                    token: data.token,
                    channelID: data.channelID,
                    subChannelID: ChannelConfig.subChannelId
                }
                this._loginHandler && this._loginHandler.run();
                this._loginHandler = null;
            }))
        }

        private initListeners(): void {
            let win = Laya.Browser.window;
            //注销通知
            win.onLogout = function (): void {
                win.location.reload();
            }
            //切换账号并登陆成功通知
            win.onSwitchAccount = function (data: string): void {
                win.location.reload();
            }
        }

        /**
         * 设置官服地址和非官服地址
         * 61渠道为官服地址-其他都是非官服 切记切记
         */
        public setLoginServer(): void {
            this.loginServerAdress = ChannelConfig.channelId == ChannelEnum.TAOMEE_AD ?
                "http://tm-xhx.61.com/login/u8sLogin/" : "http://ot-xhx.61.com/login/u8sLogin/";
        }

        public payToServer(data: xls.rechargeShopChannel | xls.rechargeShopOffical): void {
            this.payToChannel(data);
        }

        public payToChannel(data: xls.rechargeShopChannel | xls.rechargeShopOffical): void {
            let os: string = Laya.Browser.onAndroid ? "android" : "ios";
            let productName: string = data.name.replace(" ", "");
            let productDesc: string = data.desc == "" ? productName : data.desc.replace(" ", "");
            let dataView: Object = {
                productId: data.id,
                productName: productName,
                productDesc: productDesc,
                price: data.cost,
                currentCoin: clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID),
                serverId: clientCore.GlobalConfig.serverId,
                serverName: clientCore.GlobalConfig.serverName,
                roleId: channel.ChannelConfig.channelUserID,
                roleName: clientCore.LocalInfo.userInfo.nick,
                roleLevel: clientCore.LocalInfo.userLv,
                vipLev: clientCore.LocalInfo.vipLv,
                payNotifyUrl: "",
                extension: JSON.stringify({
                    phoneOS: os,
                    productName: productName,
                    subChannelID: channel.ChannelConfig.subChannelId
                })
            }
            clientCore.Logger.sendLog('u8相关', '游戏支付统计', `开始支付渠道${channel.ChannelConfig.channelId}`);

            clientCore.NativeMgr.instance.dispath("pay", dataView, Laya.Handler.create(this, (params) => {
                let code: number = parseInt(params.code);
                switch (code) {
                    case 10:
                        clientCore.Logger.sendLog('u8相关', '游戏支付统计', `支付成功渠道${channel.ChannelConfig.channelId}`);
                        this.paySuccess(data.id);
                        break;
                    case 11:
                        clientCore.Logger.sendLog('u8相关', '游戏支付统计', `支付失败渠道${channel.ChannelConfig.channelId}`);
                        this.payFail();
                        break;
                    case 33:
                        clientCore.Logger.sendLog('u8相关', '游戏支付统计', `支付取消渠道${channel.ChannelConfig.channelId}`);
                        this.payCancel();
                        break;
                    default:
                        break;
                }
            }));
        }

        public reportRoleData(dataType: number) {
            let data: Object = {
                dataType: dataType,
                serverID: clientCore.GlobalConfig.serverId,
                serverName: clientCore.GlobalConfig.serverName,
                roleID: clientCore.GlobalConfig.uid,
                roleLevelUpTime: Math.floor(Laya.Browser.now() / 1000),
                //以下选服未知创角时间
                roleName: dataType > 1 ? clientCore.LocalInfo.userInfo.nick : "name",
                roleCreateTime: dataType > 1 ? clientCore.LocalInfo.createRoleTime : 0,
                //以下数据创角和选服未知
                roleLevel: dataType > 2 ? clientCore.LocalInfo.userLv : 1,
                moneyNum: dataType > 2 ? clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) : 0,
                vipLevel: dataType > 2 ? clientCore.LocalInfo.vipLv : 0
            }
            clientCore.NativeMgr.instance.dispath("report", data);
        }

        public queryAntiAddiction(): Promise<number> {
            return new Promise((suc) => {
                Laya.timer.once(30000, this, this.onTimeOut, [suc]);
                clientCore.NativeMgr.instance.dispath("queryAntiAddiction", null, Laya.Handler.create(this, (data) => {
                    Laya.timer.clear(this, this.onTimeOut);
                    let age: number = 0;
                    switch (data.status) {
                        case 0: //渠道没有提供查询实名认证的接口 需要游戏方自己处理
                            age = 20;
                            break;
                        case 1: //已经实名
                            age = parseInt(data.age);
                            break;
                        case 2: //没有实名
                            break;
                    }
                    suc(age);
                }))
            })
        }

        public realNameRegister(): void {

        }


        private onTimeOut(suc: Function): void {
            alert.showFWords("查询实名信息失败~");
            suc(0);
        }

        public loginServer(handler: Laya.Handler): void {
            channel.requestByHttp(this.loginServerAdress, handler, this._paramData, "post");
        }

        public logout(): void {
            clientCore.NativeMgr.instance.u8_logout();
        }

        public exitGame(): void {
            clientCore.NativeMgr.instance.u8_exit();
        }
    }
}