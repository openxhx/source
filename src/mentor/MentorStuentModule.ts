namespace mentor {
    /**
     * 导师系统-学生面板
     * mentor.MentorStuentModule
     */
    export class MentorStuentModule extends ui.mentor.MentorStudentModuleUI {
        private _targetPanel: MentorTargetPanel;
        private _helpPanel: MentorHelpPanel;
        private _applyPanel: MentorApplyPanel;
        private _person: clientCore.Person;
        init(d: any) {
            super.init(d);
            this.addPreLoad(xls.load(xls.tutorSupply));
            this.listTask.renderHandler = new Laya.Handler(this, this.onListRender);
            if (clientCore.MentorManager.identity == clientCore.MENTOR_IDENTITY.STUDENT) {
                let teacherUid = clientCore.MentorManager.teacher.teacherInfo?.uid;
                if (teacherUid)
                    clientCore.UserInfoDataBase.reqUserInfo([teacherUid], true);
            }
        }

        onPreloadOver() {
            this.updateApplyRed();
            this.updateView();
            this.updateTaskList();
            clientCore.Logger.sendLog('活动', '导师计划', '打开活动面板')
        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitMentorStudentOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private async updateTeacherUserInfoView() {
            let teacherUid = clientCore.MentorManager.teacher.teacherInfo.uid;
            await clientCore.UserInfoDataBase.reqUserInfo([teacherUid]);
            let teacherUserInfo = clientCore.UserInfoDataBase.getUserInfo(teacherUid);
            if (teacherUserInfo && this.txtTeacherLv) {
                this.txtTeacherLv.text = clientCore.LocalInfo.parseLvInfoByExp(teacherUserInfo.exp).lv.toString();
                this.txtTeacherName.text = teacherUserInfo.nick;
                //48h内不能删除
                this.btnCutOff.gray = teacherUserInfo.olLast != 0 && (clientCore.ServerManager.curServerTime - teacherUserInfo.olLast) < 172800;
                //人物形象
                if (this._person) {
                    if (this._person.sex != teacherUserInfo.sex) {
                        this._person.destroy();
                        this._person = new clientCore.Person(teacherUserInfo.sex, teacherUserInfo.curClothes);
                        this._person.scale(-0.65, 0.65)
                        this.spCon.addChild(this._person);
                    }
                    else
                        this._person.replaceByIdArr(teacherUserInfo.curClothes);
                }
                else {
                    this._person = new clientCore.Person(teacherUserInfo.sex, teacherUserInfo.curClothes);
                    this._person.scale(-0.65, 0.65)
                    this.spCon.addChild(this._person);
                }
            }
        }

        private updateTaskRed() {
            let taskarr = clientCore.TaskManager.getMentorTaskInfo();
            this.imgTaskRed.visible = _.filter(taskarr, t => t.state == clientCore.TASK_STATE.COMPLETE).length > 0;
        }

        private updateView() {
            let identity = clientCore.MentorManager.identity;
            this.btnHistory.visible = identity == clientCore.MENTOR_IDENTITY.NONE && clientCore.MentorConst.checkCanStudentByLv();
            this.boxTeacher.visible = identity == clientCore.MENTOR_IDENTITY.STUDENT;
            this.boxNoTeacher.visible = identity == clientCore.MENTOR_IDENTITY.NONE;
            this.btnAllTarget.disabled = identity == clientCore.MENTOR_IDENTITY.NONE;
            this.imgTaskRed.visible = false;
            if (identity == clientCore.MENTOR_IDENTITY.STUDENT) {
                let teacherInfo = clientCore.MentorManager.teacher.teacherInfo;
                //我是个学生
                this.imgRat.scale(1, 1);
                this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
                this.clipTag.index = 0;
                let grow = teacherInfo.growPoint;
                let lvInfo = clientCore.MentorConst.parseLvByGrow(grow);
                this.txtExp.text = lvInfo.currExp.toString();
                this.txtTotelExp.text = '/' + lvInfo.totalExp;
                this.clipTag.index = lvInfo.lv;
                this.imgProgress.width = this.imgProgressBg.width * lvInfo.currExp / lvInfo.totalExp;
                this.btnAdd.visible = clientCore.FriendManager.instance.getFriendInfoById(teacherInfo.uid) == null;
                this.updateTeacherUserInfoView();
                this.updateTaskRed();
                //求助状态
                switch (teacherInfo.helpState) {
                    case clientCore.MENTOR_HELP_STATE.NO_HELP:
                        this.txtRatTalk.text = '每天都可以向导师\n请求一次物资哟！';
                        this.imgItemState.skin = 'mentor/reqItem.png';
                        break;
                    case clientCore.MENTOR_HELP_STATE.WAITTING:
                        this.txtRatTalk.text = '每天都可以向导师\n请求一次物资哟！';
                        this.imgItemState.skin = 'mentor/waitItem.png';
                        break;
                    case clientCore.MENTOR_HELP_STATE.HELP_OVER:
                        this.txtRatTalk.text = '导师的物资到了\n别忘了领取';
                        this.imgItemState.skin = 'mentor/teacherPay.png';
                        break;
                    case clientCore.MENTOR_HELP_STATE.REWARD:
                        this.txtRatTalk.text = '今天的求助完成\n明天再来吧！';
                        this.imgItemState.skin = 'mentor/studentGet.png';
                        break;
                    default:
                        break;
                }
                this.imgRat.scale(1, 1);
                this.updateTaskList();
            }
            if (identity == clientCore.MENTOR_IDENTITY.NONE) {
                //还没有老师
                this.listTask.visible = false;
                this.imgRightTitle.visible = true;
                this.txtTask.text = '快去找个导师吧！';
                this.txtRatTalk.text = '导师可以每天送你物资哟！';
                this.imgItemState.skin = 'mentor/noTeacher.png';
                this.imgRat.scale(0.84, 0.84);
            }
        }

        private updateTaskList() {
            let arr = _.compact(clientCore.TaskManager.getMentorTaskInfo()).sort((a, b) => {
                return a.state - b.state;
            })
            this.listTask.dataSource = arr.slice(0, 3);
            if (clientCore.MentorManager.identity == clientCore.MENTOR_IDENTITY.STUDENT) {
                //任务状态
                this.imgRightTitle.visible = _.filter(clientCore.TaskManager.getMentorTaskInfo(), o => o.state != clientCore.TASK_STATE.REWARDED).length == 0;
                this.txtTask.text = '导师给的任务都完成啦！';
                this.listTask.visible = !this.imgRightTitle.visible;
            }
        }

        private onListRender(cell: ui.mentor.render.MentorTaskListRenderUI, idx: number) {
            let taskInfo = cell.dataSource as pb.ITask;
            let xlsInfo = xls.get(xls.taskData).get(taskInfo.taskid);
            cell.txtDetail.text = xlsInfo.task_content;
            cell.txtProgress.style.width = 100;
            cell.txtProgress.style.align = 'right';
            cell.txtProgress.style.font = '汉仪中圆简';
            cell.txtProgress.style.fontSize = 24;
            cell.txtProgress.visible = false;
            if (taskInfo) {
                cell.imgComplete.visible = taskInfo.state == clientCore.TASK_STATE.REWARDED || taskInfo.state == clientCore.TASK_STATE.COMPLETE;
                cell.imgComplete.skin = taskInfo.state == clientCore.TASK_STATE.REWARDED ? 'mentor/stateComplete.png' : 'mentor/imgGou.png';
                let totalStep = xlsInfo.task_condition.v3;
                cell.txtProgress.visible = !cell.imgComplete.visible;
                let color = taskInfo.step >= totalStep ? '#805329' : '#fa7279';
                cell.txtProgress.innerHTML = util.StringUtils.getColorText2([
                    Math.min(taskInfo.step, totalStep).toString(),
                    color,
                    `/${totalStep}`,
                    '#805329'
                ])
            }
        }

        private onClose() {
            this.destroy();
        }

        private goFindTeacher() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickFindBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this.needOpenMod = 'mentorApply.MentorApplyModule';
            this.destroy();
        }

        private onAllTarget() {
            this._targetPanel = this._targetPanel || new MentorTargetPanel();
            this._targetPanel.show();
        }

        private onItemClick() {
            let teacherInfo = clientCore.MentorManager.teacher.teacherInfo;
            if (teacherInfo) {
                if (teacherInfo.helpState == clientCore.MENTOR_HELP_STATE.NO_HELP) {
                    //选择物品
                    this._helpPanel = this._helpPanel || new MentorHelpPanel();
                    this._helpPanel.show();
                    this._helpPanel.once(Laya.Event.CLOSE, this, this.updateView);
                }
                else if (teacherInfo.helpState == clientCore.MENTOR_HELP_STATE.HELP_OVER) {
                    //领物资
                    clientCore.MentorManager.teacher.getSupplyFromTeacher().then(() => {
                        this.updateView();
                    })
                }
            }
        }

        private onHistory() {
            this._applyPanel = this._applyPanel || new MentorApplyPanel();
            this._applyPanel.show();
        }

        private updateApplyRed() {
            this.imgApplyRed.visible = clientCore.MentorManager.history.getApplyList().length > 0;
        }

        private onCutOff() {
            if (this.btnCutOff.gray)
                alert.showFWords('对方超过48小时未登录后才能断绝关系哟！')
            else
                alert.showSmall('确定要断绝师徒关系吗?', { callBack: { caller: this, funArr: [this.sureCutOff] } })
        }

        private sureCutOff() {
            clientCore.MentorManager.teacher.cutOffOneStudent();
        }

        private onPrivate() {
            if (alert.checkAge(true)) return;
            let teacherUid = clientCore.MentorManager.teacher.teacherInfo.uid;
            let teacherUserInfo = clientCore.UserInfoDataBase.getUserInfo(teacherUid);
            if (teacherUserInfo)
                net.sendAndWait(new pb.cs_query_stranger_chat_flag({ userid: teacherUserInfo.userid })).then((msg: pb.sc_query_stranger_chat_flag) => {
                    if (msg.isFriend == 0 && msg.flag == 0) {
                        alert.showFWords(`${teacherUserInfo.nick}禁止了和陌生人私聊哦~`)
                        return;
                    }
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.DialogMgr.ins.closeAllDialog();
                    clientCore.ModuleManager.open("chat.ChatModule", {
                        chatType: 4,
                        uid: teacherUserInfo.userid,
                        nick: teacherUserInfo.nick,
                        head: teacherUserInfo.headImage,
                        frame: teacherUserInfo.headFrame
                    })
                })
        }

        private onAdd() {
            let teacherUid = clientCore.MentorManager.teacher.teacherInfo.uid;
            clientCore.FriendManager.instance.applyAddFriends([teacherUid]).then((ids) => {
                alert.showFWords("加好友申请发送成功！");
            });
        }

        private onGraducate() {
            this.needOpenMod = 'mentorGraduate.GraduateRewardModule';
            this.destroy();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, () => { alert.showRuleByID(1003); });
            BC.addEvent(this, this.imgGraduate, Laya.Event.CLICK, this, this.onGraducate);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onAdd);
            BC.addEvent(this, this.btnPrivate, Laya.Event.CLICK, this, this.onPrivate);
            BC.addEvent(this, this.btnCutOff, Laya.Event.CLICK, this, this.onCutOff);
            BC.addEvent(this, this.btnHistory, Laya.Event.CLICK, this, this.onHistory);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnFind, Laya.Event.CLICK, this, this.goFindTeacher);
            BC.addEvent(this, this.btnAllTarget, Laya.Event.CLICK, this, this.onAllTarget);
            BC.addEvent(this, this.imgItemState, Laya.Event.CLICK, this, this.onItemClick);
            BC.addEvent(this, EventManager, globalEvent.MENTOR_HELP_CHANGE, this, this.updateView);
            BC.addEvent(this, EventManager, globalEvent.TASK_STATE_CHANGE, this, this.updateView);
            BC.addEvent(this, EventManager, globalEvent.MENTOR_IDENTITY_CHANGE, this, this.updateView);
            BC.addEvent(this, EventManager, globalEvent.MENTOR_APPLY_LIST_CHANGE, this, this.updateApplyRed);
            BC.addEvent(this, EventManager, globalEvent.MENTOR_MY_GROW_CHANGE, this, this.updateView);

            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "mentorStuentModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {

                }
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._applyPanel?.destroy();
            this._helpPanel?.offAll();
            this._helpPanel?.destroy();
            this._targetPanel?.destroy();
            this._person?.destroy();
            super.destroy();
        }
    }
}