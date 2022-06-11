namespace samsungChat{
    /**
     * 三星聊天
     * samsungChat.SamsungChatModule
     */
    export class SamsungChatModule extends ui.samsungChat.SamsungChatModuleUI{

        private _index: number = 0;
        
        constructor(){ super(); }

        init(): void{
            this.offsetX = 0;
            this.offsetY = 1;
            this.chatPanel.vScrollBarSkin = '';
            _.forEach(clientCore.ChatManager.saveChats.get(1), (element: pb.chat_msg_t)=>{
                this.addItem(element);
            })
        }

        addEventListeners(): void{
            BC.addEvent(this, EventManager, globalEvent.NOTIFY_CHAT, this, this.notifyChat);
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.onSend);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        
        popupOver(): void{
        }

        private addItem(msg: pb.chat_msg_t): void{
            let isSelf: boolean = msg.sendUid == clientCore.LocalInfo.uid;
            let item: ui.samsungChat.ChatItemUI | ui.samsungChat.SelfChatItemUI = isSelf ? new ui.samsungChat.SelfChatItemUI() : new ui.samsungChat.ChatItemUI();
            let headId: number = clientCore.LocalInfo.uid == msg.sendUid ? clientCore.LocalInfo.srvUserInfo.headImage : msg.headimage;
            item.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(headId);
            item.chatTxt.changeText(msg.content);
            item.nameTxt.changeText(msg.sendNick);
            item.imgBubble.width = Math.max(0,msg.content.length - 7) * 20 + 200;
            item.y = this._index++ * item.height;
            item.x = isSelf ? this.chatPanel.width : 0;
            isSelf && (item.chatTxt.x = item.imgBubble.x - item.imgBubble.width + 27);
            this.chatPanel.addChild(item);
        }

        private notifyChat(msg: pb.chat_msg_t): void{
            this.addItem(msg);
        }

        private onSend(): void{
            if(!this.itChat.text)return;
            if (clientCore.ItemsInfo.getItemNum(1511001) <= 0) { //道具不足
                alert.alertQuickBuy(1511001, 1);
                return;
            }
            let msg: pb.chat_msg_t = new pb.chat_msg_t();
            msg.sendUid = clientCore.LocalInfo.uid;
            msg.headFrameId = clientCore.LocalInfo.srvUserInfo.headFrame;
            msg.content = this.itChat.text;
            msg.special = 0;
            msg.chatType = 1;
            msg.sendTime = _.round(Laya.Browser.now() / 1000); //浏览器时间戳
            net.send(new pb.cs_send_chat_msg({ msg: msg }))
            this.itChat.text = "";
        }
    }
}