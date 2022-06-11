namespace login2 {
    //文档地址 http://10.1.1.104/showdoc/index.php?s=/2&page_id=13

    const REG_NORMAL_URL = 'http://account-co.61.com/gameRegister/registerCustom';

    export class NormalRegControl implements IRegControl {
        private ui: ui.login2.panel.Reg_normalUI;
        private _labelArr: Laya.TextInput[];

        constructor(v: ui.login2.panel.Reg_normalUI) {
            this.ui = v;
            this.ui.visible = false;
            this._labelArr = [this.ui.txtAccount, this.ui.txtPw_0, this.ui.txtPw_1, this.ui.txtVerify];
            BC.addEvent(this, this.ui.btnGet, Laya.Event.CLICK, this, this.onReqVerifyCode);
            this.onReqVerifyCode();
        }

        startReg() {
            if (this.validateInput()) {
                if (this.ui.txtVerify.text.length > 0) {
                    let http: Laya.HttpRequest = new Laya.HttpRequest();
                    http.once(Laya.Event.COMPLETE, this, (data) => {
                        if (data && data.result == 0)
                            EventManager.event(globalEvent.SIGIIN_SUCCESS, [this.ui.txtAccount.text, this.ui.txtPw_0.text]);
                        if (data && data.err_desc) {
                            this.onReqVerifyCode();
                            alert.showFWords(data.err_desc);
                        }
                    });
                    http.http.withCredentials = true; //跨域传入Cookie
                    let paramArr = [
                        `account=${this.ui.txtAccount.text}`,
                        `passwd=${this.ui.txtPw_0.text}`,
                        `sec_passwd=${this.ui.txtPw_1.text}`,
                        `ret_type=${2}`,
                        `game=${695}`,
                        `tad=${'unknown'}`,
                        `vericode=${this.ui.txtVerify.text}`,
                        `real_name=${'北京人'}`,
                        `identification=${'110101199003076739'}`
                    ]
                    http.send(REG_NORMAL_URL, paramArr.join('&'), "post", "json");
                }
            }
        }

        private vericodeUrl: string;
        /**
        * 请求图片验证码
        */
        private onReqVerifyCode() {
            this.vericodeUrl && Laya.loader.clearRes(this.vericodeUrl); //清理缓存
            if (!Laya.Render.isConchApp) {
                this.vericodeUrl = "http://account-co.61.com/vericode/generate?game=695&s=" + Math.floor(Math.random() * 1000000);
                let http: Laya.HttpRequest = new Laya.HttpRequest();
                http.once(Laya.Event.COMPLETE, this, (data: any) => {
                    this.ui.imgVerify.skin = `data:image/png;base64,${this.arrayBufferToBase64(data)}`;
                });
                http.http.withCredentials = true; //跨域传入Cookie
                http.send(this.vericodeUrl, "", "get", "arraybuffer");
            } else {
                this.ui.imgVerify.skin = "http://account-co.61.com/vericode/generate?game=695&s=" + Math.floor(Math.random() * 1000000);
            }
        }

        private arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i += 1) {
                binary += String.fromCharCode(bytes[i]);
            }
            return Laya.Browser.window.btoa(binary);  //base64
        };

        private validateInput() {
            let regAccount = /^[a-zA-Z0-9_-]{6,20}$/;
            let regPw = /^[a-zA-Z0-9]{6,16}$/;

            if (regAccount.test(this.ui.txtAccount.text))
                if (regPw.test(this.ui.txtPw_0.text))
                    if (this.ui.txtPw_0.text == this.ui.txtPw_1.text)
                        return true;
                    else
                        alert.showFWords('两次输入密码不相同');
                else
                    alert.showFWords('密码不符合要求');
            else
                alert.showFWords('账号格式不正确');

            return false;
        }

        destory() {
            BC.removeEvent(this);
        }
    }
}