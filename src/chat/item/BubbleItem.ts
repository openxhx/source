namespace chat.item {
    /**
     * 气泡
     */
    export class BubbleItem extends ui.chat.BubbleItemUI implements IType {

        private _info: xls.chatType;
        private _isOpen: boolean;

        private _decorationNum: number = 0;

        constructor() {
            super();
            this.pos(7, 4);
        }

        public setData(data: xls.chatType): void {
            this._info = data;
            this.imgSelect.visible = false;
            this.txName.changeText(data.chatName);
            this.imgValue.skin = pathConfig.getChatBubble(clientCore.LocalInfo.sex, data.chatId);

            this.changeUsed();
            this.updateView();
        }

        public changeUsed(): void {
            this.imgUse.visible = ChatModel.ins.bubbleID == this._info.chatId;
        }

        private updateView(): void {
            let itemId: number = this._info.chatPrice.v1;
            this._isOpen = this.checkOpen();
            this.imgValue.gray = this.imgLock.visible = !this._isOpen;
            this.txNum.visible = this.imgCost.visible = !this._isOpen && itemId != 0;
            if (this.txNum.visible) {
                this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
                this.txNum.changeText(this._info.chatPrice.v2 + "");
            }
        }

        public onClick(): void {
            if (this.imgUse.visible) { //正在使用
                return;
            }
            if (!this._isOpen) {
                if (clientCore.LocalInfo.userLv < this._info.chatLevel) { //等级限制
                    alert.showFWords(`解锁气泡需先达到${this._info.chatLevel}级`);
                    return;
                }
                if (clientCore.FlowerPetInfo.petType < this._info.babyLimit) { //花宝限制
                    alert.showFWords(`解锁气泡需拥有${xls.get(xls.babyPay).get(this._info.babyLimit).name}`);
                    return;
                }
                if (this._info.itemNeed && this._decorationNum <= 0) {
                    alert.showFWords(`解锁气泡需拥有${clientCore.ItemsInfo.getItemName(this._info.itemNeed)}`);
                    return;
                }
            }
            let type: number = this._isOpen ? 2 : 1;
            let desc: string = type == 1 ? "是否解锁气泡？" : "是否使用气泡？"
            alert.showSmall(desc, {
                callBack: {
                    funArr: [() => {
                        ChatSCommand.ins.useChatComponse(panel.ComponentType.BUBBLE, type, this._info.chatId, Laya.Handler.create(this, (msg: pb.unlockChatItem) => {
                            if (type == 1) { //解锁
                                ChatModel.ins.addUnlock(msg);
                                this.updateView();
                            }
                            else { //使用
                                ChatModel.ins.bubbleID = this._info.chatId;
                                ChatModel.ins.event(ChatModel.REFRESH_PAENL);
                            }
                        }))
                    }],
                    caller: this
                }
            })
        }

        private checkOpen(): boolean {
            let time: number = ChatModel.ins.getUnlockInfo(this._info.chatId);
            if (time != -1 && (time == 0 || clientCore.ServerManager.curServerTime <= time)) { //已拥有 没有到期
                return true;
            }
            if (clientCore.LocalInfo.userLv >= this._info.chatLevel && this._info.chatPrice.v1 == 0) {
                if (this._info.itemNeed != 0) { //先暂时检查装饰
                    let decoNum = clientCore.MapItemsInfoManager.instance.getAllDecorationNumByid(this._info.itemNeed);
                    let userHeadInfo = clientCore.UserHeadManager.instance.getOneInfoById(this._info.itemNeed);
                    let userHead = (userHeadInfo && userHeadInfo.have) ? 1 : 0;
                    let haveTitle = clientCore.TitleManager.ins.get(this._info.itemNeed) && !clientCore.TitleManager.ins.get(this._info.itemNeed).checkEnd();
                    let title = haveTitle ? 1 : 0;
                    this._decorationNum = Math.max(decoNum, userHead, title);
                    if (this._decorationNum <= 0) return false;
                }
                return true;
            }
            return false;
        }
    }
}