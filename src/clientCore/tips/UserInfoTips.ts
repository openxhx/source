namespace clientCore {
    export class UserInfoTip {
        private static _tips: ui.commonUI.UserInfoTipsUI;
        private static _userBaseHashMap: util.HashMap<pb.IUserBase>;
        private static _curShowUserInfo: pb.IUserBase;
        static setup() {
            this._tips = new ui.commonUI.UserInfoTipsUI();
            this._tips.anchorY = 0.5;
            this._userBaseHashMap = new util.HashMap();

            BC.addEvent(this, this._tips.btnShowInfo, Laya.Event.CLICK, this, this.onBtnClick, ["info"])
            BC.addEvent(this, this._tips.btnChat, Laya.Event.CLICK, this, this.onBtnClick, ["chat"])
            BC.addEvent(this, this._tips.btnAddFriend, Laya.Event.CLICK, this, this.onBtnClick, ["addFriend"])
            BC.addEvent(this, this._tips.btnBlock, Laya.Event.CLICK, this, this.onBtnClick, ["block"])
            BC.addEvent(this, this._tips.btnIntive, Laya.Event.CLICK, this, this.onBtnClick, ["invite"])
            BC.addEvent(this, this._tips.btnReport, Laya.Event.CLICK, this, this.onBtnClick, ["report"])
            BC.addEvent(this, this._tips.btnGiveFlower, Laya.Event.CLICK, this, this.onBtnClick, ["flower"])
        }
        static onBtnClick(type: string) {
            switch (type) {
                case 'flower':
                    alert.showGiveFlowerPanel({ uid: this._curShowUserInfo.userid, nick: this._curShowUserInfo.nick });
                    this.hideTips();
                    break;
                case "info":
                    ModuleManager.closeAllOpenModule();
                    DialogMgr.ins.closeAllDialog();
                    this.hideTips();
                    clientCore.ModuleManager.open("selfInfo.SelfInfoModule", { uid: this._curShowUserInfo.userid });
                    break;
                case "chat":
                    if (alert.checkAge(true)) return;
                    //查询对方是否禁止了陌生人聊天
                    net.sendAndWait(new pb.cs_query_stranger_chat_flag({ userid: this._curShowUserInfo.userid })).then((msg: pb.sc_query_stranger_chat_flag) => {
                        if (msg.isFriend == 0 && msg.flag == 0) {
                            alert.showFWords(`${this._curShowUserInfo.nick}禁止了和陌生人私聊哦~`)
                            return;
                        }
                        ModuleManager.closeAllOpenModule();
                        DialogMgr.ins.closeAllDialog();
                        this.hideTips();
                        clientCore.ModuleManager.open("chat.ChatModule", {
                            chatType: 4,
                            uid: this._curShowUserInfo.userid,
                            nick: this._curShowUserInfo.nick,
                            head: this._curShowUserInfo.headImage,
                            frame: this._curShowUserInfo.headFrame
                        })
                    })
                    break;
                case "addFriend":
                    clientCore.FriendManager.instance.applyAddFriends([this._curShowUserInfo.userid]).then((ids) => {
                        if (ids.length > 0) {
                            alert.showFWords("加好友申请发送成功！");
                            this._tips.btnAddFriend.disabled = true;
                        }
                    });
                    break;
                case "block":/**拉黑 */
                    if (CpManager.instance.checkCp(this._curShowUserInfo.userid)) {
                        alert.showFWords('无法对花缘契约对象进行此操作!');
                        return;
                    }

                    if (clientCore.FriendManager.instance.isBlackListFull()) {
                        alert.showFWords("黑名单已达上限！");
                        return;
                    }
                    alert.showSmall("是否确定将该玩家加入黑名单？", { callBack: { funArr: [this.sureAddToBlack, this.cancel], caller: this }, btnType: alert.Btn_Type.SURE_AND_CANCLE, needMask: true, clickMaskClose: false });
                    break;
                case "invite":
                    net.sendAndWait(new pb.cs_invite_user_to_family({ userid: this._curShowUserInfo.userid })).then((msg: pb.sc_invite_user_to_family) => {
                        msg.errCode != 0 ? alert.showFWords("玩家已经收到过邀请正在考虑中^_^") : alert.showFWords("邀请已成功发送^_^");;
                    });
                    break;
                case "report":
                    this.hideTips();
                    clientCore.ModuleManager.open("report.ReportModule", { id: this._curShowUserInfo.userid, content: "" });
                    break;
            }
        }
        private static sureAddToBlack() {
            clientCore.FriendManager.instance.addToBlackList(this._curShowUserInfo.userid).then(() => {
                this._tips.btnBlock.disabled = true;
            });
        }
        private static cancel() {

        }
        /**添加tips监听 */
        static addTips(dis: Laya.Sprite, data: any) {
            if (dis) {
                dis.on(Laya.Event.REMOVED, this, this.hideTips);
                dis.on(Laya.Event.CLICK, this, this.onShowTips, [dis, data]);
            }
        }

        /**移除tips监听 */
        static removeTips(dis: Laya.Sprite) {
            if (dis) {
                dis.off(Laya.Event.REMOVED, this, this.hideTips);
                dis.off(Laya.Event.CLICK, this, this.onShowTips);
            }
        }
        static hideTips() {
            this._tips.removeSelf();
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onStageClick);
        }
        private static onStageClick(dis: Laya.Sprite) {
            if (!dis?.getStyle()) {
                this.hideTips();
                return;
            }
            if (this._tips.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY)) {
                return;
            }
            if (dis.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY))
                return;
            this.hideTips();
        }
        static showTips(dis: Laya.Sprite, data: any) {
            if (dis)
                this.onShowTips(dis, data);
        }
        private static onShowTips(dis: Laya.Sprite, data: any) {
            let pos = new Laya.Point(0, 0);
            dis.localToGlobal(pos, false);
            this._tips.pos(pos.x + dis.width / 2, pos.y + dis.height / 2, true);
            //超出右边界的话tips放左边
            if ((this._tips.x + this._tips.width) >= Laya.stage.width) {
                this._tips.x -= this._tips.width;
            }
            clientCore.LayerManager.alertLayer.addChild(this._tips);
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onStageClick, [dis]);
            if (data instanceof pb.UserBase) {
                if (!this._userBaseHashMap.has(data.userid)) {
                    this._userBaseHashMap.add(data.userid, data);
                }
                this.showUserInfoDetail(data);
            }
            else if (!isNaN(data)) {
                if (this._userBaseHashMap.has(data)) {
                    this.showUserInfoDetail(this._userBaseHashMap.get(data));
                }
                else {
                    net.sendAndWait(new pb.cs_get_user_base_info({ uids: [data] })).then((data: pb.sc_get_user_base_info) => {
                        let userInfo = data.userInfos[0];
                        if (userInfo) {
                            this.showUserInfoDetail(userInfo);
                            this._userBaseHashMap.add(userInfo.userid, userInfo);
                        }
                        else {
                            this.hideTips();
                        }
                    });
                }
            }
        }
        public static refreshUserInfo(userInfo: pb.IUserBase) {
            this._userBaseHashMap.add(userInfo.userid, userInfo);
        }
        private static async showUserInfoDetail(userInfo: pb.IUserBase) {
            this._curShowUserInfo = userInfo;
            this._tips.btnGiveFlower.visible = GiveFlowerManager.instance.isInActTime();
            this._tips.txtName.text = userInfo.nick;
            this._tips.txtLv.text = LocalInfo.parseLvInfoByExp(userInfo.exp).lv.toString();
            this._tips.txtFamily.text = userInfo.familyName != "" ? userInfo.familyName : '暂无家族';

            let vipLv: number = LocalInfo.parseVipInfoByExp(userInfo.vipExp).lv;
            let hasVip: boolean = vipLv > 0;
            this._tips.imgVip.visible = this._tips.imgVipLv.visible = hasVip;
            if (hasVip)
                this._tips.imgVipLv.value = vipLv + "";
            this._tips.mcHead.skin = clientCore.ItemsInfo.getItemIconUrl(userInfo.headImage);
            this._tips.btnBlock.disabled = clientCore.FriendManager.instance.checkInBlackList(this._curShowUserInfo.userid);
            this._tips.btnAddFriend.disabled = clientCore.FriendManager.instance.checkIsFriend(this._curShowUserInfo.userid);
            this._tips.btnReport.visible = userInfo.userid != clientCore.LocalInfo.uid;
            this._tips.btnBlock.visible = userInfo.userid != clientCore.LocalInfo.uid;
            this._tips.btnIntive.visible = false;
            this._tips.btnBlock.gray = CpManager.instance.checkCp(userInfo.userid);
            if (clientCore.FamilyMgr.ins.checkInFamily() && userInfo.familyName == "" && clientCore.LocalInfo.parseLvInfoByExp(userInfo.exp).lv >= clientCore.SystemOpenManager.ins.familyOpenLv) {
                this._tips.btnIntive.visible = await this.checkInvite();;
            }
        }

        /** 检查是否可以邀请*/
        private static checkInvite(): Promise<boolean> {
            return new Promise((suc) => {
                net.sendAndWait(new pb.cs_query_family_invitation({ userid: this._curShowUserInfo.userid })).then((msg: pb.sc_query_family_invitation) => {
                    suc(msg.flag == 1);
                });
            })
        }
    }
}