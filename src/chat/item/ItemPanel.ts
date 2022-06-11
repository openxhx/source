namespace chat.item {
    /**
     * 显示聊天界面
     */
    export class ItemPanel {

        /** 头像框层*/
        private _iconFrameLayer: Laya.Sprite;
        /** 头像层*/
        private _iconLayer: Laya.Sprite;
        /** 气泡层*/
        private _bubbleLayer: Laya.Sprite;
        /** cp底框层*/
        private _cpLayer: Laya.Sprite;
        /** 文字层*/
        private _textLayer: Laya.Sprite;
        /** 当前altas层*/
        private _atlasLayer: Laya.Sprite;
        /** 表情层*/
        private _faceLayer: Laya.Sprite;
        /** 高度改变值*/
        private _changeValue: number = 0;

        private _itemMap: ItemGrid[];
        private _timeItemMap: TimeGrid[];
        private _systemMap: ItemSystemGrid[];
        private _cpSystemMap: CpSystemGrid[];
        private _noticeMap: SystemGrid[];
        private _parent: Laya.Panel;
        private _spaceY: number = 15;
        private _height: number = 0;

        /** 层列表*/
        private _layers: Laya.Sprite[];
        /** 当前滑条位置*/
        private _scrVal: number = 0;
        /** 记录上条消息的时间*/
        private _lastChatTime: number;
        /** 数据*/
        private _array: Array<pb.chat_msg_t>;

        private _newMsgNum: number = 0;
        private _isSelfMsg: boolean = false;

        constructor() {

        }

        public init(parent: Laya.Panel): void {
            let t: ItemPanel = this;
            t._parent = parent;
            t._iconLayer = parent.addChild(new Laya.Sprite()) as Laya.Sprite;
            t._iconFrameLayer = parent.addChild(new Laya.Sprite()) as Laya.Sprite;
            t._bubbleLayer = parent.addChild(new Laya.Sprite()) as Laya.Sprite;
            t._cpLayer = parent.addChild(new Laya.Sprite()) as Laya.Sprite;
            t._bubbleLayer.mouseThrough = true;
            t._bubbleLayer.width = t._parent.width;
            t._bubbleLayer.height = t._parent.height;
            t._faceLayer = parent.addChild(new Laya.Sprite()) as Laya.Sprite;
            t._atlasLayer = parent.addChild(new Laya.Sprite()) as Laya.Sprite;
            t._textLayer = parent.addChild(new Laya.Sprite()) as Laya.Sprite;
            t._itemMap = [];
            t._timeItemMap = [];
            t._systemMap = [];
            t._cpSystemMap = [];
            t._noticeMap = [];
            t._layers = [t._iconFrameLayer, t._iconLayer, t._bubbleLayer, t._faceLayer, t._atlasLayer, t._textLayer];
            t._parent.vScrollBar.rollRatio = 0.92;
            t._parent.vScrollBar.mouseWheelEnable = false;
            t._parent.vScrollBar.on(Laya.Event.CHANGE, t, t.checkInRect);
            // t._parent.vScrollBar.changeHandler = new Laya.Handler(this,this.onScrollBarChange);
            t._parent.vScrollBar.on(Laya.Event.END, t, t.onScrollBarChange);

        }

        private onScrollBarChange() {
            let max = this._parent.vScrollBar.slider.max;
            let value = this._parent.vScrollBar.slider.value;
            // console.log(`end max ${max}  value${value}`);
            if (value >= max - 5) {
                if (this._newMsgNum > 0) {
                    this._newMsgNum = 0;
                    this._parent.event("SHOW_NEW_MESSAGE_TIPS", this._newMsgNum);
                }
            }
        }


        /**
         * 生成聊天页
         * @param list 
         */
        public generateItems(list: pb.chat_msg_t[], showTime?: boolean): void {
            _.forEach(list, (ele: pb.chat_msg_t) => {
                this.creItemByData(ele, showTime)
            });
            this.generateEnd();
            this._array = list;
        }

        public addOneNewMessage(data: pb.chat_msg_t, showTime?: boolean) {
            this._isSelfMsg = (data.sendUid == clientCore.LocalInfo.uid);
            this.creItemByData(data, showTime);
            this.generateEnd();

            let slider: Laya.Slider = this._parent.vScrollBar.slider;
            let curValue = slider.value;
            let preMax = slider.max;
            if (curValue < preMax) {
                this._newMsgNum++;
                this._parent.event("SHOW_NEW_MESSAGE_TIPS", this._newMsgNum);
            }
        }

        public showAllNewMsg() {
            let max = this._parent.vScrollBar.slider.max;
            this._parent.vScrollBar.slider.setSlider(0, max, max);
            this._newMsgNum = 0;
            this._parent.event("SHOW_NEW_MESSAGE_TIPS", this._newMsgNum);
        }

        public async creItemByData(data: pb.chat_msg_t, showTime?: boolean) {
            if (showTime) {
                let diff: number = this._lastChatTime > 0 ? (data.sendTime - this._lastChatTime) : (_.round(Laya.Browser.now() / 1000) - data.sendTime);;
                if (diff > 180) { //大于180秒显示时间
                    let timeItem: TimeGrid = TimeGrid.create();
                    let timeStr: string = util.TimeUtil.analysicTime(data.sendTime * 1000, !util.TimeUtil.isToday(data.sendTime));
                    timeItem.init(this._atlasLayer, this._textLayer, timeStr, this._parent.width);
                    timeItem.y = this._height;
                    this._height += (TimeGrid.HEIGHT + this._spaceY);
                    this._timeItemMap.push(timeItem);
                }
            }
            if (data.sendUid == 0) {
                let systemItem: ItemSystemGrid = ItemSystemGrid.create();
                systemItem.init(data, this._bubbleLayer, this._textLayer);
                systemItem.y = this._height;
                this._height += (systemItem.height + this._spaceY);
                this._systemMap.push(systemItem);
            }
            else if (data.sendUid == 1) { //当sendUid为1 认为是羁绊赠礼通知
                let item: CpSystemGrid = CpSystemGrid.create();
                item.init(this._atlasLayer, this._textLayer, data.content);
                item.y = this._height;
                item.x = this._parent.width - item.width;
                this._height += item.height + this._spaceY;
                this._cpSystemMap.push(item);
            }
            else if (data.sendUid == 2) { //当sendUid为2 认为是系统公告
                let item: SystemGrid = SystemGrid.create();
                item.init(this._atlasLayer, this._textLayer, data.content);
                item.y = this._height;
                item.x = 0;
                this._height += item.height + this._spaceY + 5;
                this._noticeMap.push(item);
            }
            else {
                let item: ItemGrid = ItemGrid.create();
                item.init(data, this._atlasLayer, this._iconFrameLayer, this._iconLayer, this._bubbleLayer, this._cpLayer, this._faceLayer, this._textLayer);
                item.y = this._height;
                this._height += (item.height + this._spaceY);
                this._itemMap.push(item);
            }
            this._lastChatTime = data.sendTime;
        }

        /**
         * 生成对象成功
         */
        public generateEnd(): void {
            _.forEach(this._layers, (layer: Laya.Sprite) => {
                layer.height = this._height;
            });
            this.resizeH(this._changeValue);
        }

        /**
         * 重置高度
         * @param value 改变的值
         * @param isForce 是否强制重置
         */
        public resizeH(value: number, isForce?: boolean): void {
            this._changeValue = value;
            let diff: number = value < 0 ? value : 0;
            if (!isForce && this._height < this._parent.height + diff) {
                return;
            }
            let slider: Laya.Slider = this._parent.vScrollBar.slider;
            let curValue = slider.value;
            let preMax = slider.max;
            let max: number = this._height - this._parent.height - diff;
            max = Math.max(max, 0);
            // console.log(`curvalue ${curValue}  max${max}`);
            if (this._isSelfMsg || curValue / preMax > 0.9) {
                slider.setSlider(0, max, max);
                // this.showAllNewMsg();
                this._parent.event("SHOW_NEW_MESSAGE_TIPS", 0);
            }
            else {
                slider.setSlider(0, max, curValue);
            }

        }

        /** 检查是否在显示范围 否则隐藏*/
        private checkInRect(isForce?: boolean): void {
            let scrVal: number = this._parent.vScrollBar.value;
            let delayVal: number = 300; //缓冲区
            if (!isForce && Math.abs(this._scrVal - scrVal) < delayVal) {
                return;
            };
            this._scrVal = scrVal;
            _.forEach(this._itemMap, (element: ItemGrid) => {
                let diff: number = Math.abs(element.y - scrVal);
                let w: number = scrVal >= element.y ? element.height : this._parent.height;
                element.visible = diff < w + delayVal;
            });
            _.forEach(this._timeItemMap, (ele: TimeGrid) => {
                let diff: number = Math.abs(ele.y - scrVal);
                let w: number = scrVal >= ele.y ? TimeGrid.HEIGHT : this._parent.height;
                ele.visible = diff < w + delayVal;
            });
            // this.checkToBottom();
        }

        /** 将信息全部清理*/
        public cleanMap(): void {
            _.forEach(this._itemMap, (item: ItemGrid) => {
                item.dispose();
            });
            _.forEach(this._timeItemMap, (timeItem: TimeGrid) => {
                timeItem.dispose();
            });
            _.forEach(this._systemMap, (systemItem: ItemSystemGrid) => {
                systemItem.dispose();
            });
            _.forEach(this._cpSystemMap, (element: CpSystemGrid) => {
                element.dispose();
            });
            _.forEach(this._noticeMap, (element: SystemGrid) => {
                element.dispose();
            });
            let slider: Laya.Slider = this._parent.vScrollBar.slider;
            slider.value = slider.max = 0;
            this._itemMap = [];
            this._timeItemMap = [];
            this._systemMap = [];
            this._cpSystemMap = [];
            this._noticeMap = [];
        }

        public get length(): number {
            return this._array.length;
        }

        public dispose(): void {
            let t: ItemPanel = this;
            t._lastChatTime = t._height = t._scrVal = 0;
            t.cleanMap();
        }

        public destroy(): void {
            this._parent.vScrollBar.off(Laya.Event.CHANGE, this, this.checkInRect);
            this.dispose();
        }
    }
}