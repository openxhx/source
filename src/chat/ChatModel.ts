
namespace chat {

    /**
     * 聊天模块数据
     */
    export class ChatModel extends Laya.EventDispatcher {

        public static readonly SEND_CHAT: string = "1";
        public static readonly HISTORY_CHAT: string = "2";
        public static readonly REFRESH_PAENL: string = "3";
        public static readonly CACHE_RECENT: string = "4";

        /** 传音花ID*/
        public static readonly CHAT_FLOWER_ID = 1511001;

        /** 当前聊天类型*/
        public chatType: number;
        /** 当前的气泡ID*/
        public bubbleID: number;
        /** 当前私聊对象uid*/
        public privateUserID: number;
        /** 私聊的用户*/
        public privateUsers: util.HashMap<any>;
        /** 配置信息*/
        public xlsMap: Object;
        /** 私聊页*/
        public pages: Object = {};

        public cpFrameID: number; //cp底框
        public cpNickID: number; //cp昵称

        /** 最近使用的组件*/
        public lately: object;
        /** 解锁的组件*/
        private _unLockMap: Object;

        constructor() {
            super();
            this.xlsMap = clientCore.ChatManager.xlsMap;
        }

        public ansiycUsers(list: pb.Iprivate_msg_t[], data?: any): void {
            this.privateUsers = new util.HashMap<any>();
            if (data && data.uid) {
                let msg: pb.private_msg_t = new pb.private_msg_t();
                msg.chatUid = data.uid;
                msg.sendNick = data.nick;
                msg.counts = 0;
                msg.headImage = data.head;
                msg.headFrame = data.frame;
                this.privateUsers.add(msg.chatUid, msg);
            };
            _.forEach(list, (ele: pb.Iprivate_msg_t) => {
                this.privateUsers.add(ele.chatUid, ele);
            });
        }

        /** 缓存已使用*/
        public cacheRecent(type: number, id: number): void {
            this.lately = this.lately || {};
            let array: number[] = this.lately[type];
            if (!array) {
                array = [];
                this.lately[type] = array;
            }
            array.indexOf(id) == -1 && array.push(id);
        }

        /**
         * 添加解锁组件
         * @param msg 
         */
        public addUnlock(msg: pb.unlockChatItem): void {
            this._unLockMap = this._unLockMap || {};
            this._unLockMap[msg.objectId] = msg.endTime;
        }

        /** 移除解锁组件*/
        public remoceUnlock(id: number): void {
            this._unLockMap[id] = null;
            delete this._unLockMap[id];
        }

        public getUnlockInfo(id: number): number {
            if (this._unLockMap && this._unLockMap[id] != void 0) {
                return this._unLockMap[id];
            }
            return -1;
        }

        public dispose(): void {
            if (this.privateUsers) {
                this.privateUsers.clear();
                this.privateUsers = null;
            }
            if (this.lately) {
                for (let key in this.lately) {
                    let array: number[] = this.lately[key];
                    array && (array.length = 0);
                    delete this.lately[key];
                }
            }
            this.pages = this._unLockMap = this.lately = null;
        }

        public destroy(): void {
            this.dispose();
        }

        private static _ins: ChatModel;
        public static get ins(): ChatModel {
            return this._ins || (this._ins = new ChatModel());
        }
    }
}