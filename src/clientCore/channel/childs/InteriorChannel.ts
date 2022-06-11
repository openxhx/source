

namespace channel.childs {
    /**
     * 内部
     */
    export class InteriorChannel extends BaseChannel {

        private _paramData: Object;

        constructor() { super(); }

        public init(handler: Laya.Handler): void {
            if (clientCore.GlobalConfig.isInnerNet)
                this.loginServerAdress = "http://10.1.1.220:61099/login/test"; //内网测试服务器登录验证地址
            else
                this.loginServerAdress = 'http://212.64.108.15:61001/login/test';
            if (window.location.href.indexOf('release') > -1)
                this.loginServerAdress = "http://10.1.1.75:61097/login/test";
            if (window.location.href.indexOf('changeTime') > -1 || window.location.href.indexOf('10.1.26.247/') > -1)
                this.loginServerAdress = 'http://10.2.1.16:61098/login/test';
            if (window.location.href.indexOf('test1') > -1)
                this.loginServerAdress = 'http://10.1.4.45:31015/login/test';
            if (clientCore.GlobalConfig.isTWWeb)
                this.loginServerAdress = 'http://210.244.39.40:61001/login/test';
            this._paramData = { tad: 1, gameId: 695, session: "interior" };
            EventManager.once(globalEvent.SYN_ACCOUNT, this, (accountId: number, age: number) => {
                clientCore.LocalInfo.age = channel.ChannelConfig.age = age;
                this._paramData["accountId"] = accountId;
                handler.run();
            });
        }

        protected getLoginParams(): Object {
            return this._paramData;
        }
    }
}