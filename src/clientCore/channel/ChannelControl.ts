namespace channel {
    export class ChannelControl {
        /** 平台id*/
        private channelId: number;
        /** 当前平台*/
        private currChannel: BaseChannel;

        constructor() {
        }

        /**
         * 平台初始化
         * @param handler 完成回调 
         */
        public async init(handler: Laya.Handler) {
            this.channelId = ChannelConfig.channelId;
            this.currChannel = ChannelCreater.createChannel(this.channelId);
            if (this.currChannel) {
                await this.setGetwayInfo();
                this.currChannel.init(handler);
            }
        }

        private async setGetwayInfo() {
            await res.load("getway.json");
            let allGetWay: Object = res.get("getway.json");
            ChannelConfig.getways = this.isOfficial ? allGetWay["official"] : allGetWay["unofficial"];
            if (clientCore.GlobalConfig.isH5)
                ChannelConfig.getways = allGetWay["h5"]
            if (clientCore.GlobalConfig.isTWWeb)
                ChannelConfig.getways = allGetWay["tw-web"];
            if (this.channelId == ChannelEnum.TAIWAN_AN)
                ChannelConfig.getways = allGetWay["tw-an"];
        }

        /** 是否是官服(通过渠道号来控制)*/
        public get isOfficial(): boolean {
            if (clientCore.GlobalConfig.isInnerNet) {
                return false;
            }
            if (core.SignMgr.useSign) {
                return core.SignMgr.official;
            }

            let info = xls.get(xls.channelInfo).get(ChannelConfig.channelId);
            if (info)
                return info.isOfficial == 1;
            else
                return true;
        }

        /**是否为台湾版 */
        public get isTW() {
            let info = xls.get(xls.channelInfo).get(ChannelConfig.channelId);
            if (info)
                return info.extraTag == channel.ExtraTag.TW;
            else
                return true;
        }

        /** 有平台*/
        public get hasChannel(): boolean {
            return this.currChannel != null;
        }

        /** 是内部*/
        public get isInterior(): boolean {
            return this.channelId == ChannelEnum.INTERIOR;
        }

        /**
         * 登录到服务器
         * @param handler 
         */
        public loginServer(handler: Laya.Handler): void {
            this.currChannel && this.currChannel.loginServer(handler);
        }

        /**
         * 向服务器支付 如果渠道不需要经由服务器支付 可以直接调用payToChannel
         * @param data 
         */
        public payToServer(data: xls.rechargeShopChannel | xls.rechargeShopOffical): void {
            this.currChannel && this.currChannel.payToServer(data);
        }

        /**
         * 上报玩家信息
         * @param dataType 选择服务器时 dataType为1；创建角色的时候，dataType为2；进入游戏时，dataType为3；等级提升时，dataType为4；退出游戏时，dataType为5
         */
        public reportRoleData(dataType: number): void {
            this.currChannel && this.currChannel.reportRoleData(dataType);
        }

        /**
         * 查询实名认证
         * @param desc 说明
         */
        public async queryAntiAddiction(desc: string): Promise<void> {
            if (this.currChannel && clientCore.LocalInfo.age == 0) {
                clientCore.LoadingManager.showSmall(desc);
                clientCore.LocalInfo.age = ChannelConfig.age = await this.currChannel.queryAntiAddiction();
                clientCore.LoadingManager.hide();
            }
        }

        /** 调起实名认证 返回参数中 status 0-渠道没有提供实名认证接口 1-渠道提供辽*/
        public realNameRegister(): void {
            this.currChannel && this.currChannel.realNameRegister();
        }

        /** 游戏登录*/
        public login(): void {
            this.currChannel && this.currChannel.login();
        }

        /** 游戏登出*/
        public logout(): void {
            this.currChannel && this.currChannel.logout();
        }

        /** 退出游戏*/
        public exitGame(): void {
            this.currChannel && this.currChannel.exitGame();
        }

        private static _ins: ChannelControl;
        public static get ins(): ChannelControl {
            return this._ins || (this._ins = new ChannelControl());
        }
    }
}