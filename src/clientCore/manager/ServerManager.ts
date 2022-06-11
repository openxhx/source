
namespace clientCore {
    /**
     * 服务器
     */
    const HERRT_DELAY_TIME: number = 40000;
    const RECONNECT_TRY_TIMES: number = 3;
    const RECONNECT_DELAY_TIME: number = 5000;

    export class ServerManager {

        /** 时间间隔*/

        constructor() { }

        /** 是否被封号了*/
        public static isBlockade: boolean = false;

        public static restaring: boolean = false;
        public static reconnecting: boolean = false;
        private static serverSystemTime: number;//服务器时间，每次心跳的时候更新
        private static localSystemTime: number = 0;//每次心跳结束，会重新获得这个本地时间
        // private static preSystemTime:number = 0;//用这个preSystemTime记上一帧本地时间（现在如果玩家改时间，那么两帧之间的时间大于1S。就从后台重新同步时间）
        /**当前服务器时间（实时刷新）单位秒 */
        public static curServerTime: number = Math.floor(new Date().getTime() / 1000);

        private static _timeTxt: Laya.Text;

        public static setup(): void {
            net.listen(pb.sc_notify_error, this, this.onServerError);//后台系统错误时触发
            net.listen(pb.sc_kick_off_user, this, this.onKickOff);//后台系统错误时触发
            net.listen(pb.sc_user_akick_status, this, this.onBanUser);//封号
            net.listen(pb.sc_user_shutup_status, this, this.onShutUp);//禁言
            net.listen(pb.sc_system_notify, this, this.onSystemNotify);
            net.listen(pb.sc_gm_notify_user, this, this.onGMNotify);//gm公告
            EventManager.on(globalEvent.CONNECT_CLOSE, this, this.onSocketClose);
            // EventManager.on('start_get_server_time', this, this.onLogined);

            if (!clientCore.GlobalConfig.isApp) {
                this._timeTxt = new Laya.Text();
                this._timeTxt.fontSize = 25;
                this._timeTxt.color = '#ffffff';
                clientCore.LayerManager.systemLayer.addChild(this._timeTxt);
            }
        }

        private static updateServerTime() {
            if (this.localSystemTime > 0) {
                let curSystemTime = new Date().getTime();
                /**如果把本地时间调前 */
                if (curSystemTime < this.localSystemTime) {
                    this.localSystemTime = curSystemTime;
                    this.serverSystemTime = this.curServerTime;
                    return;
                }
                let disTime = Math.floor((curSystemTime - this.localSystemTime) / 1000);
                this.curServerTime = this.serverSystemTime + disTime;
            }
            if (this._timeTxt) {
                this._timeTxt.text = util.TimeUtil.formatData(util.TimeUtil.formatSecToDate(this.curServerTime)) + `\n账号:${Laya.LocalStorage.getItem('uid')}\nUID:${clientCore.LocalInfo.uid}`;
            }
        }


        public static showTxt(): void {
            if (this._timeTxt) {
                this._timeTxt.visible = !this._timeTxt.visible;
            }
        }


        public static async onSocketClose() {
            //停心跳    
            Laya.timer.clear(this, this.onHeart);
            if (this.restaring || this.reconnecting || this.isBlockade)
                return;
            clientCore.LoadingManager.showSmall(`失去网络，正在重新连接`);
            //暂停协议超时等待
            net.pauseAllwait();
            //尝试多次重连
            this.reconnecting = true;
            let reconnectOk = false;
            for (let i = 1; i <= RECONNECT_TRY_TIMES; i++) {
                let ok = await net.reconnect();
                if (ok) {
                    reconnectOk = true;
                    break;
                }
                else {
                    clientCore.LoadingManager.showSmall(`网络断开，正在尝试第${i}次重新连接`);
                    await util.TimeUtil.awaitTime(RECONNECT_DELAY_TIME);
                }
            }
            if (reconnectOk) {
                if (core.GameConfig.enterGame) {
                    //重连成功，且在游戏中，要给后台发这条重连协议
                    net.sendAndWait(new pb.cs_gateway_player_reconnect({
                        token: clientCore.GlobalConfig.token,
                        channel: channel.ChannelConfig.channelName,
                        onlineId: clientCore.GlobalConfig.onlineId
                    }), true).then((msg: pb.sc_gateway_player_reconnect) => {
                        //先暂时关闭当前开着的所有haiy面板 
                        ModuleManager.closeAllOpenModule();
                        DialogMgr.ins.closeAllDialog();
                        MapManager.enterHome(LocalInfo.uid);
                        //重连之后申请补单一次
                        // net.send(new pb.cs_active_user_unfinish_order());
                        this.resumeNetState();
                        //重连检查是否有补单的
                        net.send(new pb.cs_active_user_unfinish_order());
                    }).catch(() => {
                        this.restart('连接服务器超时，请检查您的网络状况')
                    });
                }
                else {
                    //还没有进游戏，恢复网络状态就行
                    this.resumeNetState();
                }
            }
            else {
                this.restart('连接服务器超时，请检查您的网络状况');
            }
        }

        private static resumeNetState() {
            clientCore.LoadingManager.hideSmall();
            //恢复协议
            net.resumeAllWait();
            //恢复心跳
            Laya.timer.loop(HERRT_DELAY_TIME, this, this.onHeart);
            this.reconnecting = false;
        }

        private static onServerError(data: pb.sc_notify_error) {
            this.restart('已和服务器失去链接 \n 原因:' + data.desc);
        }

        private static onKickOff(data: pb.sc_kick_off_user) {
            let str: string;
            switch (data.reason) {
                case 1:
                    str = '违反游戏相关规定';
                    break;
                case 2:
                    str = '该账号重复登录';
                    break;
                case 3:
                    str = '长期没有行动';
                    break;
                case 4:
                    str = '服务器维护';
                    break;
                case 5:
                    str = '账号已被封停';
                    this.isBlockade = true;
                    break;
                case 6:
                    str = '账号违反社区规定';
                    break;
                case 7:
                    str = '服务器维护';
                    break;
                default:
                    break;
            }

            if (data.reason == 5) { //账号被封
                this.restart("您的账号涉嫌违规现已暂时冻结，有疑问请联系客服~");
            } else if (data.reason == 1) { //防沉迷
                this.restart('亲爱的玩家，根据国家相关法规规定，未成年玩家只能在周五、周六、周日和法定节假日每日20:00~21:00上线。请您合理安排游戏时间，劳逸结合。');
            } else {
                this.restart('由于' + str + '\n 现已退出游戏');
            }
        }

        private static restart(info: string) {
            if (!this.restaring) {
                alert.showRestart(info);
                this.restaring = true;
            }
        }

        private static onBanUser(data: pb.sc_user_akick_status) {
            this.isBlockade = true;
            // let reason = data.reasonDesc;
            // if (reason) {
            //     this.restart(`您因${data.reasonDesc}被封禁账号至\n${util.TimeUtil.analysicTime((data.startTime + data.duration) / 1000)}`);
            // }
            // else {
            //     this.restart(`您的账号封禁至\n${util.TimeUtil.analysicTime(data.startTime + data.duration)}`);
            // }
            this.restart("您的账号涉嫌违规现已暂时冻结，有疑问请联系客服~");
        }

        private static onShutUp() {

        }

        private static onSystemNotify(data: pb.sc_system_notify) {
            alert.showSystemNotice(data.content);
        }

        private static onGMNotify(data: pb.sc_gm_notify_user) {
            if (data && data.content)
                alert.showScrollWords('[系统公告]' + data.content);
        }

        private static onHeart(): void {
            if (core.GameConfig.enterGame)
                // 发送服务器心跳
                net.sendAndWait(new pb.cs_sync_user_online()).then((data: pb.sc_sync_user_online) => {
                    this.serverSystemTime = data.SvrNowTime;
                    this.curServerTime = this.serverSystemTime;
                    this.localSystemTime = (new Date()).getTime();
                });
        }

        static getSrvTimeRightNow() {
            Laya.timer.loop(HERRT_DELAY_TIME, this, this.onHeart);
            Laya.timer.frameLoop(3, this, this.updateServerTime);
            net.sendAndWait(new pb.cs_get_server_time()).then((data: pb.sc_get_server_time) => {
                this.serverSystemTime = data.time;
                this.curServerTime = this.serverSystemTime;
                this.localSystemTime = (new Date()).getTime();
            })
        }

        /**获取周更新时间 */
        static getWeekUpdataSec() {
            let cur = util.TimeUtil.formatSecToDate(clientCore.ServerManager.curServerTime);
            let disDay = cur.getDay() >= 5 ? cur.getDay() - 5 : cur.getDay() + 2;
            let updata = clientCore.ServerManager.curServerTime - disDay * util.TimeUtil.DAYTIME;
            return util.TimeUtil.floorTime(updata);
        }
    }
}