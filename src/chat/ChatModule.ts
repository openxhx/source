
namespace chat {

    export enum ChatType { //世界 本服 家族 私聊 系统
        WORLD = 1,
        LOCAL,
        FAMILY,
        PRIVATE,
        SYSTEM
    }
    /**
     * 聊天模块
     */
    export class ChatModule extends ui.chat.ChatMainUI {
        /** 聊天组件面板*/
        /** 公告通知*/
        private _component: panel.ChatComponent;
        private _notice: panel.ChatNotice;
        private _sCommand: ChatSCommand;
        private _model: ChatModel;
        private _selectIndex: number;
        private _privateChat: panel.PrivateChat; //私聊
        private _itemPanel: item.ItemPanel;

        private _xlsChannels: any;
        private _lastSendTime: number; //上一次发送聊天时间
        private _lastType: number; //上一次聊天的类型

        private _worldChatPanel: panel.WorldChat;

        constructor() { super(); }

        public init(d: any): void {
            super.init(d);

            this.offsetX = 0;
            this.offsetY = 1;

            this.initUI();
            this._selectIndex = -1;
            this._lastSendTime = 0;
            this._model = ChatModel.ins;
            this._sCommand = ChatSCommand.ins;
            this._notice = new panel.ChatNotice(this);

            //使用panel
            this.chatPanel.vScrollBarSkin = "";
            this._itemPanel = new item.ItemPanel();
            this._itemPanel.init(this.chatPanel);
            this._xlsChannels = xls.get(xls.chatChannel);

            clientCore.MaskManager.alpha = 0.6;

            //获取基础信息
            this.addPreLoad(this._sCommand.getChatBase());
            this.boxNewMessage.visible = false;

            //todo test
            // this._notice.rotateNotice("0000000000000000000000000000000000000000");
        }
        public addEventListeners(): void {
            let t: ChatModule = this;
            t.btnClose.on(Laya.Event.CLICK, t, t.onClose);
            t.btnFace.on(Laya.Event.CLICK, t, t.onPanel);
            t.btnSend.on(Laya.Event.CLICK, t, t.onSend);
            t._model.on(ChatModel.SEND_CHAT, t, t.sendChat);
            t._model.on(ChatModel.HISTORY_CHAT, t, t.historyHandler);
            t.imgChat.on(Laya.Event.CLICK, this, this.onInputClick);
            t.btnBuyFlower.on(Laya.Event.CLICK, this, this.onBuy);
            EventManager.on(globalEvent.CLOSE_ALL_MODULE, this, this.onClose);
            EventManager.on(globalEvent.NOTIFY_CHAT, t, t.notifyChat);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, t, t.synFlowerItems);

            for (let i: number = 1; i <= 5; i++) {
                t["tab" + i].on(Laya.Event.CLICK, t, t.onTab, [i])
            }

            t.chatPanel.vScrollBar.on(Laya.Event.START, t, t.listen);

            BC.addEvent(this, this.chatPanel, "SHOW_NEW_MESSAGE_TIPS", this, this.showMsgTips);
            BC.addEvent(this, this.boxNewMessage, Laya.Event.MOUSE_DOWN, this, this.showAllNewMsg);
        }
        public removeEventListeners(): void {
            let t: ChatModule = this;
            t.btnClose.off(Laya.Event.CLICK, t, t.onClose);
            t.btnFace.off(Laya.Event.CLICK, t, t.onPanel);
            t.btnSend.off(Laya.Event.CLICK, t, t.onSend);
            t._model.off(ChatModel.SEND_CHAT, t, t.sendChat);
            t._model.off(ChatModel.HISTORY_CHAT, t, t.historyHandler);
            t.imgChat.off(Laya.Event.FOCUS, this, this.onInputClick);
            t.btnBuyFlower.off(Laya.Event.CLICK, this, this.onBuy);
            EventManager.off(globalEvent.CLOSE_ALL_MODULE, this, this.onClose);
            EventManager.off(globalEvent.NOTIFY_CHAT, t, t.notifyChat);
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, t, t.synFlowerItems);

            for (let i: number = 1; i <= 5; i++) {
                t["tab" + i].off(Laya.Event.CLICK, t, t.onTab)
            }

            t.chatPanel.vScrollBar.off(Laya.Event.START, t, t.listen);

            BC.removeEvent(this);
        }

        private showMsgTips(num: number) {
            this.boxNewMessage.visible = (num > 0);
            this.txtNewMessage.text = `未读消息${num}条`;
        }
        private showAllNewMsg() {
            this._itemPanel.showAllNewMsg();
        }

        public initOver(): void {
            this._data ? this.onTab(this._data.chatType) : this.onTab(ChatType.WORLD);
            this.updateChatFlower();
        }

        // 初始化UI信息
        private initUI(): void {
            this.inputChat.maxChars = 50; //限制输入字符数
            // window.location.reload
        }

        private onTab(type: number): void {
            if (this._selectIndex == type) return;
            // TODO 家族暂时不开放
            if (type == ChatType.FAMILY && !clientCore.FamilyMgr.ins.checkInFamily()) {
                alert.showFWords("未加入任何家族^_^");
                return;
            }
            //标签变化
            for (let i: number = 1; i <= 5; i++) {
                let url: string = type != i ? "chat/di_xuanfu2.png" : "chat/di_xuanfu1.png";
                this["tab" + i].source = Laya.loader.getRes(url);
                this["tabName_" + i].skin = `chat/tab_${i}_${type == i ? 1 : 2}.png`;
            };
            let isWorld: boolean = type == ChatType.WORLD;
            this.boxFlower.visible = isWorld;
            this.inputChat.mouseEnabled = this.btnSend.visible = !isWorld;
            this._selectIndex = this._model.chatType = type;
            this.resetPanel();
            if (type == ChatType.PRIVATE) {
                this.showPrivateChat();
            } else {
                this.resizePanel(22, 70, 546, 604);
                // 处理系统
                if (this._model.chatType == ChatType.SYSTEM) {
                    this._component && this._component.parent && this.showComPanel(false);
                    this.boxBase.mouseEnabled = false;
                } else {
                    this.boxBase.mouseEnabled = true;
                }

                this._privateChat && this._privateChat.parent && this._privateChat.removeSelf(); //隐藏私聊面板
                let list: pb.chat_msg_t[] = clientCore.ChatManager.saveChats.get(type.toString());
                list ? this.historyHandler(list) :
                    this._sCommand.getChatHistory(type, Laya.Handler.create(this, this.historyHandler));
            }
            this.boxNewMessage.visible = false;

            let tag: number;
            if (type == 3) {
                util.RedPoint.reqRedPointRefresh(502);
                tag = 2;
            }
            else if (type == 4) tag = 3;
            else tag = 1;
            net.sendAndWait(new pb.cs_common_set_user_page_tag({ tag: tag })).then((msg: pb.sc_common_set_user_page_tag) => {
            });
        }

        /** 获得聊天历史回调*/
        private historyHandler(list: pb.chat_msg_t[]): void {
            this._itemPanel.dispose();
            list && this._itemPanel.generateItems(list, true);
            this._itemPanel.showAllNewMsg();
        }

        /** 重置chatPanel的位置和大小*/
        private resizePanel(x: number, y: number, w: number, h: number): void {
            this.chatPanel.pos(x + 30, y);
            this.chatPanel.width = w;
            this.chatPanel.height = h;
        }

        /** 展示私聊*/
        private showPrivateChat(): void {
            !this._privateChat && (this._privateChat = new panel.PrivateChat());
            this.spView.addChild(this._privateChat);
            this.resizePanel(146, 73, 424, 595);
            this._model.privateUsers ? this._privateChat.showUsers(this._model.privateUsers.getValues()) :
                this._sCommand.getPrivateUsers(Laya.Handler.create(this, function (list: pb.private_msg_t[]): void {
                    this._model.ansiycUsers(list, this._data);
                    this._privateChat.showUsers(this._model.privateUsers.getValues());
                }));
        }

        /** 输入框获得焦点*/
        private onInputClick(): void {
            if (this._model.chatType == ChatType.WORLD) {
                this._worldChatPanel = this._worldChatPanel || new panel.WorldChat();
                this._worldChatPanel.show(Laya.Handler.create(this, (value: string) => {
                    this.sendChat(value, 0);
                }, null, false));
            }
        }

        private synFlowerItems(items: pb.ItemInfo[]): void {
            let len: number = items.length;
            for (let i: number = 0; i < len; i++) {
                let element: pb.ItemInfo = items[i];
                if (element.itemId == ChatModel.CHAT_FLOWER_ID) {
                    this.updateChatFlower();
                    return;
                }
            }
        }

        private updateChatFlower(): void {
            let cnt: number = clientCore.ItemsInfo.getItemNum(ChatModel.CHAT_FLOWER_ID)
            this.txFlowerCnt.changeText(cnt + "");
            this.btnBuyFlower.visible = cnt == 0;
        }

        private onBuy(): void {
            alert.alertQuickBuy(ChatModel.CHAT_FLOWER_ID, 1, true);
        }

        /** 打开表情等操作面板*/
        private onPanel(): void {
            if (this._model.chatType == ChatType.PRIVATE && alert.checkAge(true)) {
                return;
            }
            if (!this._component) {
                this._component = new panel.ChatComponent();
                this._component.pos(-1, 446);
                this._component.init("");
            }
            this.showComPanel(!this._component.parent);
        }

        /**
         * 是否展现聊天组件面板
         * @param hide 
         */
        private showComPanel(hide: boolean): void {
            let h: number;
            if (hide) {
                h = -this._component.height;
                this.addChild(this._component);
            } else {
                h = this._component.height;
                this._component.removeSelf();
            }
            this.boxBase.y += h;
            this._itemPanel.resizeH(h, true);
        }

        /** 发送聊天*/
        private onSend(): void {
            if (this.inputChat.text == "") {
                return;
            };
            this.sendChat(this.inputChat.text, 0);
        }
        private sendChat(content: string, special: number): void {
            if (this._model.chatType == ChatType.PRIVATE && alert.checkAge(true)) {
                return;
            }
            let info: any = this._xlsChannels.get(this._model.chatType);
            let lv: number = clientCore.LocalInfo.userLv;
            let vipLv: number = clientCore.LocalInfo.vipLv;
            if (info.open_condition.v1 > lv && info.open_condition.v2 > vipLv) {
                alert.showFWords(util.getLang("角色等级大于{0}级或者Vip{1}才能开启哦", info.open_condition.v1, info.open_condition.v2));
                return;
            };
            let now: number = Laya.Browser.now() / 1000;
            if (this._lastType == this._model.chatType && now - this._lastSendTime < info.cd) {
                alert.showFWords("距离上次发言需要" + info.cd + "秒冷却时间~");
                return;
            };

            //全服聊天
            if (this._model.chatType == ChatType.WORLD) {
                if (clientCore.ItemsInfo.getItemNum(ChatModel.CHAT_FLOWER_ID) <= 0) { //道具不足
                    alert.alertQuickBuy(ChatModel.CHAT_FLOWER_ID, 1);
                    return;
                } else {
                    this._worldChatPanel && this._worldChatPanel.hide();
                    // alert.showFWords("消息发送成功~");
                }
            }


            this._lastType = this._model.chatType;
            this._lastSendTime = now;
            let msg: pb.chat_msg_t = new pb.chat_msg_t();
            msg.sendUid = clientCore.LocalInfo.uid;
            msg.headFrameId = clientCore.LocalInfo.srvUserInfo.headFrame;
            msg.content = content;
            msg.special = special;
            msg.chatType = this._model.chatType;
            msg.sendTime = _.round(Laya.Browser.now() / 1000); //浏览器时间戳
            if (this._model.chatType == ChatType.PRIVATE && !this._privateChat.checkChat(msg)) {
                alert.showFWords("请先选择您的私聊对象哦~");
                return;
            }
            util.print("xhxclient:", msg.content);
            this._sCommand.sendChat(msg);
            this.inputChat.text = "";
        }

        /**
         * 收到聊天处理
         * @param list 
         */
        private notifyChat(msg: pb.chat_msg_t): void {
            console.log("get chatMsg:", msg);
            msg.chatType == ChatType.PRIVATE && this.updatePrivateUser(msg);
            this.showChat(msg);
        }

        /**
         * 更新私聊玩家
         * @param msg 收到的消息
         */
        private updatePrivateUser(msg: pb.chat_msg_t): void {
            if (msg.sendUid != clientCore.LocalInfo.uid && this._model.privateUsers) {
                let user: pb.Iprivate_msg_t = this._model.privateUsers.get(msg.sendUid);
                if (!user) {
                    user = new pb.private_msg_t();
                    user.chatUid = msg.sendUid;
                    user.counts = 1;
                    user.sendNick = msg.sendNick;
                    user.headFrame = msg.headFrameId
                    user.headImage = msg.headimage;
                    this._model.privateUsers.add(user.chatUid, user);
                } else {
                    user.counts++;
                }
                this._privateChat && this._privateChat.parent && this._privateChat.updateUsers();
            }
        }

        /**
         * 展示聊天信息  收到消息广播
         * @param msg 
         */
        private showChat(msg: pb.chat_msg_t): void {
            if (msg.chatType != this._model.chatType) {
                msg.chatType == ChatType.SYSTEM && this._notice.rotateNotice(msg.content);
                return;
            }
            // 不是私聊对象
            if (msg.chatType == ChatType.PRIVATE && msg.sendUid != clientCore.LocalInfo.uid && this._model.privateUserID != msg.sendUid) {
                return;
            }
            this._itemPanel.addOneNewMessage(msg);
        }

        private onClose(): void {
            this.removeEventListeners();//清理事件
            this.destroy();
            this._model.dispose();
            this._itemPanel.destroy();
            this._worldChatPanel = null;
            this._component && this._component.destroy();
            this._privateChat && this._privateChat.destroy();
            this._notice && this._notice.dispose();
            this._xlsChannels = this._itemPanel = this._component = this._privateChat = this._notice = null;
            EventManager.event("WELCOME_CHAT_CLOSE");

            net.sendAndWait(new pb.cs_common_set_user_page_tag({ tag: 1 })).then((msg: pb.sc_common_set_user_page_tag) => {
            });
        }

        /**
         * 监听下拉获取私聊分页数据
         */
        private listen(): void {
            if (this.chatPanel.vScrollBar.value > 0 || ChatModel.ins.chatType != ChatType.PRIVATE) return;
            this.parent.once(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.parent.once(Laya.Event.MOUSE_UP, this, this.onMouseEnd);
            this.parent.once(Laya.Event.MOUSE_OUT, this, this.onMouseEnd);
        }
        private _startVal: number;
        private _tween: Laya.Tween;
        private onMouseDown(): void {
            this._startVal = this.chatPanel.mouseY;
        }
        private onMouseEnd(): void {
            if (this.chatPanel.mouseY - this._startVal > 0) {
                this.chatPanel.vScrollBar.mouseEnabled = false;
                let scr: Laya.ScrollBar = this.chatPanel.vScrollBar;
                let uid: number = ChatModel.ins.privateUserID;
                if (!this._model.pages) this._model.pages = {};
                let page: number = this._model.pages.hasOwnProperty(uid) ? this._model.pages[uid] : 2;
                scr.min = -40;
                //获取其他页数据吧
                ChatSCommand.ins.getPrivateHistory(uid, Laya.Handler.create(this, function (array: pb.chat_msg_t[]): void {
                    let _array: Array<pb.chat_msg_t> = clientCore.ChatManager.saveChats.get(ChatType.PRIVATE + "_" + uid);
                    this._tween = Laya.Tween.to(scr, { min: 0 }, 400, Laya.Ease.sineOut, Laya.Handler.create(this, function (): void {
                        scr.mouseEnabled = true;
                        let radio: number = this._itemPanel.length / _array.length;
                        if (radio != 1) {
                            this._model.pages[uid] = page + 1;
                            this._itemPanel.dispose();
                            this._itemPanel.generateItems(_array, true);
                            scr.value = scr.max - radio * scr.max;
                        }
                    }))
                }), page)
            };
            this.parent.off(Laya.Event.MOUSE_UP, this, this.onMouseEnd);
            this.parent.off(Laya.Event.MOUSE_OUT, this, this.onMouseEnd);
        }
        private resetPanel(): void {
            if (this._tween) {
                this._tween.clear();
                this._tween = null;
            }
            this.chatPanel.mouseEnabled = true;
        }
    }
}