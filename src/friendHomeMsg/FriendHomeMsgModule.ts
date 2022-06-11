namespace friendHomeMsg {

    export class FriendHomeMsgModule extends ui.friendHomeMsg.friendHomeMsgModuleUI {
        private _curShowIndex: number = -1;
        private _myDonateInfo: pb.sc_get_home_friend_info;
        private _myFriendArr: pb.IUserBase[];
        constructor() {
            super();
        }
        public init(d: any) {
            this._data = d;
            if (this._data && this._data == clientCore.LocalInfo.uid) {
                this.addPreLoad(this.checkMyDonateInfo());
            }
        }
        private checkMyDonateInfo(): Promise<any> {
            return net.sendAndWait(new pb.cs_get_home_friend_info({ homeId: clientCore.LocalInfo.uid })).
                then((data: pb.sc_get_home_friend_info) => {
                    this._myDonateInfo = data;
                }).then(() => {
                    let idArr = [];
                    for (let i = 0; i < this._myDonateInfo.ranks.length; i++) {
                        idArr.push(this._myDonateInfo.ranks[i].userid);
                    }
                    return net.sendAndWait(new pb.cs_get_user_base_info({ uids: idArr })).then((data: pb.sc_get_user_base_info) => {
                        this._myFriendArr = data.userInfos;
                    });
                });
        }
        public onPreloadOver() {
            this.initListInfo();
        }
        public popupOver(): void {

        }
        private initListInfo() {

            this.listDonate.renderHandler = new Laya.Handler(this, this.donateRender);
            this.listDonate.mouseHandler =new  Laya.Handler(this, this.donateSelect);
            this.listDonate.vScrollBarSkin = "";

            this.listInfo.renderHandler = new Laya.Handler(this, this.messageRender);
            this.listInfo.mouseHandler = new Laya.Handler(this, this.messageSelect);
            this.listInfo.vScrollBarSkin = "";

            let ranks: pb.IRankBaseInfo[] = [];
            let logs: pb.IVistorEventLogInfo[] = [];
            if (this._data && this._data == clientCore.LocalInfo.uid) {
                ranks = this._myDonateInfo.ranks;
                logs = this._myDonateInfo.logs;
            }
            else {
                ranks = clientCore.FriendHomeInfoMgr.ins.friendHomeInfo.ranks;
                logs = clientCore.FriendHomeInfoMgr.ins.friendHomeInfo.logs;
                this._myFriendArr = clientCore.FriendHomeInfoMgr.ins.friendRankInfo;
            }

            this.listDonate.dataSource = ranks;
            this.listInfo.dataSource = logs;
            this.noRank.visible = ranks.length == 0;
            this.onTabClick(0);
        }
        private donateRender(item: ui.friendHomeMsg.render.FriendRenderUI, index: number) {
            item.txtName.text = this._myFriendArr[index].nick;
            item.mcRankImg.skin = "friendHomeMsg/top" + (index + 1) + ".png";
            item.txtDonateNum.text = "" + item.dataSource.score;
            item.mcHead.skin = clientCore.ItemsInfo.getItemIconUrl(this._myFriendArr[index].headImage);
        }
        private donateSelect(e: Laya.Event, index: number) {

        }

        private messageRender(item: ui.friendHomeMsg.render.MessageRenderUI, index: number) {
            item.txtMsg.style.fontSize = 20;
            item.txtMsg.style.width = 500;
            if (this._data && this._data == clientCore.LocalInfo.uid) {
                item.txtMsg.innerHTML = clientCore.FriendHomeInfoMgr.createVisitMsg(this.listInfo.array[index], clientCore.LocalInfo.uid, clientCore.LocalInfo.name);
            }
            else {
                item.txtMsg.innerHTML = clientCore.FriendHomeInfoMgr.createVisitMsg(this.listInfo.array[index], clientCore.FriendHomeInfoMgr.ins.friendBaseInfo.userid, clientCore.FriendHomeInfoMgr.ins.friendBaseInfo.nick);
            }

        }
        private messageSelect(e: Laya.Event, index: number) {

        }

        public addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.mcTab_0, Laya.Event.CLICK, this, this.onTabClick, [0]);
            BC.addEvent(this, this.mcTab_1, Laya.Event.CLICK, this, this.onTabClick, [1]);
        }

        private onTabClick(idx: number) {
            if (this._curShowIndex == idx) {
                return;
            }
            this._curShowIndex = idx;
            this.mcTab_0.skin = "friendHomeMsg/tab_00.png";
            this.mcTab_1.skin = "friendHomeMsg/tab_10.png";
            if (idx == 0) {
                this.mcTab_0.skin = "friendHomeMsg/tab_01.png";
                this.listInfo.visible = true;
                this.listDonate.visible = false;
            }
            else {
                this.mcTab_1.skin = "friendHomeMsg/tab_11.png";
                this.listInfo.visible = false;
                this.listDonate.visible = true;
            }
        }

        public removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
        }
    }
}