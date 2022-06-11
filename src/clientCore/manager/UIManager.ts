/// <reference path="uiManager/HomeMainUI.ts" />
/// <reference path="uiManager/FamilyMainUI.ts" />
/// <reference path="uiManager/FriendHomeMainUI.ts" />
/// <reference path="uiManager/PartyMainUI.ts" />
/// <reference path="uiManager/WorldMapMainUI.ts" />
/// <reference path="uiManager/BossMainUI.ts" />
/// <reference path="uiManager/WeddinMainUI.ts" />
/// <reference path="uiManager/AnswerMainUI.ts" />
/// <reference path="uiManager/OnsenRyokanMainUI.ts" />
/// <reference path="uiManager/OrchardMainUI.ts" />
/// <reference path="uiManager/SamsungMainUI.ts" />
namespace clientCore {
    const BASE_ICONID_ARR = [
        [9900001, 9900002, 9900003],
        [9900002, 9900010],
        [9900001, 9900002, 9900003],
        [9900001, 9900002, 9900003],
        [],
        [9900002]
    ];
    export class UIManager {
        public static enabledBtns: boolean = true;
        public static CHANGE_HOME_BTN: string = "change_home_btn";
        public static commonMoney: ui.main.MainMoneyUI;
        private static _talk: ui.main.MainTalkUI;
        public static curMainUI: MainUIBase;
        public static curShowType: "boss" | "home" | "family" | "friendHome" | "party" | "worldMap" | 'wedding' | 'answer' | 'onsenRyokan' | 'orchard' | 'samsung' |"" = "";
        private static mainUIObjArr = [
            new HomeMainUI(),
            new FamilyMainUI(),
            new FriendHomeMainUI(),
            new WorldMapMainUI(),
            new PartyMainUI(),
            new BossMainUI(),
            new WeddinMainUI(),
            new AnswerMainUI(),
            new OnsenRyokanMainUI(),
            new OrchardMainUI(),
            new SamsungMainUI()
        ];
        private static typeArr = ["home", "family", "friendHome", "worldMap", "party", "boss", 'wedding', 'answer', 'onsenRyokan','orchard','samsung'];
        private static _chatValues: pb.Ichat_msg_t[] = [];
        private static _showUIFlag: boolean = true;
        public static imgHideUI: Laya.Image;

        public static showCoinBox(): void {
            this.commonMoney.x = LayerManager.stageWith - 60;
            this.commonMoney.y = 0;
            LayerManager.upMainLayer.addChild(this.commonMoney);
        }

        public static refrehMoneyEvent(handler: Laya.Handler): void {
            this.commonMoney.listMoney.mouseHandler = handler;
        }

        public static releaseEvent(): void {
            this.commonMoney.listMoney.mouseHandler = null;
            this.commonMoney.listMoney.mouseHandler = Laya.Handler.create(this, this.onMoneyMouse, null, false);
        }

        /**
         * 释放右上方的代币组件
         */
        public static releaseCoinBox() {
            this.setMoneyIds(BASE_ICONID_ARR[this.typeArr.indexOf(this.curShowType)]);
            this.commonMoney.x = LayerManager.stageWith - 60;
            this.commonMoney.y = 0;
            LayerManager.uiLayer.addChild(this.commonMoney);
        }

        public static setMoneyIds(arr: number[] = []) {
            arr = arr.slice();
            // alert.showFWords("转化后的数组："+arr.toString());
            if (arr.length > 4) {
                console.warn('资源栏目前只支持4个');
            }
            else {
                let need = 4 - arr.length;
                for (let i = 0; i < need; i++)
                    arr.unshift(0);
                this.commonMoney.listMoney.dataSource = arr;
            }
        }

        /**刷新货币信息  @yonghui */
        public static refreshMoney() {
            this.commonMoney.listMoney.refresh();
        }
        /**获取当前货币信息  @yonghui */
        public static getCurMoney() {
            if (this.commonMoney.parent == LayerManager.uiLayer) return [];
            return this.commonMoney.listMoney.dataSource;
        }

        public static setup() {
            this.commonMoney = new ui.main.MainMoneyUI();
            this.commonMoney.mouseThrough = true;
            this._talk = new ui.main.MainTalkUI();
            this._talk.visible = false;

            this.commonMoney.listMoney.renderHandler = Laya.Handler.create(this, this.onMoneyRender, null, false);
            this.commonMoney.listMoney.mouseHandler = Laya.Handler.create(this, this.onMoneyMouse, null, false);
            this.commonMoney.y = 0;
            LayerManager.uiLayer.addChild(this.commonMoney);
            this.imgHideUI = new Laya.Image();
            this.imgHideUI.skin = "main/hideUI.png";
            this.imgHideUI.y = 5;
            this.imgHideUI.mouseEnabled = true;
            this.changeMainUI("home");
            this.onResizeView();
            this.addEvent();

            util.RedPoint.updateRed();
        }

        public static eyeVisble(value: boolean): void {
            this.imgHideUI && (this.imgHideUI.visible = value);
        }

        private static onOpenChanged() {
            this._talk.visible = SystemOpenManager.ins.getIsOpen(6);// && LocalInfo.age >= 18;
            this.commonMoney.listMoney.startIndex = this.commonMoney.listMoney.startIndex;
        }
        private static onMoneyRender(cell: ui.main.render.MoneyBoxUI, idx: number) {
            let id = cell.dataSource;
            if (id == 0)
                cell.visible = false;
            else {
                cell.imgIIcon.skin = id == 0 ? '' : ItemsInfo.getItemIconUrl(id);
                cell.txt.text = MoneyManager.checkIsMoney(id) ? MoneyManager.getNumById(id).toString() : ("" + ItemsInfo.getItemNum(id));
            }
            // if (id == MoneyManager.SPIRIT_BEAN_MONEY_ID) {
            //     // cell.btnAdd.visible = SystemOpenManager.ins.getIsOpen(29);
            //     // TODO  测试 需要删除
            //     cell.btnAdd.visible = true;
            // }
            // cell.btnRed.visible = id == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID && cell.btnAdd.visible && clientCore.LocalInfo.userLv >= 8;
            cell.btnRed.visible = false;
            if (id == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID)
                cell.btnRed.visible = clientCore.LocalInfo.userLv >= 8;
            else if (id == 1511008)
                cell.btnRed.visible = clientCore.LocalInfo.userLv >= 8 && util.RedPoint.checkShow([11801]);//2020 大充花恋流年
            else if (id == 1511010)
                cell.btnRed.visible = clientCore.LocalInfo.userLv >= 8 && util.RedPoint.checkShow([16901]);//2020 中秋华彩月章
            else if (id == 1511012) {//2020 淘乐节
                clientCore.MedalManager.getMedal([MedalDailyConst.GINKGOOATH_DAILY_ALL_GIFT]).then((o) => {
                    cell.btnRed.visible = o[0].value == 0;
                })
            }
        }
        private static onMoneyMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let id = e.currentTarget['dataSource'];
                switch (id) {
                    case clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID:
                        ToolTip.gotoMod(50);
                        break;
                    case clientCore.MoneyManager.LEAF_MONEY_ID:
                        alert.alertQuickBuy(MoneyManager.LEAF_MONEY_ID, 1);
                        break;
                    case clientCore.MoneyManager.HEART_ID:
                    case clientCore.MoneyManager.FAMILY_CON:
                    case clientCore.MoneyManager.FAIRY_DEW_MONEY_ID:
                    case clientCore.MoneyManager.FRIEND_MONEY_ID:
                        clientCore.ToolTip.showTips(e.target, { id: id });
                        break;
                    case 1511008://大充活动代币 花语简
                        EventManager.event("ANNIVERSARY_BUY_MONEY");
                        break;
                    case 9900056://鹊桥期遇代币 钥匙
                        EventManager.event("MAGPIE_BRIDGE_BUY_KEY");
                        break;
                    case 9900060://作业如诗
                        EventManager.event("MAGPIE_BRIDGE_BUY_KEY");
                        break;
                    case 9900083://花斯卡
                        EventManager.event("HUASCARS_BUY_GOLDMAN");
                        break;
                    default:
                        let array: xls.shop[] = xls.get(xls.shop).getValues();
                        let len: number = array.length;
                        let quickSell: boolean = false;
                        let buyCnt: number = 0;
                        for (let i: number = 0; i < len; i++) {
                            let element: xls.shop = array[i];
                            if (element.itemId == id && element.quickSell == 1) {
                                quickSell = true;
                                buyCnt = element.unitNum;
                                break;
                            }
                        }
                        if (quickSell)
                            alert.alertQuickBuy(id, buyCnt, true);
                        else
                            clientCore.ToolTip.showTips(e.target, { id: id });
                        break;
                }

            }
        }
        private static addEvent() {
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.onMoneyChange);
            EventManager.on(globalEvent.MATERIAL_CHANGE, this, this.onMoneyChange);
            EventManager.on(globalEvent.SYSTEM_OPEN_CHANGED, this, this.onOpenChanged);
            //监听聊天
            net.listen(pb.sc_notify_chat_msg, this, this.onNotifyChat);
            this._talk.on(Laya.Event.CLICK, this, this.showTalkModule);
            this.imgHideUI.on(Laya.Event.CLICK, this, this.onHideUIClick);
            Laya.stage.on(Laya.Event.CLICK, this, this.onStageClick);
            EventManager.on(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, this, this.showFakeSystemMsg);
            EventManager.on(globalEvent.STAGE_RESIZE, this, this.onResizeView);
        }
        private static onResizeView(): void {
            this.imgHideUI && (this.imgHideUI.x = LayerManager.stageWith - 60);
            this.commonMoney && (this.commonMoney.x = LayerManager.stageWith - 60);
        }
        private static onHideUIClick(e: Laya.Event) {
            this.showUIFlag = !this.showUIFlag;
            this._cheetNum = 0;
        }
        private static _cheetNum: number;
        private static onStageClick() {
            // if (!this.showUIFlag) {
            //     if (Laya.stage.mouseX < Laya.stage.width / 2 && this._cheetNum < 5) {
            //         this._cheetNum += 1;
            //     }
            //     else if (Laya.stage.mouseX > Laya.stage.width / 2 && this._cheetNum >= 5) {
            //         this._cheetNum += 1;
            //     }
            //     else {
            //         this._cheetNum = 0;
            //     }
            //     if (this._cheetNum == 10) {
            //         // 关闭UI后左边点5下 右边点5下，打开所有系统
            //         for (const id of xls.get(xls.systemTable).getKeys()) {
            //             clientCore.SystemOpenManager.ins.debugOpen(parseInt(id), true);
            //         }
            //         Laya.Stat.show();
            //         Laya.stage.off(Laya.Event.CLICK, this, this.onStageClick);
            //         this.showUIFlag = true;
            //     }
            // }
        }
        private static showTalkModule() {
            ModuleManager.open("chat.ChatModule");
        }
        public static showTalk() {
            this._talk.x = 15;
            this._talk.y = Laya.stage.height - 8;
            LayerManager.uiLayer.addChild(this._talk);
        }
        public static hideTalk() {
            this._talk.removeSelf();
        }
        private static showFakeSystemMsg(msg: pb.Ichat_msg_t) {
            /**
             * 为何类型5，不在小窗显示
             * 因为boss战，世界跟系统都显示，所有有两个广播事件过来，需要过滤一条，不然有两个一样的公告
             */
            if (msg.chatType != 5)
                this.showSmallChat(msg);
            ChatManager.cacheInfos(msg as pb.chat_msg_t);
            EventManager.event(globalEvent.NOTIFY_CHAT, [msg]);
        }
        private static onNotifyChat(data: pb.sc_notify_chat_msg): void {
            let msg: pb.Ichat_msg_t = data.msg;
            this.showSmallChat(msg);
            ChatManager.cacheInfos(msg as pb.chat_msg_t);
            EventManager.event(globalEvent.NOTIFY_CHAT, [msg]);
        }
        private static showSmallChat(msg: pb.Ichat_msg_t): void {
            if (msg.chatType == 4) return;
            if (msg.special == 2) {
                this._chatValues.length = 0;
            } else {
                if (this._chatValues.length == 2 || (this._chatValues[0] && this._chatValues[0].special == 2)) this._chatValues.shift();
            }
            this._chatValues.push(msg);
            for (let i: number = 0; i <= 1; i++) {
                let ele: pb.Ichat_msg_t = this._chatValues[i];
                let tag: number = i + 1;
                this._talk["iChatType" + tag].visible = this._talk["txChat" + tag].visible = ele != void 0;
                if (ele) {
                    this._talk["iChatType" + tag].source = Laya.loader.getRes("main/chat" + ele.chatType + ".png");
                    let isFace: boolean = ele.special == 2;
                    this._talk.imgChat.visible = false;
                    let tx: Laya.Label = this._talk["txChat" + tag];
                    if (isFace) { //表情
                        tx.width = 0;
                        tx.text = "【" + ele.sendNick + "】";
                        let id: number = parseInt(ele.content);
                        if (xls.get(xls.chatType)?.get(id)?.chatName) {
                            tx.text += `[${xls.get(xls.chatType).get(id).chatName}]`;
                        }
                        else {
                            this._talk.imgChat.visible = true;
                            this._talk.imgChat.x = tx.x + tx.width;
                            this._talk.imgChat.skin = pathConfig.getChatEmoji(ele.sex, id);
                        }
                        continue;
                    }
                    tx.width = 356;
                    tx.text = "【" + ele.sendNick + "】" + ele.content.replace(/\n|\r/g, " ");
                }
            }
        }
        private static onMoneyChange(e: Laya.Event = null) {
            this.commonMoney.listMoney.refresh();
            this.curMainUI.showUserInfo();
        }

        public static changeMainUI(type: 'home' | 'family' | 'friendHome' | 'party' | 'worldMap' | 'boss' | 'wedding' | 'answer' | 'onsenRyokan' | 'orchard' | 'samsung') {
            if (this.curShowType == type && this.curShowType != "friendHome") {
                return;
            }
            if (this.curMainUI) {
                this.close();
            }
            this.imgHideUI.visible = true;
            this.curShowType = type;
            this.curMainUI = this.mainUIObjArr[this.typeArr.indexOf(type)];
            this.curMainUI.setUp();
            this.curMainUI.open();
            this.commonMoney.visible = true;
            this.releaseCoinBox();
            this._showUIFlag = true;
            LayerManager.uiLayer.addChild(this.imgHideUI);
        }
        public static open() {
            this.imgHideUI.visible = this.commonMoney.visible = true;
            this.curMainUI.open();
        }
        public static close() {
            this.imgHideUI.visible = this.commonMoney.visible = false;
            this.curMainUI.close();
            this.hideTalk();
        }
        public static get showUIFlag(): boolean {
            return this._showUIFlag;
        }
        public static set showUIFlag(f: boolean) {
            if (this._showUIFlag != f) {
                this._showUIFlag = f;
                this._showUIFlag ? this.show() : this.hide();
                this.imgHideUI.skin = this._showUIFlag ? "main/hideUI.png" : "main/showUI.png";
                EventManager.event(globalEvent.MAIN_UI_CHANGE_SHOW_STATE);
            }
        }
        private static hide() {
            this.curMainUI.hide();
            Laya.Tween.to(this.commonMoney, { alpha: 0 }, 200);
            this.commonMoney.mouseEnabled = false;
            Laya.Tween.to(this._talk, { alpha: 0 }, 200);
            this._talk.mouseEnabled = false;
            EventManager.event(globalEvent.HUD_DISPLAY_CHANGE);
        }
        private static show() {
            this.curMainUI.show();
            Laya.Tween.to(this.commonMoney, { alpha: 1 }, 200);
            this.commonMoney.mouseEnabled = true;
            Laya.Tween.to(this._talk, { alpha: 1 }, 200);
            this._talk.mouseEnabled = true;
            EventManager.event(globalEvent.HUD_DISPLAY_CHANGE);
        }
        public static isHide(): boolean {
            return this.curMainUI.isHide();
        }
        public static getHomeBtnState(): number {
            return this.curMainUI.getHomeBtnState();
        }
    }
}