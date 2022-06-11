
namespace mentor {
    const HOUR_24 = 3600 * 24;
    import MentorManager = clientCore.MentorManager;
    /**
     * 导师系统-导师面板
     * mentor.MentorTeacherModule
     */
    export class MentorTeacherModule extends ui.mentor.MentorTeacherModuleUI {
        /**当前选中的学生信息（导师系统的信息） */
        private _currSelectStudent: clientCore.mentor.StudentInfo;
        /**当前选中学生的玩家信息UserBase */
        private _currStudentUserInfo: pb.IUserBase;
        private _applyPanel: MentorApplyPanel;
        private _graducatePanel: MentorGraducatePanel;
        private _taskXlsInfos: xls.taskData[];
        private _reqing: boolean;

        init(d: any) {
            super.init(d);
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.listTask.vScrollBarSkin = null;
            this.listTask.renderHandler = new Laya.Handler(this, this.onListTaskRender);
            let studenIds = _.map(MentorManager.student.studentList, o => o.uid);
            this.addPreLoad(clientCore.UserInfoDataBase.reqUserInfo(studenIds));
            this.listItem.renderHandler = new Laya.Handler(this, this.onListItemRender);
            this.listItem.mouseHandler = new Laya.Handler(this, this.onListItemMouse);
            this._taskXlsInfos = _.filter(xls.get(xls.taskData).getValues(), o => o.type == 9);
            this.drawCallOptimize = true;
        }

        onPreloadOver() {
            this.updateApplyRed();
            this.updateList();
            this._currSelectStudent = this.list.dataSource[0];
            this.updateRightView();
            clientCore.Logger.sendLog('活动', '导师计划', '打开活动面板')
        }

        /**刷新一下学生的人物信息(有个flg防止同时多次刷新) */
        private reqStudentUserInfo() {
            if (this._reqing)
                return;
            this._reqing = true;
            let studenIds = _.map(MentorManager.student.studentList, o => o.uid);
            clientCore.UserInfoDataBase.reqUserInfo(studenIds).then(() => {
                this._reqing = false;
                //列表刷新下
                this.list.startIndex = this.list.startIndex;
                //右边也刷新下
                this.updateRightView(false);
            })
        }

        private onListRender(cell: ui.mentor.render.MentorStudentRenderUI, idx: number) {
            let isSelect = false;
            let data = cell.dataSource;
            cell.boxInfo.visible = cell.boxEmpty.visible = cell.txttime.visible = false;
            if (data instanceof clientCore.mentor.StudentInfo) {
                isSelect = this._currSelectStudent && this._currSelectStudent.uid == data.uid;
                cell.boxInfo.visible = true;
                cell.imgBg.skin = 'mentor/di_zhitiao.png';
                //如果
                if (clientCore.UserInfoDataBase.checkHaveUId(data.uid)) {
                    let userInfo = clientCore.UserInfoDataBase.getUserInfo(data.uid);
                    cell.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(userInfo.headImage);
                    cell.txtlv.text = clientCore.LocalInfo.parseLvInfoByExp(userInfo.exp).lv.toString();
                    cell.txtNick.text = userInfo.nick;
                }
                else {
                    Laya.timer.callLater(this, this.reqStudentUserInfo);
                }
                let grow = data._srvData.grow;
                let lvInfo = clientCore.MentorConst.parseLvByGrow(grow);
                cell.clipTag.index = lvInfo.lv;
                let haveRwd = data.haveReward;
                cell.imgRwd.skin = haveRwd ? 'mentor/haveRwd.png' : 'mentor/noRwd.png';
                cell.imgRwd.mouseEnabled = haveRwd;
                cell.imgRed.visible = data.helpState == clientCore.MENTOR_HELP_STATE.WAITTING;
                cell.txtExp.text = `${lvInfo.currExp}/${lvInfo.totalExp}`;
                cell.txtUid.text = `uid:${data.uid}`;
                cell.imgProgress.width = 296 * lvInfo.currExp / lvInfo.totalExp;
                cell.imgNextGet.visible = !(data.allRewardClaimed || haveRwd);
                if (cell.imgNextGet.visible) {
                    cell.txtNextGetNum.text = xls.get(xls.tutorLevel).get(_.clamp(lvInfo.lv + 1, 0, 5)).tutorReward[0].v2.toString();
                    cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(9900025);
                }
            }
            else if (_.isUndefined(data)) {
                cell.boxEmpty.visible = true;
                cell.imgBg.skin = 'mentor/di_zhitiao.png';
            }
            else if (_.isNumber(data)) {
                //显示倒计时
                cell.txttime.visible = true;
                cell.imgBg.skin = 'mentor/di_zhitiao_dark.png';
                cell.txttime.changeText('剩余' + util.StringUtils.getDateStr2(HOUR_24 + data - clientCore.ServerManager.curServerTime))
            }
            cell.imgSelect.visible = isSelect;
            cell.x = isSelect ? 20 : 0;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.list.getItem(idx);
                if (data instanceof clientCore.mentor.StudentInfo) {
                    if (e.target.name == 'imgRwd') {
                        //领取了桃李之心
                        MentorManager.student.getStudentHeartReward(data.uid).then(() => {
                            this.onStudentHeartGetted();
                        })
                    }
                    else {
                        this._currSelectStudent = this.list.getItem(idx);
                        this.list.startIndex = this.list.startIndex;
                        this.updateRightView();
                    }
                }
                if (_.isUndefined(data)) {
                    this.needOpenMod = 'mentorApply.MentorApplyModule';
                    this.destroy();
                }
            }
        }

        private onStudentHeartGetted() {
            //如果领取后，这个学生的所有桃李之心都没了，刷新下列表
            if (this._currSelectStudent.allRewardClaimed) {
                this.updateList();
                this._currSelectStudent = this.list.dataSource[0];
                this.updateRightView();
            }
            else {
                //只需要刷新下list的render就行
                this.list.startIndex = this.list.startIndex;
            }
        }

        private onListTaskRender(cell: ui.mentor.render.MentorTaskListRenderUI, idx: number) {
            let xlsInfo = cell.dataSource as xls.taskData;
            let taskInfo = this._currSelectStudent?.getTaskInfoById(xlsInfo.task_id);
            cell.txtProgress.visible = false;
            cell.txtDetail.text = xlsInfo.task_content;
            if (taskInfo) {
                cell.imgComplete.skin = taskInfo.state == clientCore.TASK_STATE.REWARDED ? 'mentor/stateComplete.png' : 'mentor/stateDoing.png'
            }
            else {
                cell.imgComplete.skin = 'mentor/stateDoing.png';
            }
        }

        private onListItemRender(cell: Laya.Box, idx: number) {
            let data = cell.dataSource as pb.INeedItem;
            let rwdUI = cell.getChildByName('item') as ui.commonUI.item.RewardItemUI;
            rwdUI.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.id);
            rwdUI.num.value = util.StringUtils.parseNumFontValue(clientCore.ItemsInfo.getItemNum(data.id), data.need);
            rwdUI.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            rwdUI.num.visible = this._currSelectStudent?.helpState == clientCore.MENTOR_HELP_STATE.WAITTING;
            (cell.getChildByName('submit') as Laya.Sprite).visible = this._currSelectStudent?.helpState != clientCore.MENTOR_HELP_STATE.WAITTING;
        }

        private onListItemMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == 'imgBg') {
                    clientCore.ToolTip.showTips(e.target, { id: e.currentTarget['dataSource'].id });
                }
            }
        }

        private updateList() {
            //学生列表 + 空闲列表
            let studenArr = MentorManager.student.studentList.slice();
            let emptyLen = Math.max(0, 5 - studenArr.length);
            this.list.dataSource = _.concat(studenArr, new Array(emptyLen));
        }

        /**
         * 更新右边的ui
         * @param scrollTaskList 是否重置任务列表滚动 默认刷新
         */
        private updateRightView(scrollTaskList: boolean = true) {
            this.btnGraducateList.disabled = clientCore.MentorManager.history.getGraduationList().length == 0;
            let haveStudent = MentorManager.student.studentList.length > 0;
            if (haveStudent) {
                if (!this._currSelectStudent)
                    return;
                this._currStudentUserInfo = clientCore.UserInfoDataBase.getUserInfo(this._currSelectStudent.uid);
                this.boxNoStudent.visible = false;
                this.boxTaskList.visible = true;
                //学生信息
                if (this._currStudentUserInfo) {
                    this.btnCutOff.gray = this._currStudentUserInfo.olLast != 0 && (clientCore.ServerManager.curServerTime - this._currStudentUserInfo.olLast) < 172800;
                    this.txtNIck.text = this._currStudentUserInfo.nick;
                    this.txtlv.text = clientCore.LocalInfo.parseLvInfoByExp(this._currStudentUserInfo.exp).lv.toString();
                    this.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(this._currStudentUserInfo.headImage);
                }
                else {
                    this.reqStudentUserInfo();
                }
                this.btnAdd.visible = clientCore.FriendManager.instance.getFriendInfoById(this._currSelectStudent.uid) == null;
                //任务--这里有特殊处理，如果导师通过申请的时候学生不在线，是没有tasks的
                //所以这里全部走表的数据
                this.listTask.dataSource = this._taskXlsInfos;
                this.listTask.startIndex = this.listTask.startIndex;
                if (scrollTaskList)
                    this.listTask.scrollTo(0);
                this.updateHelpView();
            }
            else {
                this.boxTaskList.visible = this.boxHelp.visible = false;
                this.boxNoStudent.visible = this.boxNoHelp.visible = true;
            }
        }

        /**更新右下方帮助信息 */
        private updateHelpView() {
            if (!this._currSelectStudent)
                return;
            //只要学生发起了求助，就显示列表，无论学生是否领取
            this.boxNoHelp.visible = this._currSelectStudent.helpState == clientCore.MENTOR_HELP_STATE.NO_HELP;
            this.boxHelp.visible = this._currSelectStudent.helpState != clientCore.MENTOR_HELP_STATE.NO_HELP;
            if (this.boxHelp.visible) {
                //只要不是等待师傅交付状态，无论学生是否领取，提交按钮都灰
                this.listItem.dataSource = this._currSelectStudent.helpItems;
                this.btnSubmit.disabled = this._currSelectStudent.helpState != clientCore.MENTOR_HELP_STATE.WAITTING;
            }
        }

        private onScroll() {
            let scroll = this.listTask.scrollBar;
            this.imgScroll.y = this.imgScrollBg.y + (this.imgScrollBg.height - this.imgScroll.height) * scroll.value / scroll.max;
        }

        private onGraducateList() {
            this._graducatePanel = this._graducatePanel || new MentorGraducatePanel();
            this._graducatePanel.show();
        }

        private onRwdList() {
            clientCore.ModuleManager.open('mentorClothExchange.MentorClothExchangeModule');
        }

        private _needLeaf: number;
        private onSubmit() {
            if (this._currSelectStudent) {
                this._needLeaf = 0;
                for (const needInfo of this._currSelectStudent.helpItems) {
                    let lackNum = clientCore.ItemsInfo.getItemLackNum({ itemID: needInfo.id, itemNum: needInfo.need });
                    this._needLeaf += lackNum * xls.get(xls.materialBag).get(needInfo.id).buy;
                }
                if (this._needLeaf > 0) {
                    alert.showSmall(`道具不足，是否花费${this._needLeaf}个神叶交付?`, { callBack: { caller: this, funArr: [this.sureSubmitItem] } })
                }
                else {
                    this.sureSubmitItem();
                }
            }
        }

        private sureSubmitItem() {
            if (this._needLeaf > 0)
                alert.useLeaf(this._needLeaf, new Laya.Handler(this, this.reqSubmit));
            else
                this.reqSubmit();
        }

        private reqSubmit() {
            if (this._currSelectStudent) {
                let ids = _.map(this._currSelectStudent.helpItems, o => o.id);
                MentorManager.student.giveItemToStudent(this._currSelectStudent.uid, ids).then(() => {
                    this.updateHelpView();
                })
            }
        }

        private onHistory() {
            this._applyPanel = this._applyPanel || new MentorApplyPanel();
            this._applyPanel.show();
        }

        private updateApplyRed() {
            this.imgApplyRed.visible = MentorManager.history.getApplyList().length > 0;
        }

        private onCutOff() {
            if (this._currStudentUserInfo) {
                if (this.btnCutOff.gray)
                    alert.showFWords('对方超过48小时未登录后才能断绝关系哟！')
                else
                    alert.showSmall(`确定要与${this._currStudentUserInfo.nick}断绝师徒关系吗?`, { callBack: { caller: this, funArr: [this.sureCutOff] } })
            }
            else
                this.reqStudentUserInfo();
        }

        private sureCutOff() {
            clientCore.MentorManager.student.cutOffOneStudent(this._currSelectStudent.uid);
        }

        private onIdentifyChange() {
            this.updateList();
            this.updateRightView();
        }

        private onPrivate() {
            if (alert.checkAge(true)) return;
            if (this._currStudentUserInfo)
                net.sendAndWait(new pb.cs_query_stranger_chat_flag({ userid: this._currStudentUserInfo.userid })).then((msg: pb.sc_query_stranger_chat_flag) => {
                    if (msg.isFriend == 0 && msg.flag == 0) {
                        alert.showFWords(`${this._currStudentUserInfo.nick}禁止了和陌生人私聊哦~`)
                        return;
                    }
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.DialogMgr.ins.closeAllDialog();
                    clientCore.ModuleManager.open("chat.ChatModule", {
                        chatType: 4,
                        uid: this._currStudentUserInfo.userid,
                        nick: this._currStudentUserInfo.nick,
                        head: this._currStudentUserInfo.headImage,
                        frame: this._currStudentUserInfo.headFrame
                    })
                })
        }

        private onAdd() {
            if (this._currSelectStudent)
                clientCore.FriendManager.instance.applyAddFriends([this._currSelectStudent.uid]).then(() => {
                    alert.showFWords("加好友申请发送成功！");
                });
        }

        private onHelpStateChange() {
            this.updateHelpView();
            this.updateList();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, () => { alert.showRuleByID(1003); });
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onAdd);
            BC.addEvent(this, this.btnTalk, Laya.Event.CLICK, this, this.onPrivate);
            BC.addEvent(this, this.btnCutOff, Laya.Event.CLICK, this, this.onCutOff);
            BC.addEvent(this, this.btnHistory, Laya.Event.CLICK, this, this.onHistory);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.onSubmit);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGraducateList, Laya.Event.CLICK, this, this.onGraducateList);
            BC.addEvent(this, this.btnRwdList, Laya.Event.CLICK, this, this.onRwdList);
            BC.addEvent(this, this.listTask.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, EventManager, globalEvent.MENTOR_HELP_CHANGE, this, this.onHelpStateChange);
            BC.addEvent(this, EventManager, globalEvent.MENTOR_TASK_CHANGE, this, this.updateRightView, [false]);
            BC.addEvent(this, EventManager, globalEvent.MENTOR_STUEND_LIST_CHANGE, this, this.onIdentifyChange);
            BC.addEvent(this, EventManager, globalEvent.MENTOR_APPLY_LIST_CHANGE, this, this.updateApplyRed);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._graducatePanel?.destroy();
            this._applyPanel?.destroy();
            super.destroy();
        }
    }
}