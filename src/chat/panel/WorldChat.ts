

namespace chat.panel {
    /**
     * 世界聊天界面
     */
    export class WorldChat extends ui.chat.WorldChatUI {

        private _sendHandler: Laya.Handler;

        constructor() { super(); }

        public show(hander: Laya.Handler): void {
            clientCore.DialogMgr.ins.open(this);
            this._sendHandler = hander;
            this.inputChat.text = "";
            this.inputChat.restrict = "^\\\n";
            clientCore.UIManager.showCoinBox();
            clientCore.UIManager.setMoneyIds([ChatModel.CHAT_FLOWER_ID]);
            this.onInput();
        }

        public hide(): void {
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.onSend);
            BC.addEvent(this, this.inputChat, Laya.Event.INPUT, this, this.onInput);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onSend(): void {
            //没内容
            if (this.inputChat.text == "") {
                alert.showFWords("聊天内容不能为空哦^_^");
                return;
            }
            //全空格
            let value: string = this.inputChat.text;
            if (value.replace(/\s+/g, "") == "") {
                alert.showFWords("聊天内容无意义~");
                return;
            }

            this._sendHandler && this._sendHandler.runWith(this.inputChat.text);
        }

        private onInput(): void {
            this.txCnt.changeText(this.inputChat.text.length + "/" + this.inputChat.maxChars);
        }

        public destroy(): void {
            this._sendHandler && this._sendHandler.recover();
            this._sendHandler = null;
            super.destroy();
        }
    }
}