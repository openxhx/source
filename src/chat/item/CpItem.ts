namespace chat.item {
    /**
     * 花缘昵称
     */
    export class CpItem extends ui.chat.item.CpItemUI implements IType {

        private _info: xls.chatType;
        private _cancelId: number = 88; //选择这个底框的时候 表示不显示

        constructor() { super(); }

        setData(data: xls.chatType): void {
            this._info = null;
            this._info = data;
            let isFrame: boolean = data.chatType == 5;
            this.imgLock.visible = this.checkLock(data.defaultUnlock);
            this.imgFrame.visible = isFrame;
            this.imgUse.visible = isFrame ? (ChatModel.ins.cpFrameID == 0 && data.chatId == this._cancelId) || ChatModel.ins.cpFrameID == data.chatId : ChatModel.ins.cpNickID == data.chatId;
            this.txNick.visible = !isFrame;
            isFrame ? (this.imgFrame.skin = this._cancelId == data.chatId ? '' : `res/chat/cp/${clientCore.LocalInfo.sex == 1 ? data.f_chatPic : data.m_chatPic}.png`) : this.txNick.changeText(data.chatContent);
            this.txName.changeText(data.chatName);
        }

        onClick(): void {
            if (this.imgUse.visible) return;
            if (!this.checkLock(this._info.defaultUnlock, true)) {
                let isFrame: boolean = this._info.chatType == 5;
                alert.showSmall(`是否使用该${isFrame ? '底框' : '后缀'}？`, {
                    callBack: {
                        funArr: [() => {
                            let index: number = isFrame && this._cancelId == this._info.chatId ? 0 : this._info.chatId;
                            net.sendAndWait(new pb.cs_change_cp_chat_info({ type: isFrame ? 1 : 2, index: this._info.chatId })).then(() => {
                                if (isFrame) {
                                    ChatModel.ins.cpFrameID = index;
                                } else {
                                    ChatModel.ins.cpNickID = index;
                                }
                                ChatModel.ins.event(ChatModel.REFRESH_PAENL);
                            });
                        }],
                        caller: this
                    }
                })
            }
        }

        private checkLock(data: xls.triple[], tips?: boolean): boolean {
            let id: number = clientCore.CpManager.instance.cpID;
            let len: number = data.length;
            for (let i: number = 0; i < len; i++) {
                let ele: xls.triple = data[i];
                if (!ele) continue;
                if (ele.v1 == 1 && clientCore.FriendManager.instance.getFriendInfoById(id).friendShip < ele.v3) {
                    tips && alert.showFWords(`羁绊值需要达到${ele.v3}`);
                    return true;
                }
            }
            return false;
        }
    }
}