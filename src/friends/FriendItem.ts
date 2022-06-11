namespace friends {
    /**
     * 好友列表单元项
     */
    export class FriendItem extends ui.friends.FriendItemUI {

        private _boxMap: Laya.Box[];
        viewType: ViewType;
        constructor() {
            super();
            this._boxMap = [this.boxDelete, this.boxList, this.boxAdd, this.boxApply, this.boxBlackList];
            // this.imgHead.on(Laya.Event.CLICK,this,this.visitFriends);
        }

        public set data(value: pb.Ifriend_t | pb.IUserBase) {
            let t: FriendItem = this;
            _.forEach([0, 1, 2, 3, 4], (element: number) => {
                t._boxMap[element].visible = element == this.viewType;
            });
            let userBase: pb.IUserBase;
            if (value instanceof pb.friend_t)
                userBase = value.userBaseInfo;
            else if (value instanceof pb.UserBase)
                userBase = value;

            let isCp: boolean = clientCore.CpManager.instance.checkCp(userBase.userid);
            this.imgCp.visible = isCp;
            this.imgNormal.visible = !isCp;
            t.imgMan.visible = userBase.sex == 2; //先默认写死是女孩纸
            t.imgWoman.visible = userBase.sex == 1;
            t.txName.changeText(userBase.nick);
            t.txFamily.changeText(userBase.familyName ? userBase.familyName : "无");
            t.txLev.changeText("Lv:" + clientCore.LocalInfo.parseLvInfoByExp(userBase.exp).lv);
            t.imgHead.gray = value instanceof pb.friend_t && value.isOnline == 0;
            t.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(userBase.headImage);
            t.imgHead.mouseEnabled = true;
            t.txLoveNum.changeText(clientCore.GlobalConfig.lovePointInfo(userBase.love).lv + "(级)");
            t.txWisdomNum.changeText(clientCore.GlobalConfig.wisdomPointInfo(userBase.wisdom).lv + "(级)");
            t.txBeautyNum.changeText(clientCore.GlobalConfig.beatuyPointInfo(userBase.beauty).lv + "(级)");
            t.txFriendShip.text = (value instanceof pb.friend_t ? value.friendShip : 0).toString();
            t.btnFlower.visible = t.btnFlower1.visible = clientCore.GiveFlowerManager.instance.isInActTime() && userBase.userid != clientCore.LocalInfo.uid;

            (this.boxDelete.getChildByName('btnDelete') as component.HuaButton).gray = isCp;

            let vipLv = clientCore.LocalInfo.parseVipInfoByExp(userBase.vipExp).lv;
            if (vipLv > 0) {
                t.vipBg.visible = true;
                t.vipLevel.visible = true;
                t.vipLevel.value = vipLv.toString();
                // t.spVipLv.visible = true;
                // util.showTexWord(this.spVipLv, "friends",""+ clientCore.LocalInfo.parseLvInfoByExp(userBase.vipExp).lv);
            }
            else {
                t.vipBg.visible = false;
                t.vipLevel.visible = false;
            }
            if (this.viewType == ViewType.FRIEND_DELETE) {
                if (value instanceof pb.friend_t) {
                    t.txLine.color = value.isOnline == 0 ? "#ff0416" : "#3dd64c";
                    t.txLine.text = value.isOnline == 1 ? '在线' : this.calculateTime(value.userBaseInfo.olLast);
                }
            }
            // 送礼
            if (this.viewType == ViewType.FRIEND_LIST) {
                let btnGift: Laya.Button = t.boxList.getChildByName("btnGive") as Laya.Button;
                let haveGift = value instanceof pb.friend_t && value.isGift;
                let isToday: boolean = value instanceof pb.friend_t && this.isToday(value.giveTime);
                if (haveGift) { //有礼物可以领取
                    btnGift["giftstatus"] = 1;
                    btnGift.skin = "friends/icon_linqutili.png";
                } else if (!isToday) {
                    btnGift["giftstatus"] = 2;
                    btnGift.skin = "friends/icon_zengsongtili.png";
                } else {
                    btnGift["giftstatus"] = 0;
                    btnGift.skin = "friends/icon_yizengsong.png";
                }
            }
            // (this.boxAdd.getChildByName("btnVisit") as HuaButton).disabled = true;
            // (this.boxList.getChildByName("btnVisit") as HuaButton).disabled = true;
            // (this.boxApply.getChildByName("btnVisit") as HuaButton).disabled = true;
        }

        private isToday(num: number) {
            let now: number = clientCore.ServerManager.curServerTime;
            return new Date(num * 1000).toDateString() === new Date(now * 1000).toDateString();
        }
        /**
         * 计算好友离线时间
         * @param last
         */
        private calculateTime(last: number): string {
            let delay: number = clientCore.ServerManager.curServerTime - last;
            let h: number = _.floor(delay / 60 / 60);
            if (h < 24) return `离线${h || '<1'}小时`;
            let d: number = _.floor(h / 24);
            if (d < 7) return `离线${d}天`;
            return `离线7天以上`;
        }
    }
}