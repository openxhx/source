
namespace selfInfo {
    enum TAB {
        PERSON,
        CLOTH,
        BAG,
        BATTLE,
        END
    }

    export class SelfInfoModule extends ui.selfInfo.SelfInfoUI {
        private _tab: number;
        private _clipArr: Laya.Clip[];
        private _tabArr: IselfInfoTabModule[];
        private _person: clientCore.Person;
        private _cpPerson: clientCore.Person;
        private _settingPanel: Settingpanel;
        private _magicalCodePanel: MagicalCodePanel;
        private _godMirrorPanel: GodMirrorPanel;
        private _needShowCp: boolean;

        private _model: SelfInfoModel;
        private _control: SelfInfoControl;

        constructor() {
            super();
        }

        private async checkUserInfo(): Promise<any> {
            /**人物信息面板保持最新，再拉到人物信息的时候，刷新一下tips里面的数据 */
            await this._control.getUserInfo();
            //拉玩家信息这个协议，不是实时的，所以如果是自己的数据 就从localInfo里面拿了
            this._needShowCp = this._model.isSelf ? clientCore.LocalInfo.showCp : this._model.userBaseInfo.isShowDoubleBGS == 1;
            let cpId = this._model.isSelf ? clientCore.CpManager.instance.cpID : this._model.userBaseInfo.cpId;
            if (cpId != 0) {
                await this._control.getCPUserInfo(cpId);
            }
            if (!this._model.isSelf) {
                await this._control.getMirrorInfo();
            }
            await this._control.getBattleInfo();
        }

        init(d: any) {
            this.sign = clientCore.CManager.regSign(new SelfInfoModel(), new SelfInfoControl());
            this._model = clientCore.CManager.getModel(this.sign) as SelfInfoModel;
            this._control = clientCore.CManager.getControl(this.sign) as SelfInfoControl;
            this._control.model = this._model;
            this._model.init(d);

            this._tab = TAB.PERSON;
            if (d && !!d.tab) {
                this._tab = d.tab;
            }

            this._clipArr = [];
            for (let i = 0; i < TAB.END; ++i) {
                this._clipArr.push(this['tab_' + i] as Laya.Clip);
            }

            this.addPreLoad(xls.load(xls.friendLevel));
            this.addPreLoad(xls.load(xls.wisdomLevel));
            this.addPreLoad(xls.load(xls.beautifulLevel));
            this.addPreLoad(xls.load(xls.commonPassWord));
            this.addPreLoad(xls.load(xls.cpCommonDate));
            this.addPreLoad(xls.load(xls.stageBase));
            this.addPreLoad(xls.load(xls.godprayBase));
            this.addPreLoad(xls.load(xls.characterId));
            this.addPreLoad(xls.load(xls.characterStar));
            this.addPreLoad(this.checkUserInfo());
        }

        onPreloadOver() {
            this._tabArr = [new PersonTab(this.personTab, this.sign), new ClothTab(this.clothTab, this.sign), new BagTab(this.bagTab, this.sign), new BattleInfoTab(this.battleTab, this.sign)];
            for (let i = 0; i < this._tabArr.length; i++) {
                this._tabArr[i].tab = i;
            }
            this.initPanel();
            this.showTab(this._tab);
        }

        private initPanel() {
            let bgShowId: number = clientCore.BgShowManager.filterDecoIdByType(this._model.userBaseInfo.curClothes, clientCore.CLOTH_TYPE.Bg);
            if (bgShowId) {
                let cfg: xls.bgshow = xls.get(xls.bgshow).get(bgShowId);
                let path = clientCore.ItemsInfo.getItemUIUrl(cfg.id);
                if (cfg.fullScreen) {
                    clientCore.BgShowManager.instance.createFullScreenBgShow(this, path);
                } else {
                    let bgShow = new Laya.Image();
                    bgShow.anchorY = bgShow.anchorX = 0.5;
                    bgShow.skin = path;
                    this.mcPersonCon.addChild(bgShow);
                }
            }
            let stageShowId = clientCore.BgShowManager.filterDecoIdByType(this._model.userBaseInfo.curClothes, clientCore.CLOTH_TYPE.Stage);
            if (stageShowId) {
                let cfg: xls.bgshow = xls.get(xls.bgshow).get(stageShowId);
                if (cfg.dynamic) {
                    clientCore.BgShowManager.instance.createDynamicStage(stageShowId, this.mcPersonCon, this.mcPersonCon.numChildren);
                } else {
                    let stageShow = new Laya.Image();
                    stageShow.anchorX = stageShow.anchorY = 0.5;
                    stageShow.skin = clientCore.ItemsInfo.getItemUIUrl(stageShowId);
                    this.mcPersonCon.addChild(stageShow);
                }
            }
            //送花
            this.boxGiveFlower.visible = clientCore.GiveFlowerManager.instance.isInActTime();
            this.ani2.gotoAndStop(this._data == clientCore.LocalInfo.uid ? 0 : 1);
            this.txtNum.text = (this._data == clientCore.LocalInfo.uid ? clientCore.LocalInfo.getFlowerNum : this._model.userBaseInfo.gotFlowerCnt).toString();
            this._person = new clientCore.Person(this._model.userBaseInfo.sex);
            this._person.scale(0.625, 0.625);
            if (this._model.cpUserBaseInfo && this._needShowCp) {
                this._cpPerson = new clientCore.Person(this._model.cpUserBaseInfo.sex, this._model.cpUserBaseInfo.curClothes);
                this._cpPerson.scale(-0.5, 0.5);
                this._person.scale(0.5, 0.5);
                this._person.x = 100;
                this._cpPerson.x = -100;
                this.mcPersonCon.addChild(this._cpPerson);
            }
            this.mcPersonCon.addChild(this._person);
            this._person.upByIdArr(this._model.userBaseInfo.curClothes);
            (this["tab_2"] as Laya.Clip).visible = this._model.isSelf;
            this.mcFriendBtns.visible = !this._model.isSelf;
            this.mcMyselfBtns.visible = this._model.isSelf;

            if (!this._model.isSelf) {
                if (clientCore.FriendManager.instance.checkIsFriend(this._model.uid)) {
                    this.btnAddFriend.disabled = true;
                }
            }
            this.btnBlock.visible = !clientCore.FriendManager.instance.checkInBlackList(this._model.uid);
            this.btnCancelBlock.visible = clientCore.FriendManager.instance.checkInBlackList(this._model.uid);
            //oppo渠道需要客服
            this.btnHelp.visible = channel.ChannelControl.ins.isOfficial || channel.ChannelConfig.channelId == channel.ChannelEnum.OPPO;
            //cp title展示
            this.boxCpTitle.visible = false;
            let cpTitleId = this._model.isSelf ? clientCore.LocalInfo.srvUserInfo.cpShowType : this._model.userBaseInfo.cpShowType;
            if (this.cpTitleShow) {
                this.boxCpTitle.visible = true;
                let data = _.find(xls.get(xls.cpCommonDate).get(1).cpCardShow.split(';'), str => parseInt(str.split('/')[0]) == cpTitleId);
                if (data) {
                    let color = data.split('/')[1];
                    this.txtCpTitle.text = this._model.cpUserBaseInfo.nick + ' & ' + this._model.userBaseInfo.nick;
                    this.txtCpTitle.color = '#' + color;
                    this.imgCpTitle.skin = pathConfig.getCpTitle(cpTitleId);
                }
            }

            let cpId = this._model.isSelf ? clientCore.CpManager.instance.cpID : this._model.userBaseInfo.cpId;
            this.imgRed.visible = this._model.isSelf && clientCore.ItemBagManager.checkHasItemRed();
            this.btnMirror.disabled = (this._model.godMirrorInfo && this._model.godMirrorInfo.length == 0) && (this._model.uid != clientCore.LocalInfo.uid);
            this.btnBlock.disabled = this._model.uid == clientCore.CpManager.instance.cpID && cpId != 0;
            this.btnMentorSure.visible = false;
            if (this._model.mentorInfo) {
                /**这个是发出请求的消息type  1收徒   2拜师 */
                this.btnMentorSure.fontSkin = this._model.mentorInfo.type == 1 ? "commonBtn/l_p2_baishi.png" : "commonBtn/l_p2_shoutu.png";
                this.btnMentorSure.visible = true;
            }

            // this.btnCode.disabled = true;
            if (clientCore.GlobalConfig.isIosTest) {
                this.btnCode.visible = false;
            }
            this.btnShowMySelf.visible = this._model.isSelf;
        }

        private get cpTitleShow(): boolean {
            let cpTitleId = this._model.isSelf ? clientCore.LocalInfo.srvUserInfo.cpShowType : this._model.userBaseInfo.cpShowType;
            return this._model.cpUserBaseInfo && cpTitleId > 0;
        }

        private showTab<T>(tabIdx: TAB, params?: T) {
            if (tabIdx == TAB.BATTLE) {
                if (!this._model.battle_hasData) {
                    alert.showFWords("需该玩家登陆后才可查看战斗信息");
                    return;
                }
            }
            this._tab = tabIdx;
            for (let i = 0; i < TAB.END; ++i) {
                this._clipArr[i].index = tabIdx == i ? 1 : 0;
                tabIdx == i ? this._tabArr[i].show(params) : this._tabArr[i].hide();
            }
            this.mcPersonCon.visible = tabIdx != TAB.BAG;
            this.btnHomeVisitInfo.visible = this._model.isSelf && tabIdx != TAB.BAG;
            this.btnShowMySelf.visible = this._model.isSelf && tabIdx != TAB.BAG;
            this.boxGiveFlower.visible = tabIdx != TAB.BAG && clientCore.GiveFlowerManager.instance.isInActTime();
            this.boxCpTitle.visible = tabIdx == TAB.PERSON && this.cpTitleShow;
        }

        private onOpenSet() {
            this._settingPanel = this._settingPanel || new Settingpanel();
            clientCore.DialogMgr.ins.open(this._settingPanel);
        }
        private onBagTabRedChange() {
            this.imgRed.visible = this.bagTab.imgRed.visible && this._model.isSelf;
        }
        private _kefuPanel: KefuPanel;
        private onHelp() {
            this._kefuPanel = this._kefuPanel || new KefuPanel();
            this._kefuPanel.show();
        }
        private _showMySelf: boolean;
        private onShowMySelf() {
            this.ani1.play(0, false);
            this.ani1.wrapMode = this._showMySelf ? Laya.AnimationBase.WRAP_POSITIVE : Laya.AnimationBase.WRAP_REVERSE;
            this._showMySelf = !this._showMySelf;
            this.boxGiveFlower.visible = clientCore.GiveFlowerManager.instance.isInActTime() && !this._showMySelf;
        }
        private giveFlower() {
            alert.showGiveFlowerPanel({ uid: this._model.uid, nick: this._model.userBaseInfo.nick });
        }
        private updateFlowerNum(data: { uid: number, num: number }) {
            if (this._model.isSelf) {
                this.txtNum.text = data.num.toString();
            }
        }

        private onGodMirror() {
            clientCore.Logger.sendLog('2020年8月28日活动', '【系统】花神之镜', '点击花神之镜按钮（人物面板）');
            if (this._model.uid == clientCore.LocalInfo.uid) {
                this.destroy();
                clientCore.ModuleManager.open('godMirror.GodMirrorModule');
            }
            else {
                if (this._model.godMirrorInfo.length == 1) {
                    this.destroy();
                    let info = this._model.godMirrorInfo[0];
                    clientCore.ModuleManager.open('godMirror.GodMirrorInfoModule', info.userid + '_' + info.type);
                }
                else {
                    this._godMirrorPanel = this._godMirrorPanel || new GodMirrorPanel();
                    this._godMirrorPanel.show(this._model.godMirrorInfo);
                }
            }
        }

        addEventListeners() {
            this.btnClose.on(Laya.Event.CLICK, this, this.onClose);
            for (const clip of this._clipArr) {
                clip.on(Laya.Event.CLICK, this, this.onChangeTab);
            }
            BC.addEvent(this, this.btnSet, Laya.Event.CLICK, this, this.onOpenSet);
            BC.addEvent(this, this.bagTab, Laya.Event.CHANGED, this, this.onBagTabRedChange);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onHelp);
            BC.addEvent(this, this.btnAddFriend, Laya.Event.CLICK, this, this.onAddFriendClick);
            BC.addEvent(this, this.btnBlock, Laya.Event.CLICK, this, this.onBlockClick);
            BC.addEvent(this, this.btnCancelBlock, Laya.Event.CLICK, this, this.onCancelBlockClick);
            BC.addEvent(this, this.btnChat, Laya.Event.CLICK, this, this.onChatClick);
            BC.addEvent(this, this.btnShowMySelf, Laya.Event.CLICK, this, this.onShowMySelf);
            BC.addEvent(this, this.btnHomeVisitInfo, Laya.Event.CLICK, this, this.showHomeVisitInfo);
            BC.addEvent(this, this.btnCode, Laya.Event.CLICK, this, this.showMagicalCodePanel);
            BC.addEvent(this, this.btnGive, Laya.Event.CLICK, this, this.giveFlower);
            BC.addEvent(this, this.btnMirror, Laya.Event.CLICK, this, this.onGodMirror);
            BC.addEvent(this, this.btnMentorSure, Laya.Event.CLICK, this, this.onSureClick);
            BC.addEvent(this, EventManager, globalEvent.GIEV_SOME_FLOWER_UPDATE_NUM, this, this.updateFlowerNum);
            BC.addEvent(this, EventManager, "close_self_info_module", this, this.destroy);
            BC.addEvent(this, EventManager, "go_person_tab", this, this.openPersonTab);
        }
        onSureClick(e: Laya.Event) {
            let str = this._model.mentorInfo.type == 1 ? `确定要向${this._model.mentorInfo.nick}发送拜师请求吗？` : `确定要向${this._model.mentorInfo.nick}发送收徒请求吗？`;
            alert.showSmall(str, {
                callBack: { caller: this, funArr: [this.sureApply] },
                btnType: alert.Btn_Type.SURE_AND_CANCLE,
                needMask: true,
                clickMaskClose: true,
                needClose: true,
            });
        }
        sureApply() {
            let type = this._model.mentorInfo.type == 1 ? 2 : 1;
            this._control.teachersRelation(type, Laya.Handler.create(this, () => {
                !this._closed && alert.showFWords("请求发送成功！");
            }))
        }
        private openPersonTab(): void {
            this.showTab(TAB.PERSON, 1);
        }

        private showMagicalCodePanel(e: Laya.Event) {
            if (!this._magicalCodePanel) {
                this._magicalCodePanel = new MagicalCodePanel();
            }
            clientCore.DialogMgr.ins.open(this._magicalCodePanel);
        }
        private showHomeVisitInfo() {
            // this.destroy();
            let id = clientCore.LocalInfo.uid;
            clientCore.ModuleManager.open("friendHomeMsg.FriendHomeMsgModule", id);
        }
        private onAddFriendClick() {
            clientCore.FriendManager.instance.applyAddFriends([this._model.uid]).then((ids) => {
                alert.showFWords("加好友申请发送成功！");
                this.btnAddFriend.disabled = true;
            });
        }
        private onBlockClick() {
            if (clientCore.FriendManager.instance.isBlackListFull()) {
                alert.showFWords("黑名单已达上限！");
                return;
            }
            alert.showSmall("是否确定将该玩家加入黑名单？", { callBack: { funArr: [this.sureAddToBlack, this.cancel], caller: this }, btnType: alert.Btn_Type.SURE_AND_CANCLE, needMask: true, clickMaskClose: false });
        }
        private sureAddToBlack() {
            clientCore.FriendManager.instance.addToBlackList(this._model.uid).then(() => {
                this.btnBlock.visible = false;
                this.btnCancelBlock.visible = true;
            });
        }
        private cancel() {

        }
        private onCancelBlockClick() {
            alert.showSmall("是否确定将该玩家从黑名单移除？", { callBack: { funArr: [this.sureRemoveFromeBlackList, this.cancel], caller: this }, btnType: alert.Btn_Type.SURE_AND_CANCLE, needMask: true, clickMaskClose: false });
        }
        private sureRemoveFromeBlackList() {
            clientCore.FriendManager.instance.removeFromBlackList(this._model.uid).then(() => {
                this.btnCancelBlock.visible = false;
                this.btnBlock.visible = true;
            });
        }
        private onChatClick() {
            if (alert.checkAge(true)) return;
            clientCore.ModuleManager.open("chat.ChatModule", {
                chatType: 4,
                uid: this._model.userBaseInfo.userid,
                nick: this._model.userBaseInfo.nick,
                head: this._model.userBaseInfo.headImage,
                frame: this._model.userBaseInfo.headFrame
            });
            this.destroy();
        }

        removeEventListeners() {
            BC.removeEvent(this);
            this.btnClose.offAll();
            for (const clip of (this._clipArr)) {
                clip.offAll();
            }
        }

        private onChangeTab(e: Laya.Event) {
            let index = Number(e.currentTarget.name.split('_')[1]);
            if (index == TAB.BATTLE) {
                if (this._model.isSelf) {
                    clientCore.Logger.sendLog('系统', '主UI按钮触达', '点击自己的战斗信息页签');
                } else {
                    clientCore.Logger.sendLog('系统', '主UI按钮触达', '点击别人的战斗信息页签');
                }
            }
            this.showTab(index);
        }

        private onClose(e: Laya.Event) {
            this.destroy();
        }

        destroy() {
            super.destroy();
            for (const o of this._tabArr) {
                o?.destroy();
            }
            this._tabArr = [];
            this._cpPerson?.destroy();
            this._person?.destroy();
            this._kefuPanel?.destroy();
            this._godMirrorPanel?.destroy();
            clientCore.BgShowManager.instance.hideFullScreenBgShow();
            clientCore.BgShowManager.instance.hideDynamicStage();
        }
    }
}