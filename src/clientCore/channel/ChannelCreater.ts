namespace channel {


    /**
     * 平台创建者
     */
    export class ChannelCreater {

        public static createChannel(channelId: number): BaseChannel {
            let current: BaseChannel;
            switch (channelId) {
                case ChannelEnum.INTERIOR:
                    current = new childs.InteriorChannel();
                    break;
                case ChannelEnum.TAOMEE:
                    current = new childs.TaomeeChannel();
                    break;
                case ChannelEnum.YSDK:
                case ChannelEnum.TAOMEE_AD:
                case ChannelEnum.UC:
                case ChannelEnum.XIAOMI:
                case ChannelEnum.OPPO:
                case ChannelEnum.VIVO:
                case ChannelEnum.HUAWEI:
                case ChannelEnum.BILIBILI:
                case ChannelEnum.QIHOO360:
                case ChannelEnum.LENOVO:
                case ChannelEnum.MEIZU:
                case ChannelEnum.JINLI:
                case ChannelEnum.M4399:
                case ChannelEnum.BAIDU:
                case ChannelEnum.COOLPAD:
                case ChannelEnum.MEITU:
                case ChannelEnum.SAMSUNG:
                case ChannelEnum.NUBIA:
                    current = new childs.U8Channel();
                    break;
                case ChannelEnum.IOS:
                    current = new childs.IOSChannel();
                    break;
                case ChannelEnum.TAIWAN_AN:
                    current = new childs.GFChannel();
                    break;
                case ChannelEnum.TM_H5:
                    current = new childs.H5Channel();
                    break;
                default:
                    break;
            }
            return current;
        }

    }
}