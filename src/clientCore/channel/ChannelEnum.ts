namespace channel {
    /**
     * 渠道ID枚举
     */
    export enum ChannelEnum {
        /** IOS*/
        IOS = 80,
        /** 内部*/
        INTERIOR = 0,
        /** 应用宝*/
        YSDK = 1,
        /** 小米*/
        XIAOMI = 2,
        /** UC*/
        UC = 3,
        /** 360*/
        QIHOO360 = 4,
        /** baidu*/
        BAIDU = 5,
        /** 4399*/
        M4399 = 6,
        /** OPPO*/
        OPPO = 7,
        /** VIVO*/
        VIVO = 8,
        /** HUAWEI*/
        HUAWEI = 9,
        /** LENOVO*/
        LENOVO = 10,
        /** 酷派*/
        COOLPAD = 11,
        /** 金立*/
        JINLI = 12,
        /** 魅族*/
        MEIZU = 13,
        /** 美图*/
        MEITU = 15,
        /** b站*/
        BILIBILI = 16,
        /** 三星*/
        SAMSUNG = 17,
        /** 努比亚*/
        NUBIA = 18,
        /** 台湾安卓*/
        TAIWAN_AN = 19,
        /** 淘米安卓*/
        TAOMEE_AD = 61,
        /** 淘米web*/
        TAOMEE = 98,
        /** H5-淘米*/
        TM_H5 = 83
    }

    /**子渠道id枚举 */
    export enum subChannelEnum {
        官网 = 0,
        淘米官网 = 1,
        好游快爆 = 2,
        抖音A = 11,
        抖音B = 22,
        微博A = 33,
        微博B = 44,
        热云 = 55,
        华军 = 66
    }

    export enum SubChannelDisplayName {
        热云 = 'reyun'
    }

    /**获取子渠道的名字 */
    export function getSubChannelName(subchannelId: subChannelEnum) {
        if (SubChannelDisplayName[subchannelId]) {
            return SubChannelDisplayName[subchannelId]
        }
        else {
            return 'unknow'
        }
    }

    /**地区版本标识，对应channelInfo表中extraTag字段 */
    export enum ExtraTag {
        /**台湾版 */
        TW = 'tw'
    }
}