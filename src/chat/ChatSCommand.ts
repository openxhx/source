namespace chat {
    /**
     * 消息控制体
     */
    export class ChatSCommand {
        private _model: ChatModel;
        constructor() {
            this._model = ChatModel.ins;
        }

        /**
         * 获取聊天历史记录
         * @param type 
         * @param uid 
         * @param handler 回调
         */
        public getChatHistory(type: number, handler: Laya.Handler, uid?: number): void {
            net.sendAndWait(new pb.cs_get_chat_info({ chatType: type, chatUid: uid })).then((msg: pb.sc_get_chat_info) => {
                let list: pb.chat_msg_t[] = _.reverse(msg.lastMsgs); //因为服务器按照时间排序了 所以倒序
                let key: string = type != ChatType.PRIVATE ? type.toString() : type + "_" + uid;
                clientCore.ChatManager.saveChats.add(key, list);
                handler.runWith([list]);
            });
        }

        public deleteChat(uid: number) {
            return net.sendAndWait(new pb.cs_delete_private_chat_msg({ chatUid: uid }));
        }

        /**
         * 获取私聊历史吧
         * @param uid 
         * @param page 
         * @param handler 
         */
        public getPrivateHistory(uid: number, handler: Laya.Handler, page?: number): void {
            net.sendAndWait(new pb.cs_get_chat_info({ chatType: ChatType.PRIVATE, chatUid: uid, page: page })).then((msg: pb.sc_get_chat_info) => {
                let key: string = ChatType.PRIVATE + "_" + uid;
                let array: pb.chat_msg_t[] = clientCore.ChatManager.saveChats.get(key);
                if (!array) array = [];
                let newArr: Array<pb.chat_msg_t> = _.reverse(msg.lastMsgs).concat(array); //因为服务器按照时间排序了 所以倒序
                array = null;
                clientCore.ChatManager.saveChats.add(key, newArr);
                handler.runWith([newArr]);
            });
        }


        /**
         * 获取私聊玩家
         */
        public getPrivateUsers(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_private_user()).then((msg: pb.sc_get_private_user) => {
                handler.runWith([msg.privateUser]);
            });
        };

        /**
         * 发送聊天
         * @param data 
         */
        public sendChat(data: any): void {
            net.send(new pb.cs_send_chat_msg({ msg: data }))
        }

        /**
         * 获取聊天组件的解锁与使用情况
         * @param type 
         * @param handler
         */
        public getChatComponentInfo(type: number): Promise<any> {
            return new Promise((ok) => {
                net.sendAndWait(new pb.cs_get_chat_components_info({ compId: type })).then((msg: pb.sc_get_chat_components_info) => {
                    // 组件使用历史
                    if (msg.recentUse.length > 0) {
                        this._model.lately = {};
                        this._model.lately[type] = msg.recentUse;
                    }
                    // 组件解锁信息
                    if (msg.unlockItem.length > 0) {
                        _.forEach(msg.unlockItem, (element: pb.unlockChatItem) => {
                            this._model.addUnlock(element);
                        });
                    }
                    ok();
                });
            })
        }

        /**
         * 使用组件
         * @param comID 组件类型 
         * @param type 使用类型 1- 解锁 2-使用
         * @param Id 使用的具体单位id
         * @param handler 回调
         */
        public useChatComponse(comID: number, type: number, id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_chat_component_opt({ compId: comID, optId: type, objectId: id })).then((msg: pb.sc_chat_component_opt) => {
                handler.runWith(msg.unlockItem);
            });
        }

        /**
         * 获取聊天基础信息
         */
        public getChatBase() {
            return net.sendAndWait(new pb.cs_get_chat_base()).then((msg: pb.sc_get_chat_base) => {
                this._model.bubbleID = msg.bubbleId;
                this._model.cpFrameID = msg.cpBaseFrame;
                this._model.cpNickID = msg.cpNickSuffix;
            });
        }

        private static _ins: ChatSCommand;
        public static get ins(): ChatSCommand {
            return this._ins || (this._ins = new ChatSCommand());
        }
    }
}