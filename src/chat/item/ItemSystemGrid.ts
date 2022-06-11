
namespace chat.item {
    /**
     * 每一条聊天信息
     */
    export class ItemSystemGrid {
        private _bubble: Laya.Image;
        private _txName: Laya.Text;
        private _txValue: util.HuaText;
        /** 高*/
        public height: number = 73;
        private _x: number;
        private _y: number;
        private _data: pb.chat_msg_t;

        private _childs: Array<Laya.Sprite> = [];

        public init(data: pb.chat_msg_t, bubbleLayer: Laya.Sprite, textLayer: Laya.Sprite): void {
            this._data = data;
            this.showSystemBubble(bubbleLayer);
            this.showSystemChatValue(textLayer);
            this.showSystemName(textLayer);
            this._txName.mouseEnabled = false;
            this._txValue.mouseEnabled = false;
        }
        private showSystemBubble(parent: Laya.Sprite) {
            if (!this._bubble) {
                this._bubble = new Laya.Image()
                this._bubble.height = 73;
                this._bubble.width = 465;
                this._bubble.sizeGrid = "33,10,10,93";
                this._childs.push(this._bubble);
                this._bubble.mouseEnabled = true;
            };
            BC.addEvent(this, this._bubble, Laya.Event.CLICK, this, this.onBubbleClick);
            this._bubble.scaleX = 1;
            let url = "res/chat/system/bg1.png";
            this._bubble.skin = url;
            this._bubble.x = 77;
            parent.addChild(this._bubble);
        }
        onBubbleClick(e: Laya.Event) {
            if (this._data.special >= 100000000) {
                let info = clientCore.MentorManager.applyInfo.applyMessageHashMap.get(this._data.special);
                EventManager.event(globalEvent.CLOSE_ALL_MODULE);
                clientCore.ModuleManager.open("selfInfo.SelfInfoModule", { info: info });
                return;
            }
            let weddingInfo = clientCore.CpManager.instance.getWeddingInfoByUID(this._data.special);
            if (weddingInfo) {
                clientCore.MapManager.enterWedding(weddingInfo);
                return;
            }
            let key = this._data['extraName'];
            let data = this._data['extraData'];
            switch (key) {
                case 'godMirror':
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open('godMirror.GodMirrorInfoModule', data);
                    break;
                case 'coolBeach':
                    if (clientCore.CoolBeachImageManager.instance.redBagGotId.includes(data)) {
                        alert.showFWords('已经抢过该红包,快去抢别的吧~');
                        return;
                    }
                    clientCore.CoolBeachImageManager.instance.redBagGotId.push(data);
                    net.sendAndWait(new pb.cs_get_cool_beach_show_fruit_tray_reward({ uid: data })).then((msg: pb.sc_get_cool_beach_show_fruit_tray_reward) => {
                        alert.showReward(msg.item);
                    })
                    break;
                case 'afternoonTime':
                    clientCore.MapManager.enterWorldMap(11, new Laya.Point(1400, 1000));
                    break;
                default:
                    break;
            }
        }
        private showSystemChatValue(parent: Laya.Sprite) {
            if (!this._txValue) {
                this._txValue = new util.HuaText();
                this._txValue.font = "汉仪中圆简";
                this._txValue.fontSize = 18;
                this._txValue.wordWrap = true;
                this._txValue.leading = 4;
                this._txValue.height = 40;
                this._txValue.bold = true;
                this._txValue.color = "#805329";
                this._txValue.valign = "middle";
                this._childs.push(this._txValue);
            };
            let max: number = 360;
            this._txValue.text = this._data.content;
            this._txValue.width = Math.min(this._txValue.lines.length * this._txValue.textWidth, max);
            this._txValue.x = 175;
            // 大于3行
            let _count: number = Math.max(this._txValue.lines.length - 2, 0);
            let _addH: number = _count * 21;
            this._bubble.height = 53 + _addH;
            this.height = 53 + _addH;

            console.log("文档长度:" + this._txValue.lines.length);

            parent.addChild(this._txValue);
        }
        private showSystemName(parent: Laya.Sprite): void {
            if (!this._txName) {
                this._txName = new Laya.Text();
                this._txName.font = "汉仪中圆简";
                this._txName.fontSize = 18;
                this._txName.color = "#ffffff";
                this._childs.push(this._txName);
            }
            this._txName.text = this._data.sendNick + "";
            this._txName.x = 82;
            parent.addChild(this._txName);
        }
        public set y(value: number) {
            this._y = value;
            this._bubble && (this._bubble.y = 0 + value);
            this._txValue && (this._txValue.y = 7 + value);
            this._txName && (this._txName.y = 5 + value);
        }
        public dispose(): void {
            _.forEach(this._childs, (ele: Laya.Sprite) => {
                ele.visible = true;
                ele.removeSelf();
            });
            this._data = null;
            this.height = 86;
            BC.removeEvent(this);
            Laya.Pool.recover("chat.item.ItemSystemGrid", this);

        }

        public static create(): ItemSystemGrid {
            return Laya.Pool.getItemByClass("chat.item.ItemSystemGrid", ItemSystemGrid);
        }
    }
}