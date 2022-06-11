namespace login2 {

    enum ViewType {
        NONE, //都不显示
        INSTERIOR, //内部登录
        LOADING, //进度
        START,
        SIGNIN,
        SERVER_LIST
    }
    /**
     * 登录2.0
     */
    export class LoginModule extends ui.login2.LoginModuleUI {

        private _registerPanel: panel.RegPanel; //注册面板
        private _serialPanel: panel.SerialPanel; //激活码
        private _accountPanel: panel.AccountPanel; //确认账号面板
        private _srvPanel: panel.ServerPanel; //服务器列表面板
        private _noticePanel: panel.NoticePanel;//公告面板
        private _privacyPanel: panel.PrivacyPanel;//隐私面板
        private _taiwanPanel: panel.TaiwanLoginPanel;//台湾版登录面板

        private _selectSrv: pb.IonlineInfo; //当前选择的服务器
        private _srvs: pb.IonlineInfo[]; //服务器列表
        private _bone: clientCore.Bone;

        constructor() {
            super();
        }

        public init(): void {
            this.addPreLoad(xls.load(xls.serverName));
            this.addPreLoad(xls.load(xls.permission));
            this.addPreLoad(xls.load(xls.serverMaintenance, true));
            this.addPreLoad(res.load("atlas/selectServer.atlas"));
            this.addPreLoad(res.load('atlas/login2/panel/notice.atlas'));
            let privacy = channel.ChannelConfig.privacy;
            if (channel.ChannelConfig.channelId > 60 || channel.ChannelConfig.channelId == 2) {
                privacy = 'privacy';
            }
            if (privacy != "") {
                if (channel.ChannelConfig.channelId > 60 || channel.ChannelConfig.channelId == 2) {
                    // this.addPreLoad(res.load('res/private/taomee.png'));
                } else {
                    this.addPreLoad(res.load(`res/json/${privacy}.txt`));
                }
                this.btnShowPrivacy.visible = true;
            }
            this.addPreLoad(xls.load(xls.noticeBoard, true));
            core.SoundManager.instance.playBgm(pathConfig.getBgmUrl('login'), true);
            this.txtPhone.visible = channel.ChannelControl.ins.isOfficial;
            this.btnChangePrivacy.visible = Laya.Browser.onIOS && channel.ChannelControl.ins.isOfficial;
            if (!channel.ChannelControl.ins.isOfficial && channel.ChannelConfig.channelId == channel.ChannelEnum.YSDK) {
                this.btnShowPrivacy.visible = true;
            }
        }

        private async repairRes() {
            alert.showSmall('确认要清空游戏缓存吗？（清空缓存可修复一些图片及资源问题，不影响游戏数据）', { callBack: { caller: this, funArr: [this.sureRepair] } })
        }

        private sureRepair() {
            if (window['appcache'] && window['appcache'].setResourceID) {
                window['appcache'].setResourceID('netassetsid', '');
                alert.showSmall('缓存清理成功，下次游戏生效', { btnType: alert.Btn_Type.ONLY_SURE, needClose: false });
            }
            else {
                alert.showSmall('缓存清理失败!', { btnType: alert.Btn_Type.ONLY_SURE, needClose: false });
            }
        }

        public addEventListeners(): void {
            BC.addEvent(this, EventManager, globalEvent.BEAN_LOAD_PRO, this, this.updateBar);
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.showLogin);
            BC.addEvent(this, this.boxStart, Laya.Event.CLICK, this, this.showLogin);
            BC.addEvent(this, this.boxServer, Laya.Event.CLICK, this, this.onGameLogin);
            BC.addEvent(this, this.btnRegister, Laya.Event.CLICK, this, this.onRegister);
            BC.addEvent(this, this.btnLogin, Laya.Event.CLICK, this, this.onLogin);
            BC.addEvent(this, this.btnInLogin, Laya.Event.CLICK, this, this.onInLogin);
            BC.addEvent(this, this.imgServer, Laya.Event.CLICK, this, this.onShowSrv);
            BC.addEvent(this, this.btnNotice, Laya.Event.CLICK, this, this.showNotice);
            BC.addEvent(this, this.btnRepair, Laya.Event.CLICK, this, this.repairRes);
            BC.addEvent(this, EventManager, globalEvent.LINK_GETWAY, this, this.onLinkGetway);
            BC.addEvent(this, EventManager, globalEvent.SIGIIN_SUCCESS, this, this.showAccount);
            BC.addEvent(this, EventManager, globalEvent.SELECT_ONE_SERVER, this, this.updateCurSrv);
            BC.addEvent(this, this.txtForget, Laya.Event.CLICK, this, this.onForget);
            BC.addEvent(this, this.btnChangePrivacy, Laya.Event.CLICK, this, this.changePrivacy);
            BC.addEvent(this, this.btnShowPrivacy, Laya.Event.CLICK, this, this.alertPrivacyPanel);
            BC.addEvent(this, this.imgAlert, Laya.Event.CLICK, this, this.showAgeTip);
        }

        private showAgeTip() {
            clientCore.ModuleManager.open('ageTip.AgeTipModule');
        }

        private changePrivacy() {
            alert.showSmall('是否确认前往注销页面？', { callBack: { caller: this, funArr: [this.sureRegOut] } })
        }

        private sureRegOut() {
            clientCore.NativeMgr.instance.openUrl('https://account.61.com/close.html', true);
        }

        private onForget() {
            if (Laya.Render.isConchApp) {
                clientCore.NativeMgr.instance.openUrl('https://account.61.com/forget', true);
            }
            else {
                window.open('https://account.61.com/forget', '_blank');
            }
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public initOver(): void {
            EventManager.event(globalEvent.LOGIN_OPEN_SUC);
            // 先load必要资源
            this.updateView(ViewType.LOADING);
            // 读取本地账号和密码
            let accountId: string = window.localStorage.getItem("tmAccount");
            let passwd: string = window.localStorage.getItem("tmPasswd");
            let inUid: string = window.localStorage.getItem("uid");
            accountId && (this.inputZh.text = accountId);
            passwd && (this.inputPw.text = passwd);
            inUid && (this.inputInZh.text = inUid);
        }

        public popupOver(): void {
            let notices = xls.get(xls.noticeBoard).getValues().filter((v) => {
                let t1 = (new Date(v.noticeOpen)).getTime();
                let t2 = (new Date(v.noticeClose)).getTime();
                let now = (new Date()).getTime();
                return now >= t1 && now <= t2;
            })
            if (notices.length > 0) {
                this.showNotice();
            }
            else {
                this.showPrivacy();
            }
            /** 添加版本号*/
            this.txVersion.text = `app:${clientCore.NativeMgr.instance.getAppVersion()} ver:`;
            res.load('update/assetsid.txt').then(() => {
                if (this.txVersion)
                    this.txVersion.text += res.get('update/assetsid.txt') as string;
            })
            /** 现在直接开始*/
            this.updateView(ViewType.START);
            //添加动画
            this._bone = clientCore.BoneMgr.ins.play('res/animate/login/login.sk', 0, true, this.spEffect);
            this._bone.pos(667, 375);
        }

        private showNotice() {
            if (clientCore.GlobalConfig.isIosTest)
                return;
            this._noticePanel = this._noticePanel || new panel.NoticePanel();
            clientCore.DialogMgr.ins.open(this._noticePanel);
            this._noticePanel.once(Laya.Event.CLOSE, this, this.showPrivacy);
        }

        private showPrivacy() {
            //只有IOS官服展示隐私公示
            // if (!channel.ChannelControl.ins.isOfficial || Laya.Browser.onAndroid)
            //     return;
            // if (clientCore.GlobalConfig.isIosTest)
            //     return;
            let privacy = channel.ChannelConfig.privacy;
            if (!privacy) return;
            let haveShow = Laya.LocalStorage.getItem(privacy) == 'true';
            if (!haveShow) {
                this.alertPrivacyPanel();
            }
        }

        private alertPrivacyPanel() {
            this._privacyPanel = this._privacyPanel || new panel.PrivacyPanel();
            clientCore.DialogMgr.ins.open(this._privacyPanel);
        }


        public destroy(): void {
            this._bone?.dispose();
            this._bone = null;
            super.destroy();
            this._privacyPanel?.destroy();
            this._noticePanel?.destroy();
            if (this._srvs) {
                this._srvs.length = 0;
                if (this._srvPanel)
                    clientCore.DialogMgr.ins.close(this._srvPanel, false);
                this._srvs = this._srvPanel = this._serialPanel = this._registerPanel = this._accountPanel = this._selectSrv = null;
            }
        }

        private showLogin(e: Laya.Event): void {
            switch (channel.ChannelConfig.channelId) {
                case channel.ChannelEnum.INTERIOR:
                    this.updateView(ViewType.INSTERIOR);
                    break;
                case channel.ChannelEnum.TAOMEE:
                case channel.ChannelEnum.IOS:
                case channel.ChannelEnum.TM_H5:
                    this.updateView(ViewType.SIGNIN);
                    break;
                default:
                    channel.ChannelControl.ins.login();
                    break;
            }
        }

        private updateView(type: ViewType): void {
            this.boxLoad.visible = type == ViewType.LOADING;
            this.boxStart.visible = type == ViewType.START;
            this.boxSign.visible = type == ViewType.SIGNIN;
            this.boxServer.visible = type == ViewType.SERVER_LIST;
            this.boxInsterior.visible = type == ViewType.INSTERIOR;
        }

        private updateBar(tipStr: string, value: number): void {
            if (clientCore.GlobalConfig.isIosTest)
                this.txTip.text = '正在进入游戏，请稍后。。。'
            else
                this.txTip.changeText(tipStr);
            Laya.Tween.to(this.imgPro, { width: value / 100 * 1083 }, 300, null, Laya.Handler.create(this, () => {
                EventManager.event(globalEvent.BEAN_LOAD_PRO_SUC);
                value >= 100 && this.updateView(ViewType.START);
            }));
            Laya.Tween.to(this.imgFlower, { x: (this.imgPro.x + value / 100 * 1083) }, 300, null, null);
        }

        private onRegister(): void {
            this._registerPanel = this._registerPanel || new panel.RegPanel();
            this._registerPanel.show();
        }

        /** 内部登录*/
        private onInLogin(): void {
            if (this.inputInZh.text == "") {
                alert.showFWords("账号不能为空~");
                return;
            }
            // 内部登录
            if (channel.ChannelConfig.channelId == channel.ChannelEnum.INTERIOR) {
                window.localStorage.setItem("uid", this.inputInZh.text);
                EventManager.event(globalEvent.SYN_ACCOUNT, [Number(this.inputInZh.text), Number(this.inputAge.text)]);
                this.destroy();
            }
        }

        private onLogin(): void {
            if (this.inputZh.text == "") {
                alert.showFWords("账号不能为空~");
                return;
            }
            // 淘米登录
            if (channel.ChannelConfig.channelId == channel.ChannelEnum.TAOMEE
                || channel.ChannelConfig.channelId == channel.ChannelEnum.IOS
                || channel.ChannelConfig.channelId == channel.ChannelEnum.TM_H5) {
                //本地记录账号密码
                window.localStorage.setItem("tmAccount", this.inputZh.text);
                window.localStorage.setItem("tmPasswd", this.inputPw.text);
                EventManager.event(globalEvent.SYN_ACCOUNT, [this.inputZh.text, this.inputPw.text]);
            }
        }

        /** 展示激活码*/
        private showSerial(suc: Function): void {
            this._serialPanel = this._serialPanel || new panel.SerialPanel();
            this._serialPanel.show(suc);
        }

        /** 展示账号*/
        private showAccount(accountId: number, passWd: string): void {
            this._accountPanel = this._accountPanel || new panel.AccountPanel();
            this._accountPanel.show(accountId, passWd);
            this.inputZh.text = accountId + "";
            this.inputPw.text = passWd;
            this._registerPanel?.hide();
        }

        /** 连接getway*/
        private async onLinkGetway() {
            Log.i('GF_CLIENT', 'start link getway.');
            let uid: number = clientCore.GlobalConfig.uid;
            clientCore.LocalInfo.uid = uid;
            let ran = _.random(0, channel.ChannelConfig.getways.length - 1, false);
            let srvAdress: string = channel.ChannelConfig.getways[ran];
            if (srvAdress) {
                // 连接到getway
                this.updateView(ViewType.NONE);
                await net.connect(srvAdress, uid);
                await this.waitCheckSerial();
                await this.getSrvList();
            }
        }

        /** 获取服务器列表*/
        private async getSrvList() {
            await net.sendAndWait(new pb.cs_gateway_get_online_list({ account: this.inputZh.text })).then((data: pb.sc_gateway_get_online_list) => {
                this.updateView(ViewType.SERVER_LIST);
                this._srvs = data.onlines;
                clientCore.Logger.sendLog('数据埋点', '游戏登陆统计', '获取服务器列表成功');
                this.updateCurSrv(this.getFreeSrv(this._srvs));
            }).catch((e) => {
                if (!Laya.Render.isConchApp) {
                    alert.showSmall("服务器正在维护中哦^_^");
                    console.log('!!!!' + e);
                } else {
                    this.updateView(ViewType.START);
                    BC.addEvent(this, this.boxStart, Laya.Event.CLICK, this, this.showTSrvErr);
                    this._noticePanel ? (this._noticePanel.closeHandler = Laya.Handler.create(this, this.showTSrvErr)) : this.showTSrvErr();
                }
            })
        }

        /** 在app中显示服务器错误*/
        private showTSrvErr(): void {
            if (!Laya.Render.isConchApp || this._srvs != void 0) return;
            alert.showSmall(xls.get(xls.serverMaintenance).get(1).descInfo, {
                btnType: alert.Btn_Type.ONLY_SURE,
                needClose: false,
                clickMaskClose: false
            })
        }

        /** 更新当前服务器*/
        private updateCurSrv(msg: pb.IonlineInfo): void {
            this._selectSrv = msg;
            this.txStatus.visible = msg.status == 4;
            let _xlsData = xls.get(xls.serverName);
            let fakeId = msg['fakeId'] ? msg['fakeId'] : msg.id;
            let name = _xlsData.has(fakeId % 10000) ? _xlsData.get(fakeId % 10000).serverName : _xlsData.get(fakeId % 600)?.serverName;
            this.txSrvName.text = name ? name : ' ';
        }

        private getFreeSrv(arr: pb.IonlineInfo[]): pb.IonlineInfo {
            let array: pb.IonlineInfo[] = [];
            let arr_1: pb.IonlineInfo[] = [];
            let arr_4: pb.IonlineInfo[] = [];
            _.forEach(arr, (element: pb.IonlineInfo) => {
                if (element.status == 2 || element.status == 3) {
                    array.push(element);
                }
                if (element.status == 1) {
                    arr_1.push(element);
                }
                if (element.status == 4) {
                    arr_4.push(element);
                }
            })
            let len: number = array.length;
            if (len > 0) {
                let ran: number = _.random(0, len - 1, false);
                return array[ran];
            }
            len = arr_1.length;
            if (len > 0) {
                let ran: number = _.random(0, len - 1, false);
                return arr_1[ran];
            }
            len = arr_4.length;
            if (len > 0) {
                let ran: number = _.random(0, len - 1, false);
                return arr_4[ran];
            }
            return this.getSuitableSrv(arr);
        }


        /** 寻找合适的服务器*/
        private getSuitableSrv(arr: pb.IonlineInfo[]): pb.IonlineInfo {
            arr.sort((s1, s2) => {
                if (s1.status == 2) {
                    return -1
                }
                else if (s1.status < s2.status) {
                    return -1;
                }
                return 1;
            })
            // let ran = _.random(0, arr.length - 1, false);
            return arr[0]; //优先推荐
        }

        /** 打开服务器列表*/
        private onShowSrv(): void {
            this._srvPanel = this._srvPanel || new panel.ServerPanel();
            this._srvPanel.show(this._srvs);
        }


        private _nowLogining: boolean;
        /** 游戏登录*/
        private async onGameLogin(e: Laya.Event): Promise<void> {
            if (!this._selectSrv) {
                alert.showFWords("服务器维护中~");
                return;
            }
            if (this._selectSrv.status == 4) {
                alert.showFWords("服务器已经爆满啦QaQ");
                return;
            }
            if (this._nowLogining) {
                return;
            }
            if (e.target instanceof Laya.Image) {
                return;
            }
            clientCore.Logger.sendLog('数据埋点', '游戏登陆统计', '点击登陆');
            /** 终端 1-web 2-android 3-ios*/
            this._nowLogining = true;
            /** 查询实名认证-第一次没有查询到*/
            await channel.ChannelControl.ins.queryAntiAddiction("第二次实名认证查询...");
            net.sendAndWait(new pb.cs_gateway_enter_server({
                onlineId: this._selectSrv.id,
                account: core.SignMgr.useSign ? core.SignMgr.uid + "" : channel.ChannelConfig.channelUserID.toString(),
                channel: channel.ChannelConfig.channelId,
                subChannel: channel.ChannelConfig.subChannelId,
                token: core.SignMgr.useSign ? core.SignMgr.token : clientCore.GlobalConfig.token,
                phoneOS: Laya.Browser.onAndroid ? 2 : (Laya.Browser.onIOS ? 3 : 1),
                macAddress: clientCore.NativeMgr.instance.getIMEI(),
                isAdult: clientCore.LocalInfo.age >= 18 ? 1 : 0
            })).then((data: pb.sc_gateway_enter_server) => {
                let fakeId = this._selectSrv['fakeId'] ? this._selectSrv['fakeId'] : this._selectSrv.id;
                clientCore.GlobalConfig.serverId = this._selectSrv.id;
                clientCore.GlobalConfig.serverName = this._selectSrv.name;
                clientCore.GlobalConfig.serverShowName = this.txSrvName.text;
                window.localStorage.setItem('history_server_id', fakeId + '');
                /** 选择好服务器登录*/
                channel.ChannelControl.ins.reportRoleData(1);
                let real: clientCore.RealManager = clientCore.RealManager.ins;
                real.onlineTime = data.todayOnline;
                real.rechargeCnt = data.payCount;
                real.startServerTime = clientCore.ServerManager.curServerTime = data.curTimestamp;
                real.checkPlayGame() && this.loginSuc(data);
                this._nowLogining = false;
            }).catch(e => {
                this.loginFail('login失败');
                this._nowLogining = false;
            });
        }

        /** 登录成功*/
        private loginSuc(data: pb.sc_gateway_enter_server): void {
            clientCore.Logger.sendLog('数据埋点', '游戏登陆统计', '登陆成功');
            this.destroy();
            clientCore.LocalInfo.setUserCreate(data);
            EventManager.event(globalEvent.ENTER_GEME_SUC);
            EventManager.event("LOGIN_SUCCESS");
        }

        private loginFail(tips: string) {
            alert.showFWords(tips);
        }

        /** 等待检查激活码*/
        private waitCheckSerial(): Promise<any> {
            return new Promise((suc) => {
                net.sendAndWait(new pb.cs_get_user_code_status({ account: this.inputZh.text })).then((msg: pb.sc_get_user_code_status) => {
                    msg.result == 0 ? this.showSerial(suc) : suc();
                })
            })
        }
    }
}