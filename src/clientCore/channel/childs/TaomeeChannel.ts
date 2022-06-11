
namespace channel.childs {
    /**
     * 淘米渠道
     */
    export class TaomeeChannel extends BaseChannel {

        private paramData: Object;
        private loginChannelAdress: string = "http://account-co.61.com/UserIdentity/authenticate"; //平台登录地址
        // protected loginServerAdress: string = "http://open-xhx.61.com/login/taomee";
        protected loginServerAdress: string = "http://212.64.108.15:61001/login/taomee";
        private _hanlder: Laya.Handler;
        constructor() { super(); }

        public init(handler: Laya.Handler): void {
            this.paramData = { tad: 2, gameId: 695 };
            this._hanlder = handler;
            EventManager.on(globalEvent.SYN_ACCOUNT, this, this.onSynAccount);
        }

        private onSynAccount(accountId: number, passW: string) {
            //判断是否代签
            let sid = getQureyString('sid');
            if (sid) {
                this.paramData["session"] = sid;
                this.paramData["accountId"] = accountId;
                this._hanlder.run();
            }
            else {
                this.loginChannel(accountId, passW).then(() => {
                    this._hanlder.run();
                })
            }
        }

        /** 渠道方登录*/
        private loginChannel(accountId: number, passW: string): Promise<void> {
            return new Promise((suc) => {
                let http: Laya.HttpRequest = new Laya.HttpRequest();
                http.once(Laya.Event.COMPLETE, this, (data: any) => {
                    if (data) {
                        data = this.formatData(data);
                        if (data.result == 0) {
                            this.paramData["session"] = data.data.session;
                            this.paramData["accountId"] = accountId;
                            suc();
                            EventManager.off(globalEvent.SYN_ACCOUNT, this, this.onSynAccount);
                        }
                        else {
                            let txt = data.err_desc ? data.err_desc : '登录失败，错误码' + data.result;
                            alert.showSmall(txt, { btnType: alert.Btn_Type.ONLY_SURE });
                        }
                    }
                })
                http.http.withCredentials = true;
                let postStr: string = `account=${accountId}&rememberAcc=${0}&passwd=${util.Md5Util.encrypt(passW)}&rememberPwd=${0}&game=695&tad=unknown`;
                http.send(this.loginChannelAdress, postStr, "post");
            })
        }

        protected getLoginParams(): Object {
            return this.paramData;
        }

        private formatData(data: string): Object {
            let result: string[] = data.match(/\(([^)]*)\)/);
            return JSON.parse(result[1]);
        }
    }
}