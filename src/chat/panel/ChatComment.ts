namespace chat.panel {

    export enum ComponentType { //快捷聊天 表情 气泡 头像 红包 花缘昵称底框 花缘昵称后缀
        QUICK_CHAT = 1,
        FACE,
        BUBBLE,
        RED_PACKAGE,
        CP_NICK
    }

    /**
     * 聊天的底部组件-包括（表情、红包...）
     */
    export class ChatComponent extends ui.chat.ChatComponentUI {
        private _findMap = [ComponentType.FACE, ComponentType.BUBBLE, ComponentType.QUICK_CHAT, ComponentType.CP_NICK];
        private _model: ChatModel;
        /** 页签*/
        private _page: number;
        /** 当前选择组件类型*/
        private _currComType: number;
        /** 组件内容*/
        private _componseList: util.ListPanel;
        /** 选择的具体组件*/
        private _selectCom: any;

        private _currentIndex: number;

        constructor() { super(); }

        public init(d: any): void {
            super.init(d);
            this._model = ChatModel.ins;
            this.initList();
            this.addEventListeners();
        }

        public addEventListeners(): void {
            let t: ChatComponent = this;
            t._model.on(ChatModel.REFRESH_PAENL, t, t.refresh);
            t._model.on(ChatModel.CACHE_RECENT, t, t.cacheRecent);
        }

        public removeEventListeners(): void {
            let t: ChatComponent = this;
            t._model.off(ChatModel.REFRESH_PAENL, t, t.refresh);
            t._model.off(ChatModel.CACHE_RECENT, t, t.cacheRecent);
        }

        private initList(): void {
            let t: ChatComponent = this;
            //组合内容列表
            t._componseList = new util.ListPanel(131, 9, 474, 197);
            t._componseList.hScrollBarSkin = "";
            t._componseList.hScrollBar.mouseWheelEnable = false;
            t._componseList.renderHandler = Laya.Handler.create(t, t.comRender, null, false);
            t._componseList.selectHandler = Laya.Handler.create(t, t.comSelect, null, false);
            t._componseList.holdHandle = Laya.Handler.create(t, t.comHold, null, false);
            t._componseList.scrollEnd = Laya.Handler.create(t, t.onScrollBarEnd, null, false);
            t.addChildAt(t._componseList, 4);
            //底部选择列表
            t.bottomList.hScrollBarSkin = "";
            t.bottomList.renderHandler = Laya.Handler.create(t, t.bottomRender, null, false);
            t.bottomList.selectHandler = Laya.Handler.create(t, t.bottomSelect, null, false);
            //左侧选项列表
            t.leftList.renderHandler = Laya.Handler.create(t, t.leftRender, null, false);
            t.leftList.selectHandler = Laya.Handler.create(t, t.leftSelect, null, false);
            t.leftList.array = ["表情", "气泡框", "快捷聊天", "花缘昵称"];
            t.leftList.selectedIndex = 2;
            // 页数列表
            t.pageList.renderHandler = Laya.Handler.create(t, t.pageHandler, null, false);
        }

        /** 左侧列表渲染*/
        private leftRender(item: Laya.Box, index: number): void {
            let img: Laya.Image = item.getChildByName("bg") as Laya.Image;
            let valueStr: string = item.dataSource; //值
            img.visible = index == this.leftList.selectedIndex;
            if (!item["lab"]) {
                let lab: Laya.Label = item.getChildByName("lab") as Laya.Label;
                lab.changeText(valueStr);
                item["lab"] = true;
            }
        }

        /** 组件类型选择*/
        private leftSelect(index: number): void {
            if (index == -1 || index == this._currentIndex) return;
            // if (this.leftList.selectedIndex == index) return;
            // if (index != 4 && index != 0) { //TODO 此版本只保留快捷回复
            //     alert.showFWords("功能尚未开启^_^");
            //     this.leftList.selectedIndex = 4;
            //     return;
            // }
            if (index == 3 && !clientCore.CpManager.instance.haveCp()) {
                alert.showFWords('小花仙还没有花缘对象哦！');
                this.leftList.selectedIndex = this._currentIndex;
                return;
            }
            this._selectCom = null;
            this._currComType = this._findMap[index];
            this._componseList.needHold = this._currComType == ComponentType.FACE;
            this._currentIndex = index;
            this.showPanel();
        }

        /** 显示组件面板*/
        private async showPanel() {
            let array: string[] = [];
            if (this._currComType != ComponentType.CP_NICK) { //CP特殊处理一下
                await ChatSCommand.ins.getChatComponentInfo(this._findMap[this.leftList.selectedIndex]);
                let hasHiy: boolean = this._model.lately && this._model.lately[this._currComType];
                //去掉 最近 标签
                hasHiy = false;
                if (this._currComType != ComponentType.RED_PACKAGE) {
                    array = this._model.xlsMap[this._currComType].getKeys();
                    if (this._currComType == 2) {//表情类把角色表情排在最前面
                        array.unshift(array.pop());
                    }
                    array = hasHiy ? ["最近"].concat(array) : array;
                }
            } else {
                array = this._model.xlsMap[5].getKeys().concat(this._model.xlsMap[6].getKeys());
            }

            this.bottomList.selectedIndex = -1;
            this.bottomList.array = array;
            this._componseList.resizeData();
            switch (this._currComType) {
                case ComponentType.QUICK_CHAT:
                    this.setComInfo(item.QuickChatItem, 3, 3);
                    break;
                case ComponentType.FACE:
                    this.setComInfo(item.FaceItem, 4, 2);
                    break;
                case ComponentType.BUBBLE:
                    this.setComInfo(item.BubbleItem, 3, 1);
                    break;
                case ComponentType.RED_PACKAGE:
                    this.setComInfo(item.RedPackageItem, 3, 1);
                    this.showRedPackage(new Array(10));
                    break;
                case ComponentType.CP_NICK:
                    this.setComInfo(item.CpItem, 3, 2);
                    break;
                default:
                    break;
            }
            this.bottomList.selectedIndex = 0;
        }

        /** 底部列表渲染*/
        private bottomRender(item: Laya.Box, index: number): void {
            let img: Laya.Image = item.getChildByName("bg") as Laya.Image;
            let lab: Laya.Label = item.getChildByName("label") as Laya.Label;
            img.visible = index != this.bottomList.selectedIndex;
            lab.changeText(this.bottomList.array[index]);
        }
        /** 底部选择*/
        private bottomSelect(index: number): void {
            if (index == -1) return;
            let key: string = this.bottomList.array[index];
            switch (this._currComType) {
                case ComponentType.QUICK_CHAT:
                    this.showQuickChat(key);
                    break;
                case ComponentType.FACE:
                    this.showFace(key);
                    break;
                case ComponentType.BUBBLE:
                    this.showBubble(key);
                    break;
                case ComponentType.RED_PACKAGE:
                    break;
                case ComponentType.CP_NICK:
                    this.showCp(key);
                    break;
                default:
                    break
            };
            this.showPages(this._componseList.totalPage);
        }


        /** 组件内容渲染*/
        private comRender(item: item.IType, index: number): void {
            item.setData(this._componseList.array[index]);
        }
        /** 组合内容选择*/
        private comSelect(index: number): void {
            let cell: any = this._componseList.getCell(index);
            let isBubble: boolean = cell instanceof item.BubbleItem;
            if (isBubble) {
                this._selectCom && (this._selectCom.imgSelect.visible = false);
                cell.imgSelect.visible = true;
                this._selectCom == cell && cell.onClick();
            } else {
                cell.onClick();
            }
            this._selectCom = cell;
        }
        /** 组合内容长按*/
        private comHold(index: number): void {
            let cell: any = this._componseList.getCell(index);
            let isFace: boolean = cell instanceof item.FaceItem;
            if (isFace) {
                cell.onHold();
            }
        }

        /** 组件面板滑动结束*/
        private onScrollBarEnd(page: number): void {
            this._page = page;
            this.pageList.refresh();
        }
        /** 页签渲染*/
        private pageHandler(item: Laya.Image, index: number): void {
            let tag: number = index == this._page ? 1 : 0;
            item.source = Laya.loader.getRes("chat/x-" + tag + ".png");
        }

        //设置组件的渲染单元吧
        private setComInfo(itemRender: any, repeatX: number, repeatY: number): void {
            this._componseList.itemRender = itemRender;
            this._componseList.repeatX = repeatX;
            this._componseList.repeatY = repeatY;
        }

        //展示快捷回复吧
        private showQuickChat(key: string): void {
            this._componseList.array = this.getComponetArr(ComponentType.QUICK_CHAT, key);
        }

        //展示表情吧
        private showFace(key: string): void {
            this._componseList.spaceX = 50;
            this._componseList.spaceY = 16;
            this._componseList.array = this.getComponetArr(ComponentType.FACE, key);
        }

        //展示气泡
        private showBubble(key: string): void {
            let array = this.getComponetArr(ComponentType.BUBBLE, key);
            let left: any[] = [];
            let right: any[] = [];
            for (let i = 0; i < array.length; i++) {
                if (clientCore.ItemsInfo.checkHaveItem(array[i].itemNeed) || clientCore.UserHeadManager.instance.getOneInfoById(array[i].itemNeed)?.have) left.push(array[i]);
                else right.push(array[i]);
            }
            this._componseList.spaceX = 15;
            this._componseList.array = left.concat(right);
        }

        //展示红包吧
        private showRedPackage(list: any[]): void {
            this._componseList.spaceX = 17;
            this._componseList.array = list;
        }

        //展示cp昵称吧
        private showCp(key: string): void {
            this._componseList.spaceY = 20;
            this._componseList.array = this.getCpArr(key);
        }

        private getCpArr(key: string): xls.chatType[] {
            return this._model.xlsMap[5].get(key) || this._model.xlsMap[6].get(key);
        }

        private getComponetArr(type: ComponentType, key: string): xls.chatType[] {
            let array: xls.chatType[] = this._model.xlsMap[type].get(key);
            if (!array) {
                array = [];
                let latelys: number[] = this._model.lately[type];
                _.forEach(latelys, (element: number) => {
                    let data: xls.chatType = xls.get(xls.chatType).get(element);
                    array.push(data);
                })
            }
            return array;
        }

        private refresh(): void {
            this._componseList.listRefresh();
        }

        private showPages(num: number): void {
            this.pageList.array = null;
            this._page = 0;
            this.pageList.array = new Array(num + 1);
        }

        /**
         * 缓存使用历史
         * @param type 
         * @param data  
         */
        private cacheRecent(type: ComponentType, data: xls.chatType): void {
            let hasHiy: boolean = this._model.lately && this._model.lately[type] != null;
            hasHiy = true;
            if (hasHiy && this.bottomList.selectedIndex == 0) {
                return;
            }
            this._model.cacheRecent(type, data.chatId);
            if (!hasHiy) { //没有最近
                let array: string[] = ["最近"].concat(this.bottomList.array);
                this.bottomList.array = array;
                this.bottomList.selectedIndex++;
            }
        }

        public destroy(): void {
            this.bottomList.array = null;
            super.destroy();
        }
    }
}