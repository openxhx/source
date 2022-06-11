namespace friends {

    export enum ViewType {
        FRIEND_DELETE, //0-删除界面 1-好友列表 2-好友查找 3-好友申请
        FRIEND_LIST,
        FRIEND_FIND,
        FRIEND_APPLY,
        FRIEND_BLACK_LIST
    }

    /**
     * 好友系统-主界面
     */
    import FriendMgr = clientCore.FriendManager;
    export class FriendMainModule extends ui.friends.FriendMainUI {

        private _viewBox: Laya.Sprite[];
        private _tabIndex: number;
        private _viewType: ViewType;
        private list: Laya.List;  //180 192 979 392

        constructor() { super(); }

        public init(d: any): void {
            super.init(d)
            this._viewBox = [this.btnDelete, this.boxList, this.boxFind, this.boxApply, this.boxBlackList];
            this._tabIndex = -1;
            this.addPreLoad(xls.load(xls.friendLevel));
            this.addPreLoad(xls.load(xls.beautifulLevel));
            this.initList();
            // this.inputName.restrict = '0-9';
        }

        onPreloadOver() {
            this.imgSelect.visible = clientCore.LocalInfo.friendRefuse;
            this.updateLimit();
            this.showTabs(ViewType.FRIEND_LIST);
        }

        public addEventListeners(): void {
            let t: FriendMainModule = this;
            BC.addEvent(t, t.btnClose, Laya.Event.CLICK, t, t.closeClsView);
            //好友删除界面
            BC.addEvent(t, t.btnDelete, Laya.Event.CLICK, t, t.showView, [ViewType.FRIEND_LIST]);
            //好友列表界面
            BC.addEvent(t, t.btnList, Laya.Event.CLICK, t, t.showView, [ViewType.FRIEND_DELETE]);
            BC.addEvent(t, t.btnAllGet, Laya.Event.CLICK, t, t.onAllGet);
            BC.addEvent(t, t.btnAllGive, Laya.Event.CLICK, t, t.onAllGive);
            BC.addEvent(t, t.btnAllSpot, Laya.Event.CLICK, t, t.onAllSpot);
 //           BC.addEvent(t, t.btnAllHelp, Laya.Event.CLICK, t, t.onAllHelp);
            BC.addEvent(t, t.lbLink, Laya.Event.CLICK, t, t.showTabs, [ViewType.FRIEND_FIND]);
            //好友查找界面
            BC.addEvent(t, t.inputName, Laya.Event.FOCUS, t, t.inputFocus, ["focus"]);
            BC.addEvent(t, t.inputName, Laya.Event.BLUR, t, t.inputFocus, ["blur"]);
            BC.addEvent(t, t.btnFind, Laya.Event.CLICK, t, t.onFind);
            BC.addEvent(t, t.btnRefresh, Laya.Event.CLICK, t, t.onRefresh);
            BC.addEvent(t, t.btnAllAdd, Laya.Event.CLICK, t, t.onAllAdd);
            //好友申请界面
            BC.addEvent(t, t.imgCheck, Laya.Event.CLICK, t, t.selectIsRefuse);
            BC.addEvent(t, t.btnAllAgree, Laya.Event.CLICK, t, t.onAllAgree);
            BC.addEvent(t, t.btnAllRefuse, Laya.Event.CLICK, t, t.onAllRefuse);
            EventManager.on(globalEvent.FRIEND_INFO_CHANGE, this, this.onFriendInfoChange);

            for (let i: number = 1; i <= 4; i++) {
                BC.addEvent(t, t["tab" + i], Laya.Event.CLICK, t, t.showTabs, [i]);
            }
        }
        public removeEventListeners(): void {
            EventManager.on(globalEvent.FRIEND_INFO_CHANGE, this, this.onFriendInfoChange);
            BC.removeEvent(this);
        }

        private onFriendInfoChange() {
            if (this._viewType == ViewType.FRIEND_LIST || this._viewType == ViewType.FRIEND_DELETE) {
                this.refresh(1);
                this.updateLink();
                this.updateLimit();
            }
            if (this._viewType == ViewType.FRIEND_APPLY) {
                this.refresh(2);
            }
        }

        /** 初始化列表*/
        private initList(): void {
            let t: FriendMainModule = this;
            t.list = new Laya.List();
            t.list.pos(90, 130);
            t.list.width = 979;
            t.list.height = 392;
            this.addChildAt(t.list, 22);
            t.list.itemRender = FriendItem;
            t.list.vScrollBarSkin = "";
            t.list.renderHandler = Laya.Handler.create(t, t.friendRender, null, false);
            t.list.mouseHandler = Laya.Handler.create(t, t.friendMouse, null, false);
        }

        private friendRender(item: FriendItem, index: number): void {
            item.viewType = this._viewType;
            item.data = this.list.array[index];
        }

        /** 列表点击流*/
        private friendMouse(e: Laya.Event, index: number): void {
            if (!e.target || e.target.name == "" || e.type != Laya.Event.CLICK) return;
            let name: string = e.target.name;
            let data = this.list.array[index];
            let uid = 0;
            let userInfo:pb.UserBase = null;
            if (data instanceof pb.friend_t) {
                uid = data.friendUid;
                userInfo = data.userBaseInfo as pb.UserBase;
            }
            else if (data instanceof pb.UserBase) {
                uid = data.userid;
                userInfo = data;
            }
            console.log("点击流 -->> ", name);
            switch (name) {
                case "btnDelete":  //删除
                    if (clientCore.CpManager.instance.checkCp(userInfo.userid)) {
                        alert.showFWords('无法对花缘契约对象进行此操作!');
                        return;
                    }
                    this.deleteFriend(data, index);
                    break;
                case "btnChat": //聊天
                    this.goChat(data);
                    break;
                case "btnVisit": //访问
                    this.closeClsView();
                    if (data instanceof pb.friend_t)
                        clientCore.MapManager.enterHome(data.friendUid);
                    else if (data instanceof pb.UserBase)
                        clientCore.MapManager.enterHome(data.userid);

                    break;
                case "btnGive": //赠送体力 | 获得体力
                    let status: number = e.target["giftstatus"] >> 0;
                    if (status == 2) { //可以赠送
                        this.giveGift([data.friendUid], index);
                    } else if (status == 1) { //可以领取
                        this.getGift([data.friendUid], index);
                    }
                    break;
                case "btnAdd": //添加
                    this.addFriend(data);
                    break;
                case "btnRej": //拒绝
                    this.sendResponce(2, [data.friendUid]);
                    break;
                case "btnAgree": //同意
                    this.sendResponce(1, [data.friendUid]);
                    break;
                case "btnCancelBlock":
                    this.cancelBlock(data);
                    break;
                case "imgHead":
                    if(userInfo.curClothes.length > 0){
                        clientCore.UserInfoTip.showTips(e.target, userInfo);
                    }else{
                        alert.showFWords("无法查看该用户信息");
                    }
                    break;
                case 'btnFlower':
                    alert.showGiveFlowerPanel({ uid: userInfo.userid, nick: userInfo.nick });
                    break;
                case 'fetterGift':
                    clientCore.ModuleManager.open('fetterGift.FetterGiftModule', data.friendUid);
                    break;
                default:
                    break;
            }
        }

        private cancelBlock(info: pb.IUserBase) {
            alert.showSmall("是否确定将该玩家从黑名单移除？", {
                callBack: {
                    funArr: [() => {
                        clientCore.FriendManager.instance.removeFromBlackList(info.userid).then(() => {
                            if (!clientCore.FriendManager.instance.checkInBlackList(info.userid)) {
                                let _array: pb.UserBase[] = this.list.array;
                                let _len: number = _array.length;
                                for (let i: number = 0; i < _len; i++) {
                                    if (_array[i].userid == info.userid) {
                                        this.list.deleteItem(i)
                                        this.refreshBlackListInfo();
                                        break;
                                    }
                                }
                            }
                        });
                    }], caller: this
                }, btnType: alert.Btn_Type.SURE_AND_CANCLE, needMask: true, clickMaskClose: false
            });

        }

        /**
         * 删除好友
         * @param data 
         */
        private deleteFriend(data: pb.friend_t, index: number): void {
            alert.showSmall("是否解除与" + data.userBaseInfo.nick + "的好友关系？", {
                callBack: {
                    funArr: [function (): void {
                        FriendMgr.instance.deleteFriend(data.friendUid).then(() => {
                            this.list.deleteItem(index);
                            this.updateLimit();
                            this.updateLink();
                        })
                    }],
                    caller: this
                }
            })
        }

        /**
         * 前往聊天
         * @param data 
         */
        private goChat(data: pb.friend_t): void {
            if (alert.checkAge(true)) return;
            clientCore.ModuleManager.open("chat.ChatModule", {
                chatType: 4,
                uid: data.friendUid,
                nick: data.userBaseInfo.nick,
                head: data.userBaseInfo.headImage,
                frame: data.userBaseInfo.headFrame
            });
            this.closeClsView();
        }

        /**
         * 添加好友
         * @param data 
         */
        private addFriend(data: pb.UserBase): void {
            FriendMgr.instance.applyAddFriends([data.userid]).then((ids) => {
                let _array: pb.UserBase[] = this.list.array;
                let _len: number = _array.length;
                for (let i: number = 0; i < _len; i++) {
                    if (_array[i].userid == data.userid) {
                        this.list.deleteItem(i)
                        this.updateFindTips();
                        break;
                    }
                }
            })
        }

        /**
         * 更新列表
         * @param type 1- 好友列表 2- 申请列表 
         */
        private refresh(type: number): void {
            this.list.array = type == 1 ? _.sortBy(FriendMgr.instance.friendList, (element) => { return !clientCore.CpManager.instance.checkCp(element.userBaseInfo.userid) }) : FriendMgr.instance.applyList;
            if (type == 2) {
                this.lbDesc.visible = FriendMgr.instance.applyList.length <= 0;
            }
        }

        /** 更新好友数量显示*/
        private updateLimit(): void {
            this.lbLimit.text = FriendMgr.instance.friendNum + "/" + FriendMgr.instance.friendLimit;
            this.txtExAddNum.text = "(+" + clientCore.FlowerPetInfo.getPrivilegeByType(3) + ")";
            this.btnAllAdd.disabled = FriendMgr.instance.friendNum >= FriendMgr.instance.friendLimit;
        }

        /** 切换标签*/
        private showTabs(type: number): void {
            if (this._tabIndex == type) {
                return;
            }
            this._tabIndex = type;
            for (let i: number = 1; i <= 4; i++) {
                this["tab" + i].index = type == i ? 0 : 1;
            }
            this.showView(type);
        }

        /** 切换界面*/
        private showView(type: number): void {
            for (let i: number = 0; i < 5; i++) {
                this._viewBox[i].visible = i == type;
            }
            let height: number = 392;
            let y: number = 130;
            this.list.visible = true;
            switch (type) {
                case ViewType.FRIEND_DELETE:
                    this.showViewDelete();
                    break;
                case ViewType.FRIEND_LIST:
                    this.showViewList();
                    break;
                case ViewType.FRIEND_FIND:
                    height = 332;
                    y = 190;
                    this.showViewFind();
                    break;
                case ViewType.FRIEND_APPLY:
                    this.showViewApply(FriendMgr.instance.applyList);
                    break;
                case ViewType.FRIEND_BLACK_LIST:
                    this.showBlackList();
                    break;
                default:
                    break;
            }
            this.list.height = height;
            this.list.y = y;
            this._viewType = type;

            this.mcFriendLimitInfo.visible = type != ViewType.FRIEND_BLACK_LIST;
        }

        /** 输入框的焦点变化*/
        private inputFocus(type: string): void {
            this.lbPrompt.visible = this.inputName.text == "" && type == "blur";
        }

        private closeClsView(): void {
            this._viewBox = null;
            this.destroy();
        }

        private showBlackList() {
            let blackList = clientCore.FriendManager.instance.blackList;
            this.list.array = blackList;
            this.refreshBlackListInfo();
        }

        private refreshBlackListInfo() {
            let blackList = clientCore.FriendManager.instance.blackList;
            this.txtNoBlack.visible = blackList.length <= 0;
            this.txtBlackListLimitNum.text = "" + blackList.length + "/" + clientCore.FriendManager.instance.blackLimit;
        }

        // -> 好友列表

        private showViewList(): void {
            this.list.array = _.sortBy(FriendMgr.instance.friendList, (element) => { return !clientCore.CpManager.instance.checkCp(element.userBaseInfo.userid) });
            this.updateLink();
        }

        /** 更新提示文字*/
        private updateLink(): void {
            this.lbDec1.visible = this.lbLink.visible = FriendMgr.instance.friendNum == 0;
            this.list.visible = !this.lbLink.visible;

            this.txtGetNum.text = "已领取:" + clientCore.FriendManager.instance._getFriendGiftNum + "/40";
        }

        /** 赠送礼物*/
        private giveGift(ids: number[], index?: number): void {
            FriendMgr.instance.giveFriendGift(ids).then((uids: number[]) => {
                if (uids.length == 1 && index != void 0) {
                    this.list.changeItem(index, FriendMgr.instance.getFriendInfoById(uids[0]));
                } else {
                    this.refresh(1);
                }
            })
        }

        /** 获得礼物*/
        private getGift(ids: number[], index?: number): void {
            FriendMgr.instance.getFriendGift(ids).then((uids: number[]) => {
                if (uids.length == 1 && index != void 0) {
                    this.list.changeItem(index, FriendMgr.instance.getFriendInfoById(uids[0]));
                } else {
                    this.refresh(1);
                }
                this.txtGetNum.text = "已领取:" + clientCore.FriendManager.instance._getFriendGiftNum + "/40";
            })
        }

        private onAllGet(): void {
            let _array: number[] = [];
            let _map: pb.Ifriend_t[] = FriendMgr.instance.friendList;
            _.forEach(_map, (data: pb.friend_t) => {
                data.isGift == 1 && _array.push(data.friendUid);
            });
            this.getGift(_array);
        }

        private onAllGive(): void {
            let _array: number[] = [];
            let _map: pb.Ifriend_t[] = FriendMgr.instance.friendList;
            _.forEach(_map, (data: pb.friend_t) => {
                !this.isToday(data.giveTime) && _array.push(data.friendUid);
            });
            this.giveGift(_array);
        }

        private onAllSpot() {
            let _array: number[] = [];
            let _map: pb.Ifriend_t[] = FriendMgr.instance.friendList;
            _.forEach(_map, (data: pb.friend_t) => {
                if(data.likeTime == 0 ){
                    _array.push(data.friendUid)
                }
            });
            if(_array.length == 0){
                alert.showFWords(`已给所有好友点过赞了~`);
            }else{
                FriendMgr.instance.slotFriend(_array).then((uids: number[]) => {
                    this.btnAllSpot.disabled = true;
                });
            }
        }

        // private async onAllHelp() {
        //     if (clientCore.FlowerPetInfo.petType < 1) {
        //         alert.showFWords(`只有奇妙花宝用户才可以享受一键互助哦~`);
        //         return;
        //     }
        //     this.btnAllHelp.disabled = true;
        //     let _array: number[] = [];
        //     let _map: pb.Ifriend_t[] = FriendMgr.instance.friendList;
        //     _.forEach(_map, (data: pb.friend_t) => {
        //         if( data.isCooperation == 0){
        //             _array.push(data.friendUid);
        //         }
        //     });
        //     if(_array.length == 0){
        //         alert.showFWords(`已帮助所有好友了~`);
        //     }else{
        //         let ani = clientCore.BoneMgr.ins.play('res/animate/helpWait/loading.sk', "loading", true, this);
        //         ani.pos(440, 340);
        //         FriendMgr.instance.helpFriend(_array).then((uids: number[]) => {
        //             ani.dispose();
        //         });
        //     }
        // }

        private isToday(num: number) {
            let now: number = clientCore.ServerManager.curServerTime;
            return new Date(num * 1000).toDateString() === new Date(now * 1000).toDateString();
        }

        // -> 删除好友 <- 

        private showViewDelete(): void {
            this.list.refresh();
        }

        // ->  好友推荐 <-

        private async showViewFind() {
            this.list.array = FriendMgr.instance.recommandList;
            if (this.list.length == 0) {
                await FriendMgr.instance.refreshRecommendList();
            }
            this.updateFindTips();
        }

        private onFind(): void {
            if (this.inputName.text == "") {
                alert.showFWords("查找昵称不能为空~");
                return;
            }
            FriendMgr.instance.searchFirend(this.inputName.text).then((info) => {
                this.list.array = info ? [info] : [];
                this.updateFindTips();
            })
        }

        private async onRefresh() {
            await FriendMgr.instance.refreshRecommendList();
            this.showViewFind();
        }

        private onAllAdd(): void {
            if (this.list.length <= 0) {
                alert.showFWords("当前没有好友可添加，可查找~");
                return;
            }
            let ids: number[] = [];
            _.forEach(this.list.array, (ele: pb.UserBase) => {
                ids.push(ele.userid);
            });
            FriendMgr.instance.applyAddFriends(ids).then((ids) => {
                this.list.array = null;
                this.updateFindTips();
            });
        }

        private updateFindTips(): void {
            this.txtFindTips.visible = this.list.array == null || this.list.array.length == 0;
        }

        // -> 好友申请 <-

        /** 展示申请界面*/
        private showViewApply(list: pb.Ifriend_t[]): void {
            this.list.array = list;
            this.lbDesc.visible = list.length <= 0;
        }

        /** 是否允许添加*/
        private selectIsRefuse(): void {
            let isShow: boolean = this.imgSelect.visible;
            let type: number = isShow ? 0 : 1;
            this.imgSelect.visible = isShow ? false : true;
            clientCore.LocalInfo.friendRefuse = !isShow;
            FriendMgr.instance.setRejectApply(type);
        }

        /** 发送同意|拒绝好友*/
        private sendResponce(type: number, ids: number[]): void {
            let index = -1;
            if (ids.length == 1) { //删除列表（别人向我发出的申请）单个
                let uids = FriendMgr.instance.applyList.map((o) => { return o.userBaseInfo.userid });
                index = uids.indexOf(ids[0]);
            }
            FriendMgr.instance.responseFriend(type, ids).then((ids: number[]) => {
                if (index >= 0) {
                    this.list.deleteItem(index)
                    this.refresh(2);
                    this.lbDesc.visible = FriendMgr.instance.applyList.length <= 0;
                }
                else {
                    this.refresh(2);
                }
                this.updateLimit();
            });
        }

        private onAllAgree(): void {
            this.sendResponce(1, FriendMgr.instance.applyList.map((o) => { return o.friendUid }));
        }

        private onAllRefuse(): void {
            this.sendResponce(2, FriendMgr.instance.applyList.map((o) => { return o.friendUid }));
        }
    }
}