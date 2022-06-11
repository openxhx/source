namespace clientCore {

    export class ChatManager {
        public static xlsMap: Object = {};
        public static mappingGroup: Object = {};
        /** 保存的聊天 注：key为string 私聊以 type-uid(uid为接收方) 为key 其他以 type*/
        public static saveChats: util.HashMap<pb.chat_msg_t[]> = new util.HashMap<pb.chat_msg_t[]>();
        /** 是否打开缓存*/
        public static isCache: boolean = true;

        public static setup(): void {
            this.analysisConfig();
        }

        /**
         * 解析配置到hash表
         */
        private static analysisConfig(): void {
            let values: xls.chatType[] = xls.get(xls.chatType).getValues();
            _.forEach(values, (element: xls.chatType) => {
                // 导入类型
                let map: util.HashMap<xls.chatType[]> = this.xlsMap[element.chatType];
                if (!map) {
                    map = new util.HashMap<xls.chatType[]>();
                    this.xlsMap[element.chatType] = map;
                }
                // 导入内容
                let array: xls.chatType[] = map.get(element.chatContyle);
                if (!array) {
                    array = [];
                    map.add(element.chatContyle, array);
                }
                array.push(element);
            })
        }

        /** 缓存信息*/
        public static cacheInfos(msg: pb.chat_msg_t): void {
            if (!this.isCache) return;
            let key: string = msg.chatType.toString();
            if (msg.chatType == 4) { //私聊
                key = msg.sendUid == clientCore.LocalInfo.uid ? (msg.chatType + "_" + msg.recvUid) //hash表以私聊对象的uid作为key值
                    : (msg.chatType + "_" + msg.sendUid);
            }
            let list: pb.chat_msg_t[] = this.saveChats.get(key);
            if (!list) {
                list = [];
                this.saveChats.add(key, list);
            }
            list.length >= 50 && list.shift(); //只缓存50条
            list.push(msg);
        }
    }
}