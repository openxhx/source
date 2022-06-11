namespace chat.item {
    /**
     * 表情单元格
     */
    export class FaceItem extends ui.chat.item.FaceItemUI implements IType {

        private _id: string;
        private _info: xls.chatType;

        constructor() { super(); }

        public setData(data: xls.chatType): void {
            this._info = data;
            this._id = data.chatId + "";
            let size = xls.get(xls.chatType).get(this._id).size;
            this.imgEmoji.skin = pathConfig.getChatEmoji(clientCore.LocalInfo.sex, data.chatId);
            if (size.v1 + size.v2 > 0) {
                let scaleW = Math.min(90 / size.v1, 1);//策划要求这里宽用90来计算
                let scaleH = Math.min(this.height / size.v2, 1);
                let minScale = Math.min(scaleW, scaleH);
                this.imgEmoji.scale(minScale, minScale);
            }
            else {
                this.imgEmoji.scale(1, 1);
            }
            this.boxLock.visible = this.checkLock();
        }

        /** 检查是否锁定*/
        public checkLock(): boolean {
            if (this._info.itemNeed && !clientCore.ItemsInfo.checkHaveItem(this._info.itemNeed)) return true;
            let time: number = ChatModel.ins.getUnlockInfo(this._info.chatId);
            if (time != -1 && (time == 0 || clientCore.ServerManager.curServerTime <= time)) {
                return false;
            }
            if (this._info.chatPrice.v1 == 0 && clientCore.LocalInfo.userLv >= this._info.chatLevel && this._info.chatTime == 99999) {
                return false;
            }
            return true;
        }

        public onClick(): void {
            if (this.boxLock.visible) {
                let lv: number = clientCore.LocalInfo.userLv;
                if (lv < this._info.chatLevel) {
                    alert.showFWords(`解锁此表情需要等级达到${this._info.chatLevel}级哦^_^`);
                    return;
                }
                let desc = "";
                if (this._info.itemNeed && !clientCore.ItemsInfo.checkHaveItem(this._info.itemNeed)) {
                    desc = xls.get(xls.itemBag).get(this._info.itemNeed).captions;
                    desc += "，是否前往获得?"
                } else {
                    desc = `是否解锁表情?`;
                }
                alert.showSmall(desc, {
                    callBack: {
                        funArr: [this.unlockEmoji],
                        caller: this
                    }
                })
            } else {
                let model: ChatModel = ChatModel.ins;
                model.event(ChatModel.SEND_CHAT, [this._id, panel.ComponentType.FACE]);
                model.event(ChatModel.CACHE_RECENT, [panel.ComponentType.FACE, this._info]);
            }
        }

        public onHold(): void {
            clientCore.ToolTip.showFaceTips(this, { id: this._info.chatId });
        }

        public async unlockEmoji() {
            if (this._info.itemNeed && !clientCore.ItemsInfo.checkHaveItem(this._info.itemNeed)) {
                let from = xls.get(xls.itemBag).get(this._info.itemNeed).channelType[0];
                let moduleId: number = parseInt(from.split('/')[1]);
                clientCore.ToolTip.gotoMod(moduleId);
                return;
            }
            ChatSCommand.ins.useChatComponse(panel.ComponentType.FACE, 1, this._info.chatId, Laya.Handler.create(this, (msg: pb.unlockChatItem) => {
                ChatModel.ins.addUnlock(msg);
                this.boxLock.visible = false;
            }))
        }
    }
}