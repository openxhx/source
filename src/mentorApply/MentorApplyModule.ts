namespace mentorApply {
    /**
     * mentorApply.MentorApplyModule
     * 导师计划 桃李园
     * 
     * 
     * 若玩家等级（lv>=50），则点击【发布】按钮，打开收徒信息面板；点击【寻找】按钮，弹出：寻找徒弟【输入玩家ID】面板。在【找师父】页签中，可以看收徒信息，但隐藏【拜师】按钮。
     * 若玩家等级（30<lv<50），在点击【发布】按钮及【寻找】，提示：达到50级后，才能发布收徒请求哦！在【找师父】&【找徒弟】页签中，隐藏【拜师】和【收徒】按钮。
     * 若玩家等级（lv<=30），在点击【发布】按钮，打开拜师信息面板；点击【寻找】按钮，弹出：寻找师父【输入玩家ID】面板。在【找徒弟】页签中，隐藏【收徒】按钮。
     * 
     * 
     */
    export class MentorApplyModule extends ui.mentorApply.MentorApplyModuleUI {
        private _getTeacherArr: pb.INoticeInfo[];//拜师
        private _getStudentArr: pb.INoticeInfo[];//收徒
        private _preTabIndex: number = -1;

        private _t: time.GTime;
        private _applyInfoPanel: ApplyInfoPanel;
        // private _lastPublishTimeStamp: number = 0;
        private _searchPanel: SearchPanel;
        constructor() {
            super();
        }
        init(data: any) {
            this.drawCallOptimize = true;
            this.addPreLoad(xls.load(xls.tutorRecruit));
            this.addPreLoad(xls.load(xls.tutorCommonData));
            // let type = clientCore.LocalInfo.userLv < 50 ? 2 : 1;
            this.addPreLoad(this.checkLastPostInfo());
            this.addPreLoad(clientCore.MentorManager.getTeacherApply());
            this.addPreLoad(clientCore.MentorManager.getStudentApply());
            // this.createTestData();

            this.listApply.renderHandler = new Laya.Handler(this, this.showDetailInfo, null, false);
            this.listApply.mouseHandler = new Laya.Handler(this, this.onApplyClick);
        }
        private async checkLastPostInfo() {
            // let lastTime = clientCore.MentorManager.applyInfo.selfNoticeInfo?.timestamp ?? 0;
            // if (lastTime < 1 || (lastTime > 0 && clientCore.ServerManager.curServerTime - lastTime > 72 * 3600)) {
            net.sendAndWait(new pb.cs_get_user_post_notice({})).then((data: pb.sc_get_user_post_notice) => {
                clientCore.MentorManager.applyInfo.selfNoticeInfo = data.notice;
                return Promise.resolve();
            })
            // }
            // else {
            //     return Promise.resolve();
            // }
        }

        onApplyClick(e: Laya.Event, index: number) {
            let info: pb.INoticeInfo = this.listApply.array[index];
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == "btnGetStudent") {/**收徒 */
                    let noticeInfo = new clientCore.mentor.MentorNoticeInfo();
                    noticeInfo.uid = info.userid;
                    noticeInfo.type = info.type;
                    noticeInfo.mIndex = info.mIndex;
                    noticeInfo.nick = info.nick;
                    this.destroy();
                    clientCore.ModuleManager.open("selfInfo.SelfInfoModule", { info: noticeInfo }, { openWhenClose: 'mentorApply.MentorApplyModule', openData: this._preTabIndex });
                    // net.sendAndWait(new pb.cs_apply_teachers_relation({ type: 1, otherId: info.userid })).then((data: pb.sc_apply_teachers_relation) => {

                    // });
                }
                else if (e.target.name == "btnGetTeacher") {/**拜师 */
                    let noticeInfo = new clientCore.mentor.MentorNoticeInfo();
                    noticeInfo.uid = info.userid;
                    noticeInfo.type = info.type;
                    noticeInfo.mIndex = info.mIndex;
                    noticeInfo.nick = info.nick;
                    this.destroy();
                    clientCore.ModuleManager.open("selfInfo.SelfInfoModule", { info: noticeInfo }, { openWhenClose: 'mentorApply.MentorApplyModule', openData: this._preTabIndex });
                    // net.sendAndWait(new pb.cs_apply_teachers_relation({ type: 2, otherId: info.userid })).then((data: pb.sc_apply_teachers_relation) => {

                    // });
                }
            }
        }
        showDetailInfo(cell: ui.mentorApply.ApplyItemUI, index: number) {
            let info: pb.INoticeInfo = this.listApply.array[index];
            cell.txtID.text = "" + info.userid;
            cell.txtName.text = info.nick;
            cell.txtContent.text = xls.get(xls.tutorRecruit).get(info.mIndex).recruitDesc;
            cell.imgNormalBg.visible = info.babyVipType == 0;
            cell.imgNormalTag.visible = info.babyVipType == 0;
            cell.imgVipBg.visible = info.babyVipType > 0;
            cell.imgVipTag.visible = info.babyVipType > 0;

            cell.btnGetStudent.visible = this._preTabIndex == 1 && clientCore.LocalInfo.userLv >= 50;
            cell.btnGetTeacher.visible = this._preTabIndex == 0 && clientCore.LocalInfo.userLv <= 30;
        }
        onPreloadOver() {
            this._getTeacherArr = clientCore.MentorManager.applyInfo.teacherApplyArr.slice();
            this._getStudentArr = clientCore.MentorManager.applyInfo.studentApplyArr.slice();
            let showTab = clientCore.LocalInfo.userLv >= 50 ? 1 : 0;
            this.showInfoByType(this._data || showTab);

            let lastTime = clientCore.MentorManager.applyInfo.selfNoticeInfo?.timestamp ?? 0;
            if (lastTime > 0 && clientCore.ServerManager.curServerTime - lastTime < 48 * 3600) {
                this.btnPublish.visible = false;
                this.btnPromote.visible = true;
            }
            else {
                this.btnPublish.visible = true;
                this.btnPromote.visible = false;
            }
            let costInfo = xls.get(xls.tutorCommonData).get(1).publicityPrice;
            this.fontNum.value = costInfo.v2.toString();
            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(costInfo.v1);
            this.updateCd();
        }
        showInfoByType(index: number) {
            this._preTabIndex = index;
            this.tab_0.skin = index == 0 ? "mentorApply/tab_0_show.png" : "mentorApply/tab_0_hide.png";
            this.tab_1.skin = index == 1 ? "mentorApply/tab_1_show.png" : "mentorApply/tab_1_hide.png";

            this.listApply.array = index == 0 ? this._getTeacherArr : this._getStudentArr;
        }
        private onTabClick(index: number) {
            if (this._preTabIndex != index) {
                this.showInfoByType(index);
            }
        }
        private onPublishClick(e: Laya.Event) {
            let lv = clientCore.LocalInfo.userLv;
            if (!clientCore.MentorConst.checkCanStudentByLv() && !clientCore.MentorConst.checkCanTeacherByLv()) {
                alert.showSmall(`达到${clientCore.MentorConst.minTeacherLv}级后，才能发布收徒请求哦！`);
                return;
            }
            if (!this._applyInfoPanel) {
                this._applyInfoPanel = new ApplyInfoPanel();
                BC.addEvent(this, this._applyInfoPanel, "DIALOG_SELECT", this, this.applyDialogSelect);
            }
            if (lv <= 30) {
                this._applyInfoPanel.show(1);
            }
            else if (lv >= 50) {
                this._applyInfoPanel.show(2);
            }
        }
        applyDialogSelect(index: number) {
            let type = index < 2000 ? 1 : 2;
            net.sendAndWait(new pb.cs_teachers_post_notice({ type: type, mIndex: index })).then((data: pb.sc_teachers_post_notice) => {
                clientCore.MentorManager.applyInfo.selfNoticeInfo = data.notice;
                this.btnPublish.visible = false;
                this.btnPromote.visible = true;
                alert.showFWords("申请发布成功！");
                this._applyInfoPanel?.closeClick(null);

            });
        }
        onPromoteClick(e: Laya.Event) {
            let notice = clientCore.MentorManager.applyInfo.selfNoticeInfo;
            let costInfo = xls.get(xls.tutorCommonData).get(1).publicityPrice;
            let str = notice.type == 1 ? `是否确认要花费${costInfo.v2}${clientCore.ItemsInfo.getItemName(costInfo.v1)}，在世界频道发布收徒信息？` : `是否确认要花费${costInfo.v2}${clientCore.ItemsInfo.getItemName(costInfo.v1)}，在世界频道发布拜师信息？`;
            alert.showSmall(str, {
                callBack: { caller: this, funArr: [this.surePromote] },
                btnType: alert.Btn_Type.SURE_AND_CANCLE,
                needMask: true,
                clickMaskClose: true,
                needClose: true,
            });
        }
        surePromote() {
            let notice = clientCore.MentorManager.applyInfo.selfNoticeInfo;
            net.sendAndWait(new pb.cs_propaganda_teachers_notice({ type: notice.type })).then(() => {
                alert.showFWords("宣传成功！");
            });
        }
        addEventListeners() {
            BC.addEvent(this, this.tab_0, Laya.Event.CLICK, this, this.onTabClick, [0]);
            BC.addEvent(this, this.tab_1, Laya.Event.CLICK, this, this.onTabClick, [1]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnPublish, Laya.Event.CLICK, this, this.onPublishClick);
            BC.addEvent(this, this.btnPromote, Laya.Event.CLICK, this, this.onPromoteClick);
            BC.addEvent(this, this.btnSearch, Laya.Event.CLICK, this, this.onSearchClick);
            BC.addEvent(this, this.btnRefresh, Laya.Event.CLICK, this, this.refreshApplyInfo);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, () => { alert.showRuleByID(1003); });
        }
        private async refreshApplyInfo() {
            if (this.timeBox.visible) return;
            if (this._preTabIndex == 0) {
                await clientCore.MentorManager.getTeacherApply(true);
                this.listApply.array = clientCore.MentorManager.applyInfo.teacherApplyArr.slice();
            }
            else {
                await clientCore.MentorManager.getStudentApply(true);
                this.listApply.array = clientCore.MentorManager.applyInfo.studentApplyArr.slice();
            }
            alert.showFWords("刷新成功！");
            clientCore.MentorManager.applyInfo.refreshTime = clientCore.ServerManager.curServerTime;
            this.updateCd();
        }
        private onSearchClick(e: Laya.Event) {
            let lv = clientCore.LocalInfo.userLv;
            if (!clientCore.MentorConst.checkCanStudentByLv() && !clientCore.MentorConst.checkCanTeacherByLv()) {
                alert.showSmall(`达到${clientCore.MentorConst.minTeacherLv}级后，才能发布收徒请求哦！`);
                return;
            }
            let type = clientCore.MentorConst.checkCanStudentByLv() ? 2 : 1;
            if (!this._searchPanel) {
                this._searchPanel = new SearchPanel();
            }
            this._searchPanel.show(type);
        }

        private updateCd(): void {
            this._t?.dispose();
            let cd: number = clientCore.ServerManager.curServerTime - clientCore.MentorManager.applyInfo.refreshTime;
            let isCd: boolean = cd < 5;
            this.timeBox.visible = isCd;
            if (isCd) {
                this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
                this._t.start();
                this.onTime();
            }
        }

        private onTime(): void {
            let cd: number = clientCore.ServerManager.curServerTime - clientCore.MentorManager.applyInfo.refreshTime;
            if (cd >= 5) {
                this.timeBox.visible = false;
                this._t.dispose();
                return;
            }
            this.timtTxt.changeText(util.StringUtils.getDateStr2(5 - cd, '{min}:{sec}'));
        }

        destroy() {
            this._t?.dispose();
            this._t = null;
            BC.removeEvent(this);
            super.destroy();
        }
    }
}