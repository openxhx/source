

namespace clientCore {
    /**
     * 渠道信息
     */
    export class ChannelInfo {

        /**
         * 根据包名获取配置信息
         * @param name 
         */
        public static getInfoByName(name: string): xls.channelInfo {
            let array: xls.channelInfo[] = xls.get(xls.channelInfo).getValues();
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.channelInfo = array[i];
                if (element && element.packageName == name) {
                    return element;
                }
            }
            return null;
        }

        /**
         * 根据渠道ID获取配置
         * @param id 
         */
        public static getInfoById(id: number): xls.channelInfo {
            return xls.get(xls.channelInfo).get(id);
        }
    }
}