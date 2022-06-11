namespace login {
    const GATE_WAYS = [
        'ws://10.1.1.220:51099',
        'ws://10.1.1.75:51097',
        'ws://10.1.8.125:21015',
        'ws://10.2.1.16:51098',
    ];
    const TW_WAYS = [
        'ws://210.244.39.40:51001'
    ]
    const GATE_NAME = [
        'dev集成网关',
        'release网关',
        'zack网关',
        '改时间(选10098服)'
    ]
    export class LoginModule extends ui.login.LoginUI {
        constructor() {
            super();
        }

        onPreloadOver() {
            this.boxSrvList.visible = false;
            this.serverList.vScrollBarSkin = null;
            this.serverList.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listGate.vScrollBarSkin = null;
            this.listGate.renderHandler = new Laya.Handler(this, this.onListRender2);
            // this.serverList.vScrollBarSkin = this.listGate.vScrollBarSkin = null;
            // this.serverList.scrollBar.elasticBackTime = 200;//设置橡皮筋回弹时间。单位为毫秒。
            // this.serverList.scrollBar.elasticDistance = 50;//设置橡皮筋极限距离。
            this.serverList.selectEnable = this.listGate.selectEnable = true;
            if (Laya.LocalStorage.getItem('uid')) {
                this.txtId.text = Laya.LocalStorage.getItem('uid');
            }
            // this.btnEnterGame.filters = [new Laya.GlowFilter('#ee62da', 9, 5, 5)];
            this.listGate.dataSource = clientCore.GlobalConfig.isTWWeb ? TW_WAYS : GATE_WAYS;
            // 有平台
            this.boxId.visible = !channel.ChannelControl.ins.hasChannel;
            this.txVersion.text = `app:${clientCore.NativeMgr.instance.getAppVersion()} ver:`;
            core.SoundManager.instance.playBgm(pathConfig.getBgmUrl('login'), true);
            res.load('update/assetsid.txt').then(() => {
                if (this.txVersion)
                    this.txVersion.text += res.get('update/assetsid.txt') as string;
            })
        }

        private onListRender(cell: Laya.Label, idx: number) {
            let data = cell.dataSource as pb.onlineInfo;
            cell.text = data.name;
            cell.color = idx == this.serverList.selectedIndex ? '#ff0000' : '#000000';
        }

        private onListRender2(cell: Laya.Label, idx: number) {
            cell.text = GATE_NAME[idx];
            cell.color = idx == this.listGate.selectedIndex ? '#ff0000' : '#000000';
        }

        private async getSrvList() {
            let uid: number = channel.ChannelControl.ins.hasChannel ? clientCore.GlobalConfig.uid : Number(this.txtId.text);
            clientCore.LocalInfo.uid = uid;
            let srvAddres = this.listGate.selectedItem;
            // await net.connect(srvAddres, Number(this.txtId.text));
            await net.connect(srvAddres, uid);
            // 这里是激活码审核
            await this.waitCheckSerial();
            await net.sendAndWait(new pb.cs_gateway_get_online_list({ account: this.txtId.text })).then((data: pb.sc_gateway_get_online_list) => {
                this.showSrvList(data);
            }).catch(e => {
                this.getSrvListFail('获取服务器列表失败');
            });
        }

        private showSrvList(data: pb.sc_gateway_get_online_list) {
            let lastHost = Laya.LocalStorage.getItem('lastHost') == null ? "" : Laya.LocalStorage.getItem('lastHost');
            this.boxSrvList.visible = true;
            this.serverList.dataSource = data.onlines;
            this.serverList.selectedIndex = _.findIndex(data.onlines, (d) => {
                return d.host == lastHost;
            })
        }

        private async startLogin() {
            if (this.serverList.selectedIndex < 0) {
                alert.showFWords('请选择服务器!');
                return;
            }
            let selectSrv = this.serverList.selectedItem as pb.onlineInfo;

            if (!channel.ChannelControl.ins.hasChannel) { //无有平台
                clientCore.GlobalConfig.token = "token";
            }
            clientCore.GlobalConfig.onlineId = selectSrv.id;
            await net.sendAndWait(new pb.cs_gateway_enter_server({
                onlineId: selectSrv.id,
                account: this.txtId.text,
                channel: channel.ChannelConfig.channelId,
                subChannel: channel.ChannelConfig.subChannelId,
                token: clientCore.GlobalConfig.token,
                phoneOS: Laya.Browser.onAndroid ? 2 : 1,
                macAddress: clientCore.NativeMgr.instance.getIMEI(),
                isAdult: clientCore.LocalInfo.age >= 18 ? 1 : 0
            })).then((data) => {
                clientCore.GlobalConfig.serverId = selectSrv.id;
                clientCore.GlobalConfig.serverName = selectSrv.name;
                let real: clientCore.RealManager = clientCore.RealManager.ins;
                real.onlineTime = data.todayOnline;
                real.rechargeCnt = data.payCount;
                real.startServerTime = clientCore.ServerManager.curServerTime = data.curTimestamp;
                real.checkPlayGame() && this.loginOk(data);
            }).catch(e => {
                this.loginFail('login失败');
            });
        }

        private getSrvListFail(tips: string) {
            alert.showFWords(tips);
            this.btnEnterGame.once(Laya.Event.CLICK, this, this.getSrvList);
        }

        private loginOk(data: pb.sc_gateway_enter_server) {
            Laya.LocalStorage.setItem('uid', this.txtId.text);
            Laya.LocalStorage.setItem('lastHost', this.serverList.selectedItem.host);
            clientCore.LocalInfo.setUserCreate(data);
            EventManager.event("LOGIN_SUCCESS");
            this.destroy();
        }

        private loginFail(tips: string) {
            alert.showFWords(tips);
            this.btnSure.once(Laya.Event.CLICK, this, this.startLogin);
        }

        /** 等待审核验证码*/
        private waitCheckSerial(): Promise<any> {
            return new Promise((success) => {
                net.sendAndWait(new pb.cs_get_user_code_status({ account: this.txtId.text })).then((msg: pb.sc_get_user_code_status) => {
                    msg.result == 0 ? clientCore.ModuleManager.open("serial.SerialModule", success) : success();
                })
            })
        }

        private onCloseSrvList() {
            net.close()
            this.boxSrvList.visible = false;
        }

        addEventListeners() {
            super.addEventListeners();
            this.btnEnterGame.on(Laya.Event.CLICK, this, this.getSrvList);
            this.btnSure.once(Laya.Event.CLICK, this, this.startLogin);
            this.sp.on(Laya.Event.CLICK, this, this.onCloseSrvList);
        }

        removeEventListeners() {
            super.removeEventListeners();
        }
    }
}