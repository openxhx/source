
namespace family.panel {
    /**
     * 成员面板
     */
    export class MemberPanel extends ui.family.panel.MemberPanelUI implements IPanel {
        private _page: number;
        private _activeType: number;
        private _familyInfo: pb.IfmlBaseInfo;
        private _members: pb.memberInfo[];

        /** 人模*/
        private _person: clientCore.Person;

        /** 申请弹窗*/
        private _applyPanel: panel.ApplyPanel;
        /** 申请条件弹窗*/
        private _appSet: panel.ApplySetPanel;
        /** 离开家族弹窗*/
        private _leavePanel: panel.LeavePanel;
        /** 任命面板*/
        private _appointPanel: panel.AppointPanel;

        private _setFocusFlag: boolean = false;

        constructor() {
            super();
            this.list.vScrollBarSkin = "";
            this.list.scrollBar.elasticBackTime = 200;
            this.list.scrollBar.elasticDistance = 200;
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.selectHandler = Laya.Handler.create(this, this.listSelect, null, false);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);

            this._members = [];
            this._familyInfo = clientCore.FamilyMgr.ins.svrMsg;
            this.detail.txFamilyName.changeText(this._familyInfo.fmlName);
            this.detail.inputMini.text = this._familyInfo.declaration;
            this.detail.btnChange.visible = clientCore.FamilyMgr.ins.checkLimit(this._familyInfo.post, FamilyAuthority.CHANGESTATEMENT);
            this.detail.sp.scrollRect = new Laya.Rectangle(0, 0, 338, 303);
            //族徽
            this.updateBadge();

            this.hitArea = new Laya.Rectangle(-157, 0, this.width + 157, 594);
            this.mouseThrough = true;
            // this.btnRank.disabled = clientCore.GlobalConfig.isApp;

            this.selectActive(0);
        }

        update(parent: Laya.Sprite): void {
            this.addEventListeners();
            parent.addChild(this);
            this.updateBtn();
            this._page = 1;
            this.getMembers();
            this._familyInfo = clientCore.FamilyMgr.ins.svrMsg;
            this.detail.inputMini.text = this._familyInfo.declaration;
        }
        dispose(): void {
            this.removeSelf();
            this.removeEventListeners();
            this._members.length = 0;
        }
        destroy(): void {
            this.clearPerson();
            this.removeSelf();
            this.removeEventListeners();
            this._members.length = 0;
            this._familyInfo = this._applyPanel = this._appSet = this._leavePanel = this._appointPanel = null;
            super.destroy();
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.openRank);
            BC.addEvent(this, this.btnList, Laya.Event.CLICK, this, this.openApply);
            BC.addEvent(this, this.btnCon, Laya.Event.CLICK, this, this.openApplySet);
            BC.addEvent(this, this.btnLeave, Laya.Event.CLICK, this, this.openLeave);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScrollBarChange);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.START, this, this.onScrollBarStart);
            //以下detail
            BC.addEvent(this, this.detail.btnAppoint, Laya.Event.CLICK, this, this.openAppoint);
            BC.addEvent(this, this.detail.btnExpel, Laya.Event.CLICK, this, this.onExpel);
            BC.addEvent(this, this.detail.btnChange, Laya.Event.CLICK, this, this.onChangeMinif);
            BC.addEvent(this, this.detail.inputMini, Laya.Event.BLUR, this, this.declarationLoseFocus);
            BC.addEvent(this, this.detail.btnDissolve, Laya.Event.CLICK, this, this.onDissolve);
            //以下EventManager
            BC.addEvent(this, EventManager, FamilyConstant.UPDATE_POST, this, this.updatePost);
            BC.addEvent(this, EventManager, globalEvent.SYN_POST_CHANAGE, this, this.synChangePost);

            BC.addEvent(this, this.detail.imgBadge, Laya.Event.CLICK, this, this.startChangeBadge);
            BC.addEvent(this, this.detail.imgBoard, Laya.Event.CLICK, this, this.startChangeBadge);
            BC.addEvent(this, EventManager, globalEvent.FAMILY_BADGE_CHANGE, this, this.onFamilyBadgeChange);

            BC.addEvent(this, this.iconActive, Laya.Event.CLICK, this, this.onChangeActive);
            BC.addEvent(this, this.iconArrow, Laya.Event.CLICK, this, this.onChangeActive);
            BC.addEvent(this, this.labActive1, Laya.Event.CLICK, this, this.onChangeActive);
            BC.addEvent(this, this.labActive2, Laya.Event.CLICK, this, this.onChangeActive);
        }
        private onFamilyBadgeChange() {
            this._familyInfo = clientCore.FamilyMgr.ins.svrMsg;
            this.updateBadge();
        }
        private startChangeBadge() {
            net.sendAndWait(new pb.cs_set_family_badge_opt_status({ opt: 0, fmlId: clientCore.FamilyMgr.ins.familyId })).then((data: pb.sc_set_family_badge_opt_status) => {
                if (data.status == 0) {
                    clientCore.ModuleManager.open("familyBadge.FamilyBadgePanel", "change");
                }
                else if (data.status == 1) {
                    alert.showFWords("没有更换勋章权限！");
                }
                else if (data.status == 2) {
                    alert.showFWords("当前有其他人正在进行修改，请稍后");
                }
            });
        }

        private onChangeActive(e: Laya.Event): void {
            if (e.target == this.iconActive || e.target == this.iconArrow) {
                if (this._activeType == 0) {
                    this.labActive1.text = FamilyConstant.DONATE_TYPE[1];
                    this.labActive2.text = FamilyConstant.DONATE_TYPE[2];
                } else if (this._activeType == 1) {
                    this.labActive1.text = FamilyConstant.DONATE_TYPE[0];
                    this.labActive2.text = FamilyConstant.DONATE_TYPE[2];
                } else if (this._activeType == 2) {
                    this.labActive1.text = FamilyConstant.DONATE_TYPE[0];
                    this.labActive2.text = FamilyConstant.DONATE_TYPE[1];
                }
                this.boxActive.visible = !this.boxActive.visible;
                this.iconArrow.skin = this.boxActive.visible ? "family/arrow2.png" : "family/arrow1.png";
            } else {
                for (let i = 0; i < FamilyConstant.DONATE_TYPE.length; i++) {
                    if (e.target["text"] == FamilyConstant.DONATE_TYPE[i]) {
                        this.selectActive(i);
                        break;
                    }
                }
            }
        }

        private selectActive(type: number): void {
            this._activeType = type;
            this.iconActive.skin = "family/l_con_" + type + ".png";
            this.boxActive.visible = false;
            this.iconArrow.skin = "family/arrow1.png";
            this.list.refresh();
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private listRender(item: ui.family.item.MemberItemUI, index: number): void {
            let info: pb.memberInfo = this.list.array[index];
            item.txName.changeText(info.nick);
            item.txPost.changeText(FamilyConstant.POST[info.post]);
            if (this._activeType == 0) {
                item.txDonate.changeText(info.liveness + "");
            } else if (this._activeType == 1) {
                item.txDonate.changeText(info.weekLiveness + "");
            } else if (this._activeType == 2) {
                item.txDonate.changeText(info.monthLiveness + "");
            }
            //Laya.Browser.now() / 1000
            item.txLine.changeText(info.status == 0 ? "在线" : util.TimeUtil.getOfflineTime(clientCore.ServerManager.curServerTime - info.status));
            item.txLine.color = info.status == 0 ? "#13bd17" : "#fd3540";
            item.txLv.changeText(clientCore.LocalInfo.parseLvInfoByExp(info.exp).lv + "");
            item.imgSel.visible = this.list.selectedIndex == index;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (idx == this.list.selectedIndex && e.type == Laya.Event.CLICK) {
                let data = this.list.getItem(idx) as pb.memberInfo;
                clientCore.UserInfoTip.showTips(e.target, data.userid);
            }
        }

        private listSelect(index: number): void {
            if (index == -1) return;
            if (!this.list.array[index]) return;
            this.updateView(this.list.array[index]);
        }

        private updateView(info: pb.memberInfo): void {
            let post: number = this._familyInfo.post;
            let isOther: boolean = info.userid != clientCore.LocalInfo.uid;
            this.detail.btnExpel.visible = isOther && clientCore.FamilyMgr.ins.checkLimit(post, FamilyAuthority.DISMISS) && post < info.post;
            this.detail.btnAppoint.visible = isOther && clientCore.FamilyMgr.ins.checkLimit(post, FamilyAuthority.NOMINATE) && post < info.post;
            this.detail.txMemberName.changeText(FamilyConstant.POST[info.post] + ": " + info.nick);
            this.detail.btnDissolve.visible = this.list.length == 1 && info.post == FamlyPost.SHAIKH;
            FamilySCommand.ins.getCloths(info.userid, Laya.Handler.create(this, this.updatePerson));
        }

        private updatePerson(sex: number, cloths: number[]): void {
            if (!this._person || this._person.sex != sex) {
                this.clearPerson();
                this._person = new clientCore.Person(sex);
                this._person.scale(0.4, 0.4);
                this._person.pos(150, 220);
                this.detail.sp.addChild(this._person);
            }
            this._person.replaceByIdArr(cloths);
        }

        /** 清理人模*/
        private clearPerson(): void {
            this._person && this._person.destroy();
            this._person = null;
        }

        private updateBtn(): void {
            this.btnList.disabled = this.btnCon.disabled = !clientCore.FamilyMgr.ins.checkLimit(this._familyInfo.post, FamilyAuthority.APPROVE);
            this.detail.btnChange.visible = clientCore.FamilyMgr.ins.checkLimit(this._familyInfo.post, FamilyAuthority.CHANGESTATEMENT);
            this.detail.inputMini.editable = false;
            this.detail.inputMini.mouseEnabled = false;

        }

        /** 更新族徽*/
        private updateBadge(): void {
            this.detail.imgBadge.skin = pathConfig.getFamilyBadgeUrl(this._familyInfo.badgeType);
            this.detail.imgBoard.skin = pathConfig.getFamilyBadgeUrl(this._familyInfo.badgeBase);
        }

        private getMembers(): void {
            FamilySCommand.ins.getMembers(this._page, Laya.Handler.create(this, (arr: pb.memberInfo[]) => {
                this._members = this._members.concat(arr);
                this.sortMember();
                this.list.selectedIndex = 0;
                this._page++;
            }))
        }

        /** 踢出*/
        private onExpel(): void {
            if (clientCore.ServerManager.curServerTime > util.TimeUtil.formatTimeStrToSec("2022-3-7 00:00:00")
                && clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2022-3-11 00:00:00")) {
                alert.showFWords("活动期间不能开除成员~");
                return;
            }
            let info: pb.memberInfo = this.list.array[this.list.selectedIndex];
            if (!info) return;
            alert.showSmall(`是否确定将${info.nick}从本家族中开除？`, {
                callBack: {
                    funArr: [this.expelMember],
                    caller: this
                }
            });
        }
        private expelMember(): void {
            let info: pb.memberInfo = this.list.array[this.list.selectedIndex];
            FamilySCommand.ins.acceptionOpt(5, Laya.Handler.create(this, () => {
                this.list.deleteItem(this.list.selectedIndex);
                this.list.selectedIndex == 0 ? this.listSelect(0) : (this.list.selectedIndex = 0);
            }), info.userid);
        }

        /** 打开家族排行*/
        private openRank(): void {
            clientCore.ModuleManager.open('familyRank.FamilyRankModule');
        }

        /** 打开申请*/
        private openApply(): void {
            this._applyPanel = this._applyPanel || new panel.ApplyPanel();
            this._applyPanel.show();
        }

        /** 打开申请条件*/
        private openApplySet(): void {
            this._appSet = this._appSet || new panel.ApplySetPanel();
            this._appSet.show();
        }

        /** 打开离开家族*/
        private openLeave(): void {
            this._leavePanel = this._leavePanel || new panel.LeavePanel();
            this._leavePanel.show();
        }

        private showRule(): void {
            alert.showRuleByID(2);
        }

        /** 打开任命*/
        private openAppoint(): void {
            let info: pb.memberInfo = this.list.array[this.list.selectedIndex];
            if (!info) return;
            this._appointPanel = this._appointPanel || new panel.AppointPanel();
            this._appointPanel.show(info);
        }

        private declarationLoseFocus(): void {
            console.log("declaration txt lose focus!!!");
            if (!this._setFocusFlag) {
                return;
            }
            this.detail.inputMini.editable = false;
            this.detail.inputMini.mouseEnabled = false;
            if (clientCore.FamilyMgr.ins.svrMsg.declaration != this.detail.inputMini.text) {
                alert.showSmall("是否确认更改家族宣言？", {
                    callBack: { funArr: [this.sureChangeDeclaration, this.cancelChangeDeclaration], caller: this },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: false,
                    needClose: true,
                })
            }

        }
        private sureChangeDeclaration() {
            //关闭编辑 若有更改则通知服务器
            let txt = this.detail.inputMini.text;
            if (!this.detail.inputMini.editable && txt != clientCore.FamilyMgr.ins.svrMsg.declaration) {
                FamilySCommand.ins.changeContext(0, txt);
                clientCore.FamilyMgr.ins.svrMsg.declaration = txt;
            }
        }
        private cancelChangeDeclaration() {
            this.detail.inputMini.text = clientCore.FamilyMgr.ins.svrMsg.declaration;
        }
        /** 编辑宣言*/
        private onChangeMinif(): void {
            if (this.detail.inputMini.editable == true) {
                return;
            }
            this._setFocusFlag = true;
            this.detail.inputMini.editable = true;
            this.detail.inputMini.mouseEnabled = true;
            //可编辑 自动获得焦点？
            if (this.detail.inputMini.editable) {
                this.detail.inputMini.focus = true;
            }
        }

        /** 解散家族*/
        private onDissolve(): void {
            alert.showSmall("解散后将离开家族并清除当前家族的所有数据，是否确认解散？", {
                callBack: {
                    funArr: [this.dissolve],
                    caller: this
                }
            })
        }

        private dissolve(): void {
            let ins: clientCore.FamilyMgr = clientCore.FamilyMgr.ins;
            net.sendAndWait(new pb.cs_delete_family_info({ fmlId: ins.familyId })).then((msg: pb.sc_delete_family_info) => {
                ins.leaveFamily();
            })
        }

        /** 当前成员的职位更新*/
        private updatePost(post: number): void {
            // 当某个角色的职位变动为族长 那么就是族长让位辽
            if (post == FamlyPost.SHAIKH) {
                clientCore.FamilyMgr.ins.svrMsg.post = FamlyPost.MEMBER;
                this._members[0].post = FamlyPost.MEMBER;
                this.updateBtn();
            }
            let info: pb.memberInfo = this.list.array[this.list.selectedIndex];
            info.post = post;
            this.sortMember();
            this.updateView(info);
        }

        /** 自身职位变化*/
        private synChangePost(): void {
            this.updateBtn();
            //更新自身
            let need: boolean = false;
            let len: number = this._members.length;
            let myPost: number = clientCore.FamilyMgr.ins.svrMsg.post;
            for (let i: number = 0; i < len; i++) {
                let element: pb.memberInfo = this._members[i];
                if (element && element.userid == clientCore.LocalInfo.uid) { //列表中正好有自己
                    element.post = clientCore.FamilyMgr.ins.svrMsg.post;
                    need = true;
                }
                if (myPost == FamlyPost.SHAIKH && element.userid != clientCore.LocalInfo.uid && element.post == FamlyPost.SHAIKH) { //当自己的职位变更为族长 此时族长则变更为族员
                    element.post = FamlyPost.MEMBER;
                    need = true;
                }
            }
            //列表中有自己 重新排列
            if (need) {
                this.sortMember();
                this.list.selectedIndex = -1;
                this.list.selectedIndex = 0;
            } else {
                this.listSelect(this.list.selectedIndex);
            }
        }

        private sortMember(): void {
            this._members = _.uniqBy(this._members, (element) => { return element.userid; });
            let obj: object = _.groupBy(this._members, (element) => { return element.status == 0; })
            this._members = _.concat(_.sortBy(obj["true"], ["post"]), _.sortBy(obj["false"], ["post"]));
            let value: number = this.list.scrollBar.value;
            this.list.array = this._members;
            this.boxBar.visible = this.list.scrollBar.max > 0;
            if (this.boxBar.visible) {
                this.list.scrollBar.value = value;
                this.onScrollBarChange();
            }
        }

        private onScrollBarChange(): void {
            let scrollBar: Laya.ScrollBar = this.list.scrollBar;
            if (scrollBar.max <= 0) return;
            this.imgBar.y = -1 + _.clamp(343 * (scrollBar.value / scrollBar.max), 0, 343);
        }

        private _wait: boolean = false;
        private onScrollBarStart(): void {
            let scrollBar: Laya.ScrollBar = this.list.scrollBar;
            if (this.list.length % 10 != 0 || scrollBar.value < scrollBar.max || this._wait) return;
            this._wait = true;
            FamilySCommand.ins.getMembers(this._page, Laya.Handler.create(this, (arr: pb.memberInfo[]) => {
                this._wait = false;
                if (arr.length > 0) {
                    this._page++;
                    this._members = this._members.concat(arr);
                    this.sortMember();
                }
            }))
        }
    }
}