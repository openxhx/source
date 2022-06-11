namespace channel {
    /**
     * 平台配置
     */
    export class ChannelConfig {
        /** 平台ID*/
        public static channelId: number = 0;
        /** 渠道生成的UID(官服的话就是米米号)*/
        public static channelUserID: number = 0;
        /** 子渠道ID*/
        public static subChannelId: number = 0;
        /** 平台名*/
        public static channelName: string = "";
        /** getway列表*/
        public static getways: string[];
        /** 是否实名认证*/
        public static isRealName: boolean;
        /** 玩家年龄*/
        public static age: number = 0;
        /** 是否是U8渠道*/
        public static u8Channel: boolean = false;
        /** 是否支持分享*/
        public static isShare: boolean;
        /** 个人隐私政策*/
        public static privacy: string;

        constructor() {

        }
    }
}