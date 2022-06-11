/// <reference path="MainUIBase.ts" />
namespace clientCore {
    export class FriendHomeMainUI extends MainUIBase {
        private _mainUI: ui.main.friendHome.FriendHomeMainUIUI;
        private _preUserInfo: pb.IUserBase;
        private _nextUserInfo: pb.IUserBase;
        constructor() {
            super();
        }
        public setUp() {
            if (this._mainUI) {
                this.showFriendInfo();
                return;
            }
            this._mainUI = new ui.main.friendHome.FriendHomeMainUIUI();
            this._mainUI.mouseThrough = true;
            this._mainUI.mcLeftView.mouseThrough = true;
            this._mainUI.mcRightView.mouseThrough = true;
            this._mainUI.drawCallOptimize = true;
            this.addEvent();
            this.initMessageTxt();
            this.showFriendInfo();
            this.onHeadChange();
        }
        private initMessageTxt() {
            for (let i = 0; i < 3; i++) {
                this._mainUI["txtInfo_" + i].style.fontSize = 16;
                this._mainUI["txtInfo_" + i].style.width = 420;
            }
        }
        private showFriendInfo() {
            this.showDetailInfo();
            this.showVisitMessage();
            this.showFriendList();
            this.onHeadChange();
        }
        private showFriendList() {
            let friendHomeUid = FriendHomeInfoMgr.ins.friendBaseInfo.userid;
            let friendList = FriendManager.instance.friendList;
            let index = -1;
            for (let i = 0; i < friendList.length; i++) {
                if (friendList[i].userBaseInfo.userid == friendHomeUid) {
                    index = i;
                    break;
                }
            }
            this.findPreAndNextUserInfo(index);
            this._mainUI.mcPre.visible = false;
            this._mainUI.mcNext.visible = false;
            if (this._preUserInfo) {
                this._mainUI.mcPre.visible = true;
                this._mainUI.mcPreHead.skin = clientCore.ItemsInfo.getItemIconUrl(this._preUserInfo.headImage);
            }
            if (this._nextUserInfo) {
                this._mainUI.mcNext.visible = true;
                this._mainUI.mcNextHead.skin = clientCore.ItemsInfo.getItemIconUrl(this._nextUserInfo.headImage);
            }
        }
        private findPreAndNextUserInfo(index: number) {
            let friendList = FriendManager.instance.friendList;
            let preIndex = 0;
            let nextIndex = 0;
            if (index > -1) {
                preIndex = index - 1;
                nextIndex = index + 1;
            }
            else {
                preIndex = friendList.length - 1;
                nextIndex = 0;
            }
            if (preIndex < 0) {
                preIndex = friendList.length - 1;
            }
            if (nextIndex >= friendList.length) {
                nextIndex = 0;
            }
            if (friendList.length == 0) {
                preIndex = -1;
                nextIndex = -1;
            }
            else if (friendList.length == 1) {
                if (index > -1) {
                    preIndex = -1;
                    nextIndex = -1;
                }
                else {
                    preIndex = -1;
                    nextIndex = 0;
                }
            }
            else if (preIndex == nextIndex) {/**前后指向同一个，显示下一个元素 */
                preIndex = -1;
            }
            console.log(`preIndex ${preIndex}  nextIndex ${nextIndex}`);
            this._preUserInfo = preIndex >= 0 ? friendList[preIndex].userBaseInfo : null;
            this._nextUserInfo = nextIndex >= 0 ? friendList[nextIndex].userBaseInfo : null;
        }
        private showDetailInfo() {
            this._mainUI.txtName.changeText(FriendHomeInfoMgr.ins.friendBaseInfo.nick);
            this._mainUI.txtLikeNum.changeText(FriendHomeInfoMgr.ins.friendBaseInfo.likes + "");
            if (FriendHomeInfoMgr.ins.friendHomeInfo.isZan) {
                this._mainUI.mcLike.skin = "main/friendHome/imgLike.png";
            }
            else {
                this._mainUI.mcLike.skin = "main/friendHome/imgUnlike.png";
            }
            let lvInfo = clientCore.LocalInfo.parseLvInfoByExp(FriendHomeInfoMgr.ins.friendBaseInfo.exp);
            this._mainUI.txtLevel.changeText("" + lvInfo.lv);
            let vipLv = LocalInfo.parseVipInfoByExp(FriendHomeInfoMgr.ins.friendBaseInfo.vipExp).lv;
            this._mainUI.txtVipLvl.changeText("" + vipLv);
            this._mainUI.txtVipLvl.visible = vipLv > 0;
            this._mainUI.imgVipBg.visible = vipLv > 0;
            this._mainUI.txtLoveLvl.changeText('' + clientCore.GlobalConfig.lovePointInfo(FriendHomeInfoMgr.ins.friendBaseInfo.love).lv);
            this._mainUI.imgHelpLock.visible = FlowerPetInfo.petType < 1;
            this._mainUI.btnHelp.visible = FriendManager.instance.checkIsFriend(FriendHomeInfoMgr.ins.friendBaseInfo.userid);
            // this._mainUI.btnHelp.visible = false;

            this.refreshHelpInfo();
        }

        private refreshHelpInfo() {
            let globalInfo = xls.get(xls.globaltest).get(1);
            this.showTxtNum(this._mainUI.txtSpeedUpF, FriendHomeInfoMgr.ins.friendHomeInfo.quickTimes, globalInfo.friendSpeedLimit);
            this.showTxtNum(this._mainUI.txtGetF, FriendHomeInfoMgr.ins.friendHomeInfo.pickTimes, globalInfo.friendPickLimit);
            this.showTxtNum(this._mainUI.txtSpeedUpM, FriendHomeInfoMgr.ins.friendHomeInfo.selfQuickTimes, FriendHomeInfoMgr.ins.friendHomeInfo.maxSelfQuickTimes);
            this.showTxtNum(this._mainUI.txtGetM, FriendHomeInfoMgr.ins.friendHomeInfo.selfPickTimes, FriendHomeInfoMgr.ins.friendHomeInfo.maxSelfPickTimes);
        }

        private showTxtNum(t: Laya.Label, v1: number, v2: number): void {
            v1 = v1 < 0 ? 0 : v1;
            t.changeText("" + v1 + "/" + v2);
        }
        /**
         * 最新动态
         */
        private showVisitMessage() {
            for (let i = 0; i < 3; i++) {
                this._mainUI["txtInfo_" + i].visible = false;
            }
            let len = FriendHomeInfoMgr.ins.friendHomeInfo.logs.length;
            for (let i = 0; i < 3 && i < len; i++) {
                this.showOneMessage(this._mainUI["txtInfo_" + i], FriendHomeInfoMgr.ins.friendHomeInfo.logs[i]);
            }
        }
        private showOneMessage(txt: Laya.HTMLDivElement, info: pb.IVistorEventLogInfo) {
            txt.innerHTML = FriendHomeInfoMgr.createVisitMsg(info, FriendHomeInfoMgr.ins.friendBaseInfo.userid, FriendHomeInfoMgr.ins.friendBaseInfo.nick);
            txt.visible = true;
        }
        private onHeadChange() {
            this._mainUI.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(FriendHomeInfoMgr.ins.friendBaseInfo.headImage);
            this._mainUI.imgFrame.skin = clientCore.ItemsInfo.getItemIconUrl(FriendHomeInfoMgr.ins.friendBaseInfo.headFrame);
        }
        private addEvent() {
            EventManager.on(globalEvent.USER_HEAD_IMAGE_CHANGE, this, this.onHeadChange);
            BC.addEvent(this, this._mainUI.btnBack, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.btnFriend, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.mcLike, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.mcShowMoreInfo, Laya.Event.CLICK, this, this.onBtnClick);
            BC.addEvent(this, this._mainUI.mcPre, Laya.Event.CLICK, this, this.onHeadClick, [0]);
            BC.addEvent(this, this._mainUI.mcNext, Laya.Event.CLICK, this, this.onHeadClick, [1]);
            BC.addEvent(this, this._mainUI.btnHelp, Laya.Event.CLICK, this, this.oneKeyHelp);
            BC.addEvent(this, EventManager, globalEvent.FRIEND_HELP_INFO_REFRESH, this, this.refreshHelpInfo);
            BC.addEvent(this, EventManager, globalEvent.STAGE_RESIZE, this, this.onResize);
        }
        private onResize(): void {
            this._mainUI.mcRightView.x = Laya.stage.width;
            this._mainUI.mcCenterView.x = Laya.stage.width / 2;
        }
        private onHeadClick(index: number) {
            if (index == 0) {
                MapManager.enterHome(this._preUserInfo.userid);
            }
            else if (index == 1) {
                MapManager.enterHome(this._nextUserInfo.userid);
            }
        }
        private _neting: boolean = false;
        private onBtnClick(e: Laya.Event) {
            switch (e.currentTarget) {
                case this._mainUI.btnBack:
                    MapManager.enterHome(LocalInfo.uid);
                    break;
                case this._mainUI.btnFriend:
                    ModuleManager.open("friends.FriendMainModule");
                    break;
                case this._mainUI.mcLike:
                    if (this._neting)
                        return;
                    if (!FriendHomeInfoMgr.ins.friendHomeInfo.isZan) {
                        this._neting = true;
                        net.sendAndWait(new pb.cs_friend_home_like({ homeId: parseInt(MapInfo.mapData) })).then((data: pb.sc_friend_home_like) => {
                            this._neting = false;
                            FriendHomeInfoMgr.ins.friendHomeInfo.isZan = 1;
                            this._mainUI.mcLike.skin = "main/friendHome/imgLike.png";
                            this.addOneMessage();
                            FriendHomeInfoMgr.ins.friendBaseInfo.likes++;
                            this._mainUI.txtLikeNum.changeText(FriendHomeInfoMgr.ins.friendBaseInfo.likes + "");
                        });
                    }
                    break;
                case this._mainUI.mcShowMoreInfo:
                    ModuleManager.open("friendHomeMsg.FriendHomeMsgModule");
                    break;
            }
        }
        private addOneMessage() {
            let msg = new pb.VistorEventLogInfo();
            msg.eventType = 2;
            msg.userid = LocalInfo.uid;
            msg.nick = LocalInfo.userInfo.nick;
            FriendHomeInfoMgr.ins.friendHomeInfo.logs.unshift(msg);
            this.showVisitMessage();
        }
        private oneKeyHelp(): void {
            if (FlowerPetInfo.petType < 1) {
                alert.showFWords(`只有奇妙花宝用户才可以享受一键互助哦~`);
                return;
            }
            net.sendAndWait(new pb.cs_one_click_friend_accelerate_and_pick({ homeId: parseInt(MapInfo.mapData) })).then((msg: pb.sc_one_click_friend_accelerate_and_pick) => {
                for (let i = 0; i < msg.items.length; i++) {
                    alert.showFWords("获得：" + ItemsInfo.getItemName(msg.items[i].id) + " x" + msg.items[i].cnt);
                }
                _.forEach(msg.products, (element: pb.IProductsAccelerate) => {
                    let item: IFriendItem = MapItemsInfoManager.instance.getMapItemInMap(element.gettime);
                    item?.quickFriend();
                })
                _.forEach(msg.pickLists, (element: number) => {
                    let item: MapItemBase = MapItemsInfoManager.instance.getMapItemInMap(element);
                    item?.pickFriend();
                })

                let pick: number = msg.pickLists.length;
                FriendHomeInfoMgr.ins.friendHomeInfo.pickTimes -= pick;
                FriendHomeInfoMgr.ins.friendHomeInfo.selfPickTimes -= pick;
                let qucik: number = msg.products.length;
                FriendHomeInfoMgr.ins.friendHomeInfo.quickTimes -= qucik;
                FriendHomeInfoMgr.ins.friendHomeInfo.selfQuickTimes -= qucik;
                this.refreshHelpInfo();
            })
        }
        public open() {
            this._mainUI.mcLeftView.x = 0;
            this._mainUI.alpha = 1;
            this._mainUI.mouseEnabled = true;
            this.onResize();
            LayerManager.uiLayer.addChild(this._mainUI);
            UIManager.showTalk();
        }
        public hide() {
            Laya.Tween.to(this._mainUI, { alpha: 0 }, 200);
            this._mainUI.mouseEnabled = false;
        }
        public show() {
            Laya.Tween.clearAll(this._mainUI);
            Laya.Tween.to(this._mainUI, { alpha: 1 }, 200);
            this._mainUI.mouseEnabled = true;
        }
        public close() {
            this._mainUI.removeSelf();
        }
        public isHide() {
            return !this._mainUI.parent;
        }
    }
}