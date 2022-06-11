class GameMain {

    constructor() { this.init(); }

    async init() {
        if (clientCore.GlobalConfig.isH5) {
            Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
            Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
        } else {
            Laya.init(1334, 750, Laya.WebGL);
            let ratio = Laya.Browser.width / Laya.Browser.height;
            Laya.stage.scaleMode = ratio < 16 / 9 ? Laya.Stage.SCALE_SHOWALL : Laya.Stage.SCALE_FIXED_HEIGHT;
            Laya.stage.alignV = 'middle';
        }
        Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
        Laya.stage.frameRate = "fast";
        this.patch();
        if (clientCore.GlobalConfig.isIosTest) {
            clientCore.GlobalConfig.isGuideOpen = false;
        }
        /** 代签登陆 */
        this.initSignLogin();
        //启动资源版本
        // await this.enableVersion();
        //加载loading界面
        await this.initLoading();
        // 这里注入渠道信息
        this.injectChannelInfo();
        //加载剩余资源
        let time = Date.now();
        clientCore.LoadingManager.show('');
        await this.initRestLoading();
        // 这里关闭启动图 开始使用loading'
        await client.initAppBean(client.appBeansBeforeLogin, true);
        //如果不足1s 强行加载到1s
        let diff = 1000 - (Date.now() - time);
        if (diff > 0)
            await util.TimeUtil.awaitTime(diff);
        clientCore.LoadingManager.hide();
        // 检查
        core.SignMgr.useSign && alert.showSmall("请注意，当前环境处于代理~");
        //获取版本号并缓存
        clientCore.GlobalConfig.appVer = clientCore.NativeMgr.instance.getAppVersion();
        // 这里打开登录
        await this.waitOpenLogin();
        if (!core.SignMgr.useSign) {
            //判断版本
            let appVerOk = this.checkAppVerOk();
            if (!appVerOk) {
                let tips: string = channel.ChannelConfig.channelId == channel.ChannelEnum.SAMSUNG
                    ? '您的游戏版本过低，请卸载后前往应用商店下载最新版本后再进行游戏！' : '您的游戏版本过低，请卸载后下载最新版本后再进行游戏！';

                let vi = alert.showSmall(tips, {
                    btnType: alert.Btn_Type.ONLY_SURE,
                    needClose: false,
                    clickMaskClose: false
                });
                if (window['appcache'] && window['appcache'].setResourceID) {
                    window['appcache'].setResourceID('netassetsid', '');
                }
                vi.btnSure.offAll();
                return;
            }
        }

        // 这里等待渠道初始化
        clientCore.Logger.sendLog('u8相关', '游戏登陆统计', `开始登录渠道${channel.ChannelConfig.channelId}`);
        clientCore.Logger.sendLog('数据埋点', '游戏登陆统计', `开始登录渠道`);
        await this.waitChannelLogin();
        clientCore.Logger.sendLog('u8相关', '游戏登陆统计', `渠道登录成功${channel.ChannelConfig.channelId}`);
        clientCore.Logger.sendLog('数据埋点', '游戏登陆统计', `渠道登录成功`);
        //代签的话 直接绕过登录服务器
        if (!core.SignMgr.useSign) await this.waitLoginServer();
        if (channel.ChannelControl.ins.isInterior) {
            await this.waitLoginComplete();
        } else {
            // 这里检查zip更新
            // zip更新去掉惹 换成整包
            // await clientCore.ZipManager.ins.setup();
            await this.waitEnterGame();
        }
        if (!clientCore.LocalInfo.createdFlg) {
            await this.waitRoleCreate();
        }
        //启动游戏发动机
        clientCore.GameEngine.start();
        //login 后的初始化bean
        await client.initAppBean(client.appBeansAfterLogin, true);
        //进入游戏
        this.enterGame();
    }

    private async enableVersion(): Promise<void> {
        Laya.URL.customFormat = (url: string) => {
            let newUrl: string = Laya.URL.version["/" + url];
            if (!((<any>window)).conch && newUrl) url += "?v=" + newUrl;
            return url;
        }
        let ret: number = await clientCore.JsMgr.loadVer();
        ret == -1 && console.error('版控文件加载失败~');
    }

    private enterGame(): void {
        core.GameConfig.enterGame = true;
        clientCore.LayerManager.enableClickEffect();
        clientCore.NativeMgr.instance.tracking('login');
        channel.ChannelControl.ins.reportRoleData(3);
        EventManager.event(globalEvent.ENTER_GEME);
        EventManager.event("start_get_server_time");
    }

    private checkAppVerOk() {
        if (channel.ChannelConfig.channelId == channel.ChannelEnum.INTERIOR) return true;
        //ios测试服，暂时开启
        if (Laya.Browser.onIOS) {
            return true;
        }
        // alert.showSmall('channelid:' + channel.ChannelConfig.channelId);
        let config = xls.get(xls.channelInfo).get(channel.ChannelConfig.channelId);
        return this.checkVersionOkByMinVersion(config.lowVersion);
        // //可登录的最低版本号
        // let officalVer = '3.3.1';
        // let unOfficalVer = '3.3.1';
        // //三星要求强更 所以最低版本为4.0.2
        // if (channel.ChannelConfig.channelId == channel.ChannelEnum.SAMSUNG) {
        //     unOfficalVer = '4.0.2';
        // }
        // //bilibili要求强更 所以最低版本为4.0.5
        // if (channel.ChannelConfig.channelId == channel.ChannelEnum.BILIBILI) {
        //     unOfficalVer = '4.0.5';
        // }

        // if (channel.ChannelControl.ins.isOfficial) {
        //     return this.checkVersionOkByMinVersion(officalVer);
        // }
        // else {
        //     return this.checkVersionOkByMinVersion(unOfficalVer);
        // }
    }

    /**根据传入的最小版本判断是否能进入游戏 */
    private checkVersionOkByMinVersion(ver: string) {
        if (!clientCore.GlobalConfig.isApp)
            return true;
        let appVer = clientCore.NativeMgr.instance.getAppVersion().replace(/\./g, '');
        let targetVer = ver.replace(/\./g, '');
        return parseInt(appVer) >= parseInt(targetVer);
    }

    private onGoHtml() {
        clientCore.NativeMgr.instance.openUrl('http://xhx.61.com/');
    }

    private async waitOpenLogin() {
        await clientCore.ModuleManager.open("login2.LoginModule");
    }

    initSignLogin() {
        let paramStr = window.location.search;
        if (paramStr.length > 0) {
            paramStr = paramStr.substring(1);
            console.log(paramStr);
            let valuesArr = paramStr.split("&");
            for (let str of valuesArr) {
                let strArr = str.split("=");
                if (strArr[0] == "uid") {
                    core.SignMgr.useSign = true;
                    core.SignMgr.uid = parseInt(strArr[1]);
                    break;
                }
            }
        }
        if (core.SignMgr.useSign) {
            let official: string = channel.getQureyString('official');
            core.SignMgr.official = !official || official == '1';
            clientCore.GlobalConfig.uid = core.SignMgr.uid;
            console.log("代签登陆的UID：" + core.SignMgr.uid);
        }
    }

    /** 注入渠道信息*/
    private injectChannelInfo(): void {
        if (clientCore.GlobalConfig.isApp) {
            let packName: string = clientCore.NativeMgr.instance.getAppName();
            packName = core.SignMgr.useSign ? "com.taomee.huahios" : packName;
            let xlsData: xls.channelInfo = clientCore.ChannelInfo.getInfoByName(packName);
            if (!xlsData) {
                console.log("channelInfo.xls未设置包名：" + packName);
                return;
            }
            channel.ChannelConfig.channelId = xlsData.channelId;
            channel.ChannelConfig.channelName = xlsData.channelName;
            channel.ChannelConfig.isShare = xlsData.shareFlag == 1;
            channel.ChannelConfig.privacy = xlsData.privacy;
            //渠道是否需要游戏方实名认证 0-不需要 1-需要
            if (xlsData.isRealname == 0 && channel.ChannelConfig.channelId == channel.ChannelEnum.VIVO) {
                channel.ChannelConfig.age = clientCore.LocalInfo.age = 36;
            }
        } else {
            if (clientCore.GlobalConfig.isH5) {
                channel.ChannelConfig.channelId = channel.ChannelEnum.TM_H5;
                channel.ChannelConfig.channelName = 'taomee-h5';
            } else if (!clientCore.GlobalConfig.isInnerNet) {
                channel.ChannelConfig.channelId = 1;
                channel.ChannelConfig.channelName = "taomee-web";
            }
        }
        clientCore.Logger.sendLog('数据埋点', '游戏登陆统计', `完成数据加载${channel.ChannelConfig.channelId}`);
    }

    /** 等待渠道登录*/
    private waitChannelLogin() {
        return new Promise((suc) => {
            channel.ChannelControl.ins.init(Laya.Handler.create(this, () => { suc(); }));
        })
    }

    /** 等待服务器登录*/
    private waitLoginServer() {
        return new Promise((success) => {
            channel.ChannelControl.ins.loginServer(Laya.Handler.create(this, function (data: any): void {
                data = JSON.parse(data).body;
                if (!data || !data.uid) {
                    alert.showFWords("平台登录失败了~");
                } else {
                    clientCore.GlobalConfig.uid = core.SignMgr.useSign ? core.SignMgr.uid : data.uid;
                    clientCore.GlobalConfig.token = data.token;
                    success();
                }
            }))
        })
    }

    /** 等待进入游戏*/
    private waitEnterGame(): Promise<void> {
        return new Promise((suc) => {
            EventManager.once(globalEvent.ENTER_GEME_SUC, this, () => {
                suc();
            });
            Log.i('GF_CLIENT', 'LINK_GETWAY');
            EventManager.event(globalEvent.LINK_GETWAY);
        })
    }

    private async waitLoginComplete(): Promise<any> {
        return new Promise((ok) => {
            EventManager.once("LOGIN_SUCCESS", this, () => {
                ok();
            })
            clientCore.ModuleManager.open('login.LoginModule');
        });
        let uid: number = channel.ChannelControl.ins.hasChannel ? clientCore.GlobalConfig.uid : parseInt(Laya.LocalStorage.getItem('uid'));
        clientCore.LocalInfo.uid = uid;
        // let srvAddres = 'ws://111.231.67.127:51001';
        let srvAddres = 'ws://49.234.133.18:51001';
        await net.connect(srvAddres, uid);
        await net.sendAndWait(new pb.cs_gateway_get_online_list({ account: Laya.LocalStorage.getItem('uid') })).then((data: pb.sc_gateway_get_online_list) => {
        }).catch(e => {
            alert.showFWords('获取服务器列表失败');
        });
        return net.sendAndWait(new pb.cs_gateway_enter_server({ onlineId: 9999, account: Laya.LocalStorage.getItem('uid'), channel: channel.ChannelConfig.channelId, token: clientCore.GlobalConfig.token })).then((data) => {
            clientCore.LocalInfo.setUserCreate(data);
            EventManager.event("LOGIN_SUCCESS");
        }).catch(e => {
            alert.showFWords('登录失败');
        });
    }
    private waitRoleCreate(): Promise<any> {
        return new Promise((ok) => {
            EventManager.on(globalEvent.ROLE_CREATE_SUCC, this, () => {
                ok();
            })
            clientCore.ModuleManager.open("roleCreate.RoleCreateModule");
        });
    }
    private async initLoading() {
        //-----------------------------------------------------------
        //加载必要项（loading  alert）
        await Promise.all([
            res.load('unpack.json'),//未打包图集的大图url表
            res.load(`atlas/loading.atlas`),
            xls.load(xls.loadingTips),
            xls.load(xls.characterId),
            xls.load(xls.channelInfo),
        ]);
        clientCore.LayerManager.setup();
        clientCore.LoadingManager.setup();
        // clientCore.ResizeMgr.instance.configure();
    }

    private async initRestLoading() {
        //系统config
        let loadArr = [
            xls.load(xls.moduleOpen),
            xls.load(xls.holidayInfo),
            res.load('atlas/alert.atlas'),
            res.load('atlas/commonRes.atlas'),
            res.load('atlas/commonBtn.atlas'),
            res.load('atlas/commonPanel.atlas'),
            res.load('atlas/download.atlas')
        ];
        for (let i = 0; i < loadArr.length; i++) {
            clientCore.LoadingManager.setLoading('正在进入游戏。。。', i / loadArr.length * 100);
            await loadArr[i];
        }
        clientCore.ModuleManager.setup();
        clientCore.UnpackJsonManager.setUp();
        clientCore.MaskManager.setup();
    }

    private patch() {
        //预加载汉仪中圆简字体
        if (!clientCore.GlobalConfig.isApp) {
            let text = new Laya.Text();
            text.fontSize = 40;
            text.color = "#FF00FF";
            text.text = "赟";
            text.font = "汉仪中圆简";
            text.visible = false;
            Laya.stage.addChild(text);
        }
        //组件注册
        Laya.View.regComponent("HuaButton", component.HuaButton);
        //音乐设置
        core.SoundManager.instance.initByLocalCache();
        //注册退出
        clientCore.NativeMgr.instance.listenExit();
        //预加载家园地图
        // Laya.loader.load(pathConfig.getMapPath(1));
        //防止图片加载慢，destroy后再加载完成会有问题
        Laya.Image.prototype['setSource'] = function setSource(url: string, img: any = null) {
            if (url === this._skin && img && this._bitmap) {
                this.source = img
                this.onCompResize();
            }
        }
        Laya.AudioSoundChannel.prototype.play = function play() {
            this.isStopped = false;
            try {
                this._audio.playbackRate = Laya.SoundManager.playbackRate;
                this._audio.currentTime = this.startTime;
            } catch (e) {
                this._audio.addEventListener("canplay", this._resumePlay as any);
                return;
            }
            Laya.SoundManager.addChannel(this);
            Laya.Browser.container.appendChild(this._audio);
            if ("play" in this._audio && (this._audio.src.indexOf('mp3') > -1 || this._audio.src.indexOf('ogg') > -1))
                this._audio.play();
        }
        Laya.AudioSoundChannel.prototype.resume = function resume() {
            if (!this._audio)
                return;
            this.isStopped = false;
            Laya.SoundManager.addChannel(this);
            if ("play" in this._audio && (this._audio.src.indexOf('mp3') > -1 || this._audio.src.indexOf('ogg') > -1))
                this._audio.play();
        }
    }
}


new GameMain();