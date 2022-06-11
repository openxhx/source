namespace chat.item {
    /**
     * 每一条聊天信息
     */
    export class ItemGrid {

        private static _$ID: number = 0;

        /** x缩进*/
        private readonly ALL_SCALE_X: number = 5;

        /** 唯一ID*/
        public id: number;
        private _vip: Laya.Image;
        private _iconFrame: Laya.Image;
        private _icon: Laya.Image;
        private _bubble: Laya.Image;
        private _txName: Laya.Text;
        private _txValue: util.HuaText;
        private _face: Laya.Image; //表情
        private _txCp: Laya.Text;
        private _imgCp: Laya.Image;
        private _isMySelf: boolean;
        private _btnReport: Laya.Image;
        private _data: pb.chat_msg_t;
        private _x: number;
        private _y: number;
        private _bubbleH: number;
        private _bubbleDis: number;
        /** 是否显示*/
        private _visible: boolean;
        private _panelWidth: number;
        /** 高*/
        public height: number = 86;

        /** childs 子对象们*/
        private _childs: Array<Laya.Sprite> = [];

        constructor() { this.id = ItemGrid._$ID++; }

        public init(data: pb.chat_msg_t, altasLayer: Laya.Sprite, iconFrameLayer: Laya.Sprite, iconLayer: Laya.Sprite, bubbleLayer: Laya.Sprite, cpLayer: Laya.Sprite, faceLayer: Laya.Sprite, textLayer: Laya.Sprite): void {
            this._data = data;
            this._isMySelf = data.sendUid == clientCore.LocalInfo.uid;
            this.showIconFrame(iconFrameLayer);
            this.showIcon(iconLayer);
            //私聊不显示名称吧？？？？
            if (ChatModel.ins.chatType == ChatType.PRIVATE) {
                this._panelWidth = 424;
            } else {
                this._panelWidth = 550;
                this.showName(textLayer);
                data.isVip && this.showVip(altasLayer);
                this.showCp(cpLayer, textLayer);
            }

            //使用哪种组件在聊天？
            switch (data.special) {
                case panel.ComponentType.FACE: //表情
                    this.showFace(faceLayer);
                    break;
                case panel.ComponentType.RED_PACKAGE: //红包
                    break;
                default:
                    this.showBubble(bubbleLayer);
                    this.showChatValue(textLayer);
                    this.showReportBtn(altasLayer);
                    break;
            }

        }


        /** 调和X*/
        private reconcileX(sp: Laya.Sprite, x: number, noCutWid?: boolean, len?: number): number { //546 424
            let w: number = len ? len : sp.width;
            return this._isMySelf ? (noCutWid ? Math.abs(this._panelWidth - this.ALL_SCALE_X - x) : (Math.abs(this._panelWidth - this.ALL_SCALE_X - x) - w)) : x;
        }

        /**
         * 展示人物头像框
         * @param parent 
         */
        private async showIconFrame(parent: Laya.Sprite) {
            let frameID: number = this._isMySelf ? clientCore.LocalInfo.srvUserInfo.headFrame : this._data.headFrameId;
            if (frameID == 0) return;
            if (!this._iconFrame) {
                this._iconFrame = new Laya.Image();
                this._childs.push(this._iconFrame);
            };
            let url: string = clientCore.ItemsInfo.getItemIconUrl(frameID);
            await res.load(url);
            this._iconFrame.source = Laya.loader.getRes(url);
            this._iconFrame.size(94.5, 94.5);
            this._iconFrame.x = this.reconcileX(this._iconFrame, -9);
            parent.addChild(this._iconFrame);
            if (this._data.sendUid != clientCore.LocalInfo.uid)
                clientCore.UserInfoTip.addTips(this._iconFrame, this._data.sendUid);
        }

        /**
         * 展示人物头像
         * @param parent 
         */
        private async showIcon(parent: Laya.Sprite) {
            if (!this._icon) {
                this._icon = new Laya.Image()
                this._childs.push(this._icon);
            };
            let headId = this._isMySelf ? clientCore.LocalInfo.srvUserInfo.headImage : this._data.headimage;
            let url: string = clientCore.ItemsInfo.getItemIconUrl(headId);
            await res.load(url);
            this._icon.source = Laya.loader.getRes(url);
            this._icon.size(72, 72);
            this._icon.x = this.reconcileX(this._icon, 0);
            parent.addChild(this._icon);
        }

        /**
         * 展示气泡
         * @param parent 
         */
        private showBubble(parent: Laya.Sprite): void {
            let bubbleId: number = this._isMySelf ? ChatModel.ins.bubbleID : this._data.bubbleId;
            if (!this._bubble) {
                this._bubble = new Laya.Image()
                this._childs.push(this._bubble);
            };

            if (bubbleId == 84) {
                this._bubbleH = this._bubble.height = 82;
                this._bubble.sizeGrid = "48,46,26,45";
                this._bubbleDis = 14;
            } else {
                this._bubbleH = this._bubble.height = 65;
                this._bubble.sizeGrid = "22,46,29,45";
                this._bubbleDis = 0;
            }
            this._bubble.scaleX = this._isMySelf ? -1 : 1;
            bubbleId = this._data.bubbleId;
            let url: string = bubbleId == 0 ? pathConfig.defaultBubble() : pathConfig.getChatBubble(this._data.sex, bubbleId);
            this._bubble.skin = url;
            this._bubble.x = this.reconcileX(this._bubble, 77, true);
            parent.addChild(this._bubble);
        }

        private async showCp(cpLayer: Laya.Sprite, textLayer: Laya.Sprite): Promise<void> {
            if (this._data.cpBaseFrame == 0 || this._data.cpBaseFrame == 88 || this._data.cpNickSuffix == 0) return;
            if (!this._txCp) {
                this._txCp = new Laya.Text();
                this._txCp.font = "汉仪中圆简";
                this._txCp.fontSize = 15;
                this._txCp.color = "#ffffff";
                this._childs.push(this._txCp);
            }
            this._txCp.text = this._data.cpNick.substr(0, 6) + 'の' + xls.get(xls.chatType).get(this._data.cpNickSuffix).chatContent;
            this._txCp.x = this.reconcileX(this._txCp, this._txName.textWidth + 144);
            textLayer.addChild(this._txCp);

            if (!this._imgCp) {
                this._imgCp = new Laya.Image();
                this._imgCp.sizeGrid = '0,60,0,60';
                this._childs.push(this._imgCp);
            }
            let cls: xls.chatType = xls.get(xls.chatType).get(this._data.cpBaseFrame);
            let url: string = `res/chat/cp/${clientCore.LocalInfo.sex == 1 ? cls.f_chatPic : cls.m_chatPic}.png`;
            await res.load(url);
            this._imgCp.source = res.get(url);
            this._imgCp.width = this._txCp.width + 70;
            this._imgCp.x = this.reconcileX(this._imgCp, this._txName.textWidth + 108);
            cpLayer.addChild(this._imgCp);
        }

        private showVip(parent: Laya.Sprite): void {
            if (!this._vip) {
                this._vip = new Laya.Image("chat/icon_vip.png");
                this._childs.push(this._vip);
            }
            this._vip.x = this.reconcileX(this._vip, this._txName.textWidth + 88);
            parent.addChild(this._vip);
        }

        private showReportBtn(parent: Laya.Sprite) {
            if (!this._btnReport) {
                this._btnReport = new Laya.Image();
                this._btnReport.skin = "chat/reportBtn.png"
                this._childs.push(this._btnReport);
                // this._btnReport.scaleX = this._btnReport.scaleY = 0.3;
            }
            BC.addEvent(this, this._btnReport, Laya.Event.CLICK, this, this.onReportClick);
            if (!this._isMySelf) {
                this._btnReport.x = this._bubble.x + this._bubble.width - 5;
                parent.addChild(this._btnReport);
            }
        }
        private onReportClick() {
            alert.showSmall(`确定要举报 ${this._data.sendNick} 不文明用语吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_tip_off_player({ uid: this._data.sendUid, reason: 2, content: this._data.content })).then(() => {
                            alert.showFWords("举报成功");
                        });
                    }]
                },
                btnType: alert.Btn_Type.SURE_AND_CANCLE,
                needMask: true,
                clickMaskClose: false,
                needClose: true,
            })
        }

        private async showFace(parent: Laya.Sprite) {
            if (!this._face) {
                this._face = new Laya.Image();
                this._childs.push(this._face);
            };
            let id: number = parseInt(this._data.content);
            let size = xls.get(xls.chatType).get(id)?.size;
            if (size.v1 + size.v2 > 0) {
                this.height = size.v2 + 30;
            }
            else {
                this.height = 110;
            }
            let url: string = pathConfig.getChatEmoji(this._data.sex, id);
            await res.load(url);
            this._face.source = Laya.loader.getRes(url);
            this._face.x = this.reconcileX(this._face, 80);
            parent.addChild(this._face);
        }

        /**
         * 展示名称
         * @param parent 
         */
        private showName(parent: Laya.Sprite): void {
            if (!this._txName) {
                this._txName = new Laya.Text();
                this._txName.font = "汉仪中圆简";
                this._txName.fontSize = 15;
                this._txName.color = "#805329";
                this._childs.push(this._txName);
            }
            this._txName.text = this._data.sendNick;
            this._txName.x = this.reconcileX(this._txName, 84);
            parent.addChild(this._txName);
        }

        /**
         * 展示具体的文字聊天内容
         * @param parent 
         */
        private showChatValue(parent: Laya.Sprite): void {
            if (!this._txValue) {
                this._txValue = new util.HuaText();
                this._txValue.font = "汉仪中圆简";
                this._txValue.fontSize = 20;
                this._txValue.wordWrap = true;
                this._txValue.leading = 4;
                this._txValue.height = 40;

                this._txValue.valign = "middle";
                this._childs.push(this._txValue);
            };
            let bubbleId: number = this._isMySelf ? ChatModel.ins.bubbleID : this._data.bubbleId;
            let bubbleConfig = xls.get(xls.chatType).get(bubbleId);
            this._txValue.color = "#805329";
            if (bubbleConfig?.color)
                this._txValue.color = bubbleConfig.color;
            let max: number = ChatModel.ins.chatType != ChatType.PRIVATE ? 385 : 263;
            let bMax: number = ChatModel.ins.chatType != ChatType.PRIVATE ? 420 : 302;
            this._txValue.text = this._data.content;
            this._txValue.width = Math.min(this._txValue.lines.length * this._txValue.textWidth, max);
            this._txValue.x = this.reconcileX(this._txValue, 101, false, this._txValue.textWidth);
            this._bubble.width = _.clamp(Math.ceil(this._txValue.textWidth + 40), 100 + this._bubbleDis, bMax);
            if (this._isMySelf && this._txValue.textWidth + 40 < 100) {
                this._txValue.x -= 60 - this._txValue.textWidth;
            }
            // 大于3行
            let _count: number = Math.max(this._txValue.lines.length - 2, 0);
            let _addH: number = _count * 19;
            this._bubble.height = this._bubbleH + _addH;
            this.height = 86 + _addH + this._bubbleDis;

            parent.addChild(this._txValue);
        }

        public set x(value: number) {
            // this._x = 10 + value;
            this._iconFrame && (this._iconFrame.x = this.reconcileX(this._iconFrame, -7) - value);
            this._face && (this._face.x = this.reconcileX(this._face, 80) + value);
            this._bubble && (this._bubble.x = this.reconcileX(this._bubble, 77, true) + value);
            this._txValue && (this._txValue.x = this.reconcileX(this._txValue, 101) + value);
            this._txName && (this._txName.x = this.reconcileX(this._txName, 84) + value);
            this._vip && (this._vip.x = this.reconcileX(this._vip, this._txName.textWidth + 10));
            this._icon.x = this.reconcileX(this._icon, 0) - value;
            this._btnReport && this._bubble && (this._btnReport.x = this._bubble.x + this._bubble.width - 8);
            if (this._txCp) {
                this._txCp.x = this.reconcileX(this._txCp, this._txName.textWidth + 144);
            }
            if (this._imgCp) {
                this._imgCp.x = this.reconcileX(this._imgCp, this._txName.textWidth + 108);
            }
        }

        public set y(value: number) {
            this._y = value;
            this._iconFrame && (this._iconFrame.y = value - 11.25);
            this._face && (this._face.y = 32 + value);
            this._bubble && (this._bubble.y = 28 + value);
            this._txValue && (this._txValue.y = 38 + value + this._bubbleDis);
            this._txName && (this._txName.y = 10 + value);
            this._vip && (this._vip.y = 5 + value);
            this._icon.y = value;
            this._btnReport && this._bubble && (this._btnReport.y = this._bubble.y + (this._bubble.height - this._btnReport.height) - 3);
            if (this._txCp) {
                this._txCp.y = 10 + value;
            }
            if (this._imgCp) {
                this._imgCp.y = value - 5.5;
            }
        }

        public get x(): number {
            return this._x;
        }

        public get y(): number {
            return this._y;
        }

        /** 是否显示*/
        public set visible(value: boolean) {
            this._visible = value;
            _.forEach(this._childs, (ele: Laya.Sprite) => {
                ele.visible = value;
            });
        }
        public get visible(): boolean {
            return this._visible;
        }

        public pos(x: number, y: number): void {
            this.x = x;
            this.y = y;
        }

        public dispose(): void {
            _.forEach(this._childs, (ele: Laya.Sprite) => {
                ele.visible = true;
                ele.removeSelf();
            });
            BC.removeEvent(this);
            clientCore.UserInfoTip.removeTips(this._iconFrame);
            this._visible = true;
            this._data = null;
            this.height = 86;
            Laya.Pool.recover("chat.item.ItemGrid", this);

        }

        public static create(): ItemGrid {
            return Laya.Pool.getItemByClass("chat.item.ItemGrid", ItemGrid);
        }
    }
}