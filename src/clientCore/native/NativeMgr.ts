namespace clientCore {
    export class NativeMgr {
        private static _ins: clientCore.NativeMgr;
        private _nativeObj: core.Native;

        static get instance() {
            this._ins = this._ins || new clientCore.NativeMgr();
            return this._ins;
        }

        constructor() {
            this._nativeObj = new core.Native();
            EventManager.on(globalEvent.IOS_COPY_OVER, this, this.copyBack);
        }

        private copyBack() {
            alert.showFWords("复制成功");
        }

        setuid() {
            this._nativeObj.callFun('setUID', clientCore.LocalInfo.uid.toString());
        }

        sendLog(log: string) {
            this._nativeObj.callFun('testLog', log);
        }

        /**
         * 检查某个安卓权限是否存在
         * @param permissionName 
         * @return 2-没有检测 1-没有权限 0-有权限
         */
        checkPermission(permissionName: string): number {
            return this._nativeObj.callFun("checkPermission", permissionName);
        }

        /**获取包名 */
        getAppName(): string {
            return this._nativeObj.callFun('getPackName') as string;
        }

        /**打开浏览器 */
        openUrl(url: string, close: boolean = true) {
            if (window['conch']) {
                window['conch'].setExternalLinkEx(url, Laya.Browser.clientWidth * 0.1, 0, Laya.Browser.clientWidth * 0.8, Laya.Browser.clientHeight, close);
                Laya.stage.once(Laya.Event.MOUSE_DOWN, null, () => {
                    window['conch']?.closeExternalLink();
                })
            }
        }

        /**获取appVersionName */
        getAppVersion() {
            if (GlobalConfig.isApp) {
                let verName = this._nativeObj.callFun('getAppVersion') as string;
                if (verName && verName.indexOf('java.lang') > -1) {
                    return '';
                }
                return verName;
            }
            else {
                return 'web';
            }
        }

        /**
         * 执行渠道相关操作
         * @param type login|pay|report|queryAntiAddiction|realNameRegister|loginGF
         * @param params 
         * @param handler 
         */
        dispath(type: string, params: object, handler?: Laya.Handler) {
            this._nativeObj && this._nativeObj.dispathChannel(type, params, handler)
        }

        /** U8登出*/
        u8_logout(): void {
            this._nativeObj && this._nativeObj.callFun("logout");
        }

        /** U8退出*/
        u8_exit(): void {
            this._nativeObj && this._nativeObj.callFun("exit");
        }

        /** 获取联运平台的子渠道号*/
        getLogicChannel(): number {
            let channel: number = 0;
            if (GlobalConfig.isApp) {
                channel = this._nativeObj.callFun("getLogicChannel");
            }
            return channel;
        }

        /**
         * zip更新
         * @param url 
         * @param complete 执行结束 
         * @param progress 进度
         */
        updateByZip(url: string, start?: Laya.Handler, complete?: Laya.Handler, progress?: Laya.Handler): void {
            let updateByZip = window["updateByZip"];
            if (updateByZip) {
                updateByZip(url, (event: string, downloadPercent: number, curfile: string) => {
                    switch (event) {
                        //下载中，这时候downloadPercent有值
                        case "downloading":
                            progress && progress.runWith(downloadPercent);
                            break;
                        //下载错误
                        case "downloadError":
                            complete && complete.runWith("fail");
                            break;
                        //下载成功
                        case "downloadOK":
                            break;
                        //更新中，这时候 curfile有值，表示正在更新的文件
                        case "updating":
                            util.print("js client: ", "update success", curfile);
                            break;
                        //curfile更新错误。因为curfile不在dcc列表，或者文件内容与dcc内容不一致。少量更新错误可以忽略，因为在实际使用的时候还是会下载
                        case "updateError":
                            util.print("js client: ", "update error", curfile);
                            break;
                        default:
                            break;
                    }
                }, (localFile: string) => {
                    // 删除zip包
                    this.deleteFile(localFile);
                    // 更新完成的回调
                    complete && complete.runWith("success")
                });
            }
        }

        downloadBigFile(url: string): void {
            let conch = window['conch'];
            let downloadBigFile = window['downloadBigFile'];
            if (conch && downloadBigFile) {
                let cachePath: string = conch.getCachePath();
                let localFile: string = cachePath + url.substr(url.lastIndexOf('/'));
                console.log(cachePath);
                downloadBigFile(url, localFile,
                    (total: number, now: number, speed: number) => { //下载进度
                        console.log('download progree: ' + Math.floor((now / total) * 100));
                    },
                    (curlret: number, httpret: number) => { //下载结束
                        if (curlret != 0 || httpret < 200 || httpret >= 300) {
                            console.error('download error!!');
                        } else {
                            console.log('download ok!!');
                            console.log(localFile);
                        }
                    }, 10, 100000000)
            }
        }

        getIMEI(): string {
            if (Laya.Browser.onIOS) {
                let localIdfa = Laya.LocalStorage.getItem('IDFA');
                if (localIdfa)
                    return localIdfa;
                else {
                    try {
                        let idfa = this._nativeObj.callFun('getIDFA') as string;
                        Laya.LocalStorage.setItem('IDFA', idfa);
                        return idfa;
                    } catch (error) {
                        return '';
                    }
                }
            }
            else {
                //先拿androidId的md5
                let androidId = this._nativeObj.callFun('getAndroidId') as string;
                androidId = androidId ? util.Md5Util.encrypt(androidId) : '';
                //没有再拿mac地址的md5
                let mac = this._nativeObj.callFun('getMac') as string;
                mac = mac ? util.Md5Util.encrypt(mac.replace(/:/g, '')) : '';
                //没有再拿imei码（15-17位的数字）
                let imei = this._nativeObj.callFun('getIMEI') as string;
                if (/^[0-9]*$/.test(imei)) {
                    //微博的md5后转大写
                    if (channel.ChannelConfig.subChannelId == channel.subChannelEnum.微博A || channel.ChannelConfig.subChannelId == channel.subChannelEnum.微博B) {
                        imei = util.Md5Util.encrypt(imei).toUpperCase();
                    }
                    //抖音的直接md5
                    if (channel.ChannelConfig.subChannelId == channel.subChannelEnum.抖音A || channel.ChannelConfig.subChannelId == channel.subChannelEnum.抖音B) {
                        imei = util.Md5Util.encrypt(imei);
                    }
                }
                else {
                    imei = '';
                }
                let arr = _.filter([androidId, mac, imei], (s) => { return s.length > 0 });
                return arr.join(',');
            }
        }

        /**
         * 删除安卓包体内的文件
         * @param filename 
         */
        deleteFile(filename: string): void {
            if (Laya.Render.isConchApp && Laya.Browser.onAndroid) {
                this._nativeObj?.callFun("deleteFile", filename);
            }
        }

        listenExit(): void {
            let conch: any = Laya.Browser.window.conch;
            if (!conch) return;
            conch.setOnBackPressedFunction(() => {
                channel.ChannelControl.ins.exitGame();
            })
        }

        initIAP() {
            this._nativeObj?.dispathChannel('initIAP:', '5', null);
        }

        /**结束订单ios */
        finishTransation(transationId: string) {
            //这里用json转一下，transationId是个很长的数字，如果直接传字符串，oc那边不好弄
            this._nativeObj?.dispathChannel('finishTransation:', { transId: transationId }, null);
        }

        /**查询所有商品ios */
        requestAllProductInfo(ids: any[]) {
            this._nativeObj?.dispathChannel('requestAllProductInfo:', { ids: ids }, null);
        }

        /**
         * 热云统计
         * 如果是自定义事件 传eventStr
         */
        tracking(action: 'login' | 'reg' | 'event', eventStr?: string) {
            let cmdName = `tracking_${action}`;
            if (Laya.Browser.onIOS)
                cmdName += ':';
            if (action != 'event') {
                this._nativeObj?.dispathChannel(cmdName, clientCore.LocalInfo.uid.toString(), null);
            }
            else {
                this._nativeObj?.dispathChannel(cmdName, eventStr, null);
            }
        }

        /**
         * 热云初始化
         * @param channelId 
         * @param debug 是否为调试模式
         */
        tracking_init(channelId: string, debug?: boolean): void {
            if (Laya.Browser.onAndroid) { //仅安卓需要
                this._nativeObj?.dispathChannel('tracking_init', channelId, null);
                this._nativeObj?.dispathChannel('tracking_debug', debug ? "true" : "false", null);
            }
        }

        /**
         * 打开系统浏览器
         * @param url 
         */
        openSystemBrower(url: string): void {
            Laya.Browser.onAndroid && this._nativeObj?.callFun("openSystemBrower", url);
        }

        /**
         * 查询google支付的所有商品信息
         * @param param 
         */
        queryProducts(param: string): void {
            this._nativeObj?.callFun("queryProducts", param);
        }

        /**
         * 分享文字
         * @param platform 要分享的平台：wechat：微信好友；wechatTimeLine：微信朋友圈；qq：qq好友；qZone：qq空间；sina：微博
         * @param title 标题
         * @param content 内容
         */
        shareText(platform: string, _title: string, _content: string) {
            if (!GlobalConfig.canShare) {
                alert.showSmall("应用版本低，请先去升级~");
                return;
            }
            console.log("分享文字");
            this._nativeObj?.dispathChannel('shareAppText:', { platform: platform, title: _title, content: _content }, null);
        }

        /**
         * 分享图片
         * @param base64Str 图片转化的base64字符串
         * @param platform 要分享的平台：wechat：微信好友；wechatTimeLine：微信朋友圈；qq：qq好友；qZone：qq空间；sina：微博
         * @param flag 屏幕状态：shuping：竖屏；hengping：横屏
         */
        shareImage(base64Str: string, platform: 'wechat' | 'wechatTimeLine' | 'qq' | 'qZone' | 'sina' | string, flag: 'shuping' | 'hengping') {
            if (!GlobalConfig.canShare) {
                alert.showSmall("应用版本低，请先去升级~");
                return;
            }
            console.log("分享截图");
            let str = base64Str.split(",")[1];
            str = str.replace("\r", "");
            str = str.replace("\n", "");
            if(Laya.Browser.onAndroid){
                this._nativeObj?.dispathChannel('shareImage',{ platform: platform, image: str, flag: flag },new Laya.Handler(this,()=>{ }));
                EventManager.event('ios_share_over');
            }else{
                this._nativeObj?.dispathChannel('shareAppImag:', { platform: platform, image: str, flag: flag }, null);
            }
        }

        /**保存图片到相册
         * @param base64Str 图片转化的base64字符串
         * @param flag 屏幕状态：shuping：竖屏；hengping：横屏
         */
        saveImage(base64Str: string, flag: 'shuping' | 'hengping') {
            if (!GlobalConfig.canShare) {
                alert.showSmall("应用版本低，请先去升级~");
                return;
            }
            let str = base64Str.split(",")[1];
            str = str.replace("\r", "");
            str = str.replace("\n", "");
            if(Laya.Browser.onAndroid){
                this._nativeObj?.callFun('saveImageToGallery',str);
            }else{
                this._nativeObj?.dispathChannel('saveImgToNative:', { image: str, flag: flag }, null);
            }
        }

        /**
         * 复制
         */
        copyStr(content: string) {
            // if (!GlobalConfig.canShare) {
            //     alert.showSmall("应用版本低，请先去升级~");
            //     return;
            // }
            // console.log("复制内容");
            this._nativeObj?.dispathChannel('copyToPasteboard:', { content: content }, null);
        }

        /**
         * 添加通知
         */
        addNotice(key: string, _title: string, content: string, hour: number, minute: number) {
            if (Laya.Browser.onIOS) {
                this._nativeObj?.dispathChannel('addLocalNotice:', { noticeId: key, title: _title, body: content, hour: hour, minute: minute }, null);
            }
        }

        /**
         * 获取所有通知
         */
        getAllNotice() {
            if (Laya.Browser.onIOS) {
                this._nativeObj?.dispathChannel('getNoticeAllId:', null, null);
            }
        }

        /**
         * 移除通知
         */
        removeNotice(ids: string[]) {
            if (Laya.Browser.onIOS) {
                this._nativeObj?.dispathChannel('removeNoticeWithId:', { ids: ids }, null);
            }
        }
    }
}