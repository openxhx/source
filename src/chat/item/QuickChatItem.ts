namespace chat.item {
    /**
     * 快捷聊天item
     */
    export class QuickChatItem extends Laya.UIComponent implements IType {

        private _text: Laya.Text;
        private _data: xls.chatType;
        private _bg: Laya.Image;
        private _maxChars: number; //最大字符数

        constructor() {
            super();

            this._bg = new Laya.Image();
            this._bg.source = Laya.loader.getRes("chat/di_duanyu.png");
            this.addChild(this._bg);

            this._text = new Laya.Text();
            this._text.font = "Source Han Serif SC Heavy";
            this._text.color = "#805329";
            this._text.fontSize = 18;
            this._text.width = 126;
            this._text.align = "center";
            this._text.pos(13, 20);
            this.addChild(this._text);

            this._maxChars = 7;
        }

        public setData(data: xls.chatType) {
            let vaule: string = data.chatContent;
            this._data = data;
            vaule = vaule.length > this._maxChars ? vaule.substring(0, this._maxChars - 1) + "..." : vaule;
            this._text.text = vaule;
        }

        public onClick(): void {
            ChatModel.ins.event(ChatModel.SEND_CHAT, [this._data.chatId + "", panel.ComponentType.QUICK_CHAT]);
            ChatModel.ins.event(ChatModel.CACHE_RECENT, [panel.ComponentType.QUICK_CHAT, this._data]);
        }
    }
}