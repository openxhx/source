namespace chat.panel {
    /**
     * 私聊模块
     */
    export class PrivateChat extends ui.chat.PrivateChatUI {
        private _selectData: pb.private_msg_t;
        private _selectIndex: number; //当前选择

        private _model: ChatModel;
        /** 当前页*/
        private _page: number = 0;

        constructor() {
            super();
            this._model = ChatModel.ins;
            this.initList();
            this.boxInfo.visible = false;
        }

        private initList(): void {
            this.list.vScrollBarSkin = "";
            this.list.dataSource = [];
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.listMouse, null, false);
        }

        private listRender(item: Laya.Box, index: number): void {
            let bg: Laya.Image = this.node(item, "bg");
            let numBg: Laya.Image = this.node(item, "numBg");
            let txNum: Laya.Label = this.node(item, "txNum");
            let txName: Laya.Label = this.node(item, "txName");
            let data: pb.private_msg_t = this.list.array[index];
            if (this._selectIndex == index) {
                data.counts = 0;
                bg.source = Laya.loader.getRes("chat/di_touxiang2.png");
            } else {
                bg.source = Laya.loader.getRes("chat/di_touxiang1.png");
            };
            txName.changeText(data.sendNick);
            let isCounts: boolean = data.counts > 0;
            numBg.visible = txNum.visible = isCounts;
            isCounts && txNum.changeText(data.counts > 99 ? "99+" : ("" + data.counts));

            //头像和头像框
            this.node(item, "head").skin = clientCore.ItemsInfo.getItemIconUrl(data.headImage);
            this.node(item, "frame").skin = data.headFrame == 0 ? "" : clientCore.ItemsInfo.getItemIconUrl(data.headFrame);
        }
        private node(parent: Laya.Box, name: string): any {
            return parent.getChildByName(name);
        }

        private listMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let data: pb.private_msg_t = this.list.array[index];
            data && e.target.name == "del" ? this.deleteUser(data, index) : this.listSelect(index); //是否选择删除
        }
        private listSelect(index: number): void {
            if (index == this._selectIndex) return;
            this._selectIndex = index;
            this._selectData = this.list.array[index];
            if (!this._selectData) return;
            this.list.mouseEnabled = false;
            let list: pb.chat_msg_t[] = clientCore.ChatManager.saveChats.get(ChatType.PRIVATE + "_" + this._selectData.chatUid);
            list ? this.historyHandler(list, true)
                : ChatSCommand.ins.getPrivateHistory(this._selectData.chatUid, Laya.Handler.create(this, this.historyHandler), 1);
        }
        private historyHandler(list: pb.chat_msg_t[], refreshSrv: boolean = false): void {
            this.list.mouseEnabled = true;
            this._model.privateUserID = this._selectData.chatUid;
            this._model.event(ChatModel.HISTORY_CHAT, [list]);
            if (refreshSrv) {
                net.send(new pb.cs_clear_chat_unread_cnt({ uid: this._selectData.chatUid }));
                util.RedPoint.reqRedPointRefresh(501);
            }
        }
        /**
         * 删除私聊玩家
         * @param msg 
         * @param index 
         */
        private deleteUser(msg: pb.private_msg_t, index: number): void {
            this._model.privateUsers.remove(msg.chatUid);
            ChatSCommand.ins.deleteChat(msg.chatUid).then(() => {
                util.RedPoint.reqRedPointRefresh(501);
            }).catch(() => { })
            this.list.deleteItem(index);
            if (this._selectIndex == index) { //删除正在聊天的
                this._selectIndex = -1;
                this._selectData = null;
                this.list.length == 0 ? this._model.event(ChatModel.HISTORY_CHAT) : this.listSelect(0);
            }
        }
        /**
         * 展示私聊玩家列表
         * @param list 
         */
        public showUsers(list: pb.Iprivate_msg_t[]): void {
            this.list.array = list;
            list.length == 0 ? this._model.event(ChatModel.HISTORY_CHAT) : this.listSelect(0);
        }

        /** 检查聊天对象*/
        public checkChat(msg: pb.chat_msg_t): boolean {
            if (this._selectData) {
                msg.recvUid = this._selectData.chatUid;
                return true;
            }
            return false;
        }

        /** 更新聊天对象*/
        public updateUsers(): void {
            this.list.array = this._model.privateUsers.getValues();
        }

        public removeSelf(): Laya.Node {
            this._selectIndex = -1;
            return super.removeSelf();
        }
    }
}