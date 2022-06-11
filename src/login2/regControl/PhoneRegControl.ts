namespace login2 {
    //文档地址 http://10.1.1.104/showdoc/index.php?s=/2&page_id=23
    const REG_PHONE_URL = 'http://account-co.61.com/gameRegister/registerPhone';
    const VERIFY_PHONE_URL = 'http://account-co.61.com/gameRegister/verifyPhone';

    export class PhoneRegControl implements IRegControl {
        private ui: ui.login2.panel.Reg_phoneUI;
        private _labelArr: Laya.TextInput[];

        constructor(v: ui.login2.panel.Reg_phoneUI) {
            this.ui = v;
            this.ui.visible = false;
            this._labelArr = [this.ui.txtPhone, this.ui.txtPw_0, this.ui.txtPw_1, this.ui.txtVerify];
            BC.addEvent(this, this.ui.btnGet, Laya.Event.CLICK, this, this.onReqVerifyCode);
        }

        startReg() {
            if (this.validateInput()) {
                if (this.ui.txtVerify.text.length > 0) {
                    let http: Laya.HttpRequest = new Laya.HttpRequest();
                    http.once(Laya.Event.COMPLETE, this, (data) => {
                        if (data && data.result == 0)
                            EventManager.event(globalEvent.SIGIIN_SUCCESS, [this.ui.txtPhone.text, this.ui.txtPw_0.text]);
                        if (data && data.err_desc)
                            alert.showFWords(data.err_desc);
                    });
                    http.http.withCredentials = true; //跨域传入Cookie
                    let paramArr = [
                        `phone_code=${this.ui.txtVerify.text}`,
                        'ret_type=2'
                    ]
                    http.send(VERIFY_PHONE_URL, paramArr.join('&'), "post", "json");
                }
            }
        }

        /**
        * 请求短信验证码
        */
        private onReqVerifyCode() {
            if (this.validateInput()) {
                let http: Laya.HttpRequest = new Laya.HttpRequest();
                http.once(Laya.Event.COMPLETE, this, (data) => {
                    if (data && data.result == 0)
                        alert.showFWords('验证码已发送')
                    if (data && data.err_desc)
                        alert.showFWords(data.err_desc);
                });
                http.http.withCredentials = true; //跨域传入Cookie
                let paramArr = [
                    `account=${this.ui.txtPhone.text}`,
                    `passwd=${this.ui.txtPw_0.text}`,
                    `sec_passwd=${this.ui.txtPw_1.text}`,
                    `ret_type=${2}`,
                    `game=${695}`,
                    `tad=${'unknown'}`,
                ]
                http.send(REG_PHONE_URL, paramArr.join('&'), "post", "json");
            }
        }

        private validateInput() {
            let regPhone = /^1[3456789]\d{9}$/;
            let regPw = /^[a-zA-Z0-9]{6,16}$/;

            if (regPhone.test(this.ui.txtPhone.text))
                if (regPw.test(this.ui.txtPw_0.text))
                    if (this.ui.txtPw_0.text == this.ui.txtPw_1.text)
                        return true;
                    else
                        alert.showFWords('两次输入密码不相同');
                else
                    alert.showFWords('密码不符合要求');
            else
                alert.showFWords('手机号输入不正确');

            return false;
        }

        destory() {
            BC.removeEvent(this);
        }
    }
}