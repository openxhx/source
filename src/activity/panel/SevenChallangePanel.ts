
namespace activity {
    import TASK_STATE = clientCore.TASK_STATE;
    export class SevenChallangePanel extends ActivityBasePanel<ui.activity.panel.SevenChallangeUI> {
        private _nowDay: number;
        private _startTime: number;
        private _timeInfo: xls.pair;
        private _canAct: boolean;
        private _canGetReward: boolean;
        init() {
            this.ui.listDay.renderHandler = new Laya.Handler(this, this.onDayRender);
            this.ui.listDay.mouseHandler = new Laya.Handler(this, this.onDayMouse);
            this.ui.listDay.selectHandler = new Laya.Handler(this, this.onDaySelect);
            this.ui.listDay.hScrollBarSkin = "";
            this.ui.listTask.vScrollBarSkin = null;
            this.ui.listTask.renderHandler = new Laya.Handler(this, this.onTaskRender);
            this.ui.listTask.mouseHandler = new Laya.Handler(this, this.onTaskMouse);
            this.addPreLoad(net.sendAndWait(new pb.cs_get_seven_day_accumulate_reward_status()).then((data: pb.sc_get_seven_day_accumulate_reward_status) => {
                this._nowDay = Math.ceil((clientCore.ServerManager.curServerTime - data.startTime) / 86400) - 1;
                this._nowDay = _.clamp(this._nowDay, 0, 6);
                this._startTime = data.startTime;
            }));
            this.addPreLoad(xls.load(xls.newbieChallenge));
            this.addPreLoad(xls.load(xls.newbieChallengeReward));
            this.ui.imgTips_0.visible = false;
            this.ui.imgTips_1.visible = false;
        }

        preLoadOver() {
            this.ui.listDay.dataSource = [0, 1, 2, 3, 4, 5, 6];
            this.ui.listDay.selectedIndex = this.ui.listDay.dataSource.indexOf(this._nowDay);
            // this.ui.listDay.startIndex = this.ui.listDay.selectedIndex == 6 ? 1 : 0;
            if (this.ui.listDay.selectedIndex == 6) {
                this.ui.listDay.scrollTo(1);
            }
            this._timeInfo = xls.get(xls.globaltest).get(1).newbieChallengeTime;
            Laya.timer.loop(1000, this, this.onTimer);
            this.onTimer();
            this.onDayPage(0);
            //右下角ui
            let xlsReward = xls.get(xls.newbieChallengeReward);
            let needId = xlsReward.get(1).require.v1;
            this.ui.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(needId);
            let myNum = clientCore.ItemBagManager.getItemNum(needId);
            for (let i = 1; i <= 2; i++) {
                let reward = clientCore.LocalInfo.sex == 1 ? xlsReward.get(i).rewardFemale : xlsReward.get(i).rewardMale;
                let numOk = myNum >= xlsReward.get(i).require.v2;
                if (i == 2) {
                    this.ui['imgIcon_' + (i - 1)].skin = numOk ? 'activity/geted1.png' : clientCore.ItemsInfo.getItemIconUrl(reward.v1);
                }
                if (i == 1) {
                    this.ui.imgSuit.skin = pathConfig.getSuitImg(reward.v1, clientCore.LocalInfo.sex);
                    this.ui.txtSuit.text = clientCore.SuitsInfo.getSuitInfo(reward.v1).suitInfo.name;
                    this.ui['imgIcon_' + (i - 1)].skin = numOk ? 'activity/geted1.png' : 'activity/rewardBox.png';
                    numOk?this.ui['imgIcon_' + (i - 1)].scale(1,1):this.ui['imgIcon_' + (i - 1)].scale(0.7,0.7);
                }
            }
            let progress = _.clamp(myNum / xlsReward.get(2).require.v2, 0, 1);
            this.ui.txtProgress.text = myNum + '/' + xlsReward.get(2).require.v2;
            Laya.timer.frameOnce(10, this, () => {
                if (this.ui) {
                    this.ui.imgMask.x = (progress - 1) * 276;
                }
            })
            this.ui.imgFull.visible = (progress == 1);
        }

        destory(): void {
            this.ui.listTask?.destroy();
            super.destory();
        }

        private onTimer() {
            let actTime = (this._timeInfo.v1 - 1) * 86400 - clientCore.ServerManager.curServerTime + this._startTime;
            let rwdTime = (this._timeInfo.v2 - 1) * 86400 - clientCore.ServerManager.curServerTime + this._startTime;
            this.ui.txtActTime.text = actTime > 0 ? '活动剩余' + util.StringUtils.getTimeStr2(actTime) : '活动已结束';
            this.ui.txtRwdTime.text = rwdTime > 0 ? '领取奖励剩余' + util.StringUtils.getTimeStr2(rwdTime) : '领取奖励已截止';
            this._canAct = actTime > 0;
            this._canGetReward = rwdTime > 0;
            if (actTime <= 0 && rwdTime <= 0) {
                Laya.timer.clear(this, this.onTimer);
            }
        }

        private onDayRender(cell: Laya.Box, idx: number) {
            let clip = cell.getChildByName('clipBg') as Laya.Clip;
            clip.index = this.ui.listDay.selectedIndex == idx ? 1 : 0;
            cell.gray = this._nowDay < idx;
            (cell.getChildByName('imgTitle') as Laya.Image).alpha = cell.gray ? 0.5 : 1;
            (cell.getChildByName('imgTitle') as Laya.Image).skin = `activity/day${idx}.png`;
            if (idx <= this._nowDay) {
                (cell.getChildByName('imgRed') as Laya.Image).visible = this.checkTaskHaveRewardByDay(idx + 1);
            }
            else {
                (cell.getChildByName('imgRed') as Laya.Image).visible = false;
            }
        }

        private checkTaskHaveRewardByDay(day: number) {
            let xlsReward = xls.get(xls.newbieChallenge).get(day);
            return _.filter(xlsReward.taskId, (taskId) => {
                let taskInfo = clientCore.TaskManager.getTaskById(taskId);
                if (taskInfo) {
                    return taskInfo.state == TASK_STATE.COMPLETE;
                }
                return false
            }).length > 0;
        }

        private onDayMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                this.ui.listDay.selectedIndex = idx;
            }
        }

        private onDaySelect(idx: number) {
            let xlsInfo = xls.get(xls.newbieChallenge);
            let tasks = xlsInfo.get(idx + 1).taskId;
            tasks = _.filter(tasks, (id) => {
                return xls.get(xls.taskData).has(id);
            })
            this.ui.listTask.dataSource = _.sortBy(tasks, (id) => {
                let taskInfo = clientCore.TaskManager.getTaskById(id);
                if (!taskInfo)
                    return 1;
                else
                    return taskInfo.state == TASK_STATE.COMPLETE ? -2 : 0;
            })
        }

        private onTaskRender(cell: ui.activity.render.SevenRenderUI, idx: number) {
            let taskId = cell.dataSource as number;
            let task = clientCore.TaskManager.getTaskById(taskId);
            let xlsTask = xls.get(xls.taskData).get(taskId);
            if (!xlsTask)
                return;
            let rewards = clientCore.LocalInfo.sex == 1 ? xlsTask.f_others_award : xlsTask.m_others_award;
            cell.txtDes.text = xlsTask.task_target;
            let getRewarded: boolean;
            if (!task) {
                //没有任务信息有两种状态
                cell.btnGet.visible = false;
                if (this.ui.listDay.selectedIndex <= this._nowDay) {
                    //已领取奖励，后台会从任务中删除
                    getRewarded = true;
                    cell.txtProgress.text = xlsTask.task_condition.v3 + '/' + xlsTask.task_condition.v3;
                }
                else {
                    //还没解锁的任务,隐藏按钮
                    getRewarded = false;
                    cell.txtProgress.text = '0/' + xlsTask.task_condition.v3;
                }
            }
            else {
                getRewarded = task.state == TASK_STATE.REWARDED;
                cell.txtProgress.text = task.step + '/' + xlsTask.task_condition.v3;
                cell.btnGet.visible = !getRewarded;
                cell.btnGet.fontSkin = task.state == TASK_STATE.ACCEPT ? 'commonBtn/T_p_go.png' : 'commonBtn/l_p_get.png';
                cell.btnGet.skin = task.state == TASK_STATE.ACCEPT ? 'commonBtn/btn_l_purple.png' : 'commonBtn/btn_l_p.png';
                cell.btnGet.disabled = false;
                if (task.state == TASK_STATE.ACCEPT) {
                    cell.btnGet.disabled = !this._canAct;
                }
            }
            cell.imgGet.visible = getRewarded;
            cell.list.dataSource = _.map(rewards, (o) => {
                return {
                    id: o.v1,
                    ico: { skin: clientCore.ItemsInfo.getItemIconUrl(o.v1) },
                    imgBg: { skin: clientCore.ItemsInfo.getItemIconBg(o.v1) },
                    num: { value: o.v2.toString() },
                    imgGet: { visible: getRewarded }
                }
            });
            if (!cell.list.mouseHandler)
                cell.list.mouseHandler = new Laya.Handler(this, this.onItemMouse);
        }
        private onItemMouse(e: Laya.Event) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.currentTarget, { id: e.currentTarget['dataSource'].id })
            }
        }

        private onTaskMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == 'btnGet') {
                    let taskId = this.ui.listTask.getItem(idx);
                    let task = clientCore.TaskManager.getTaskById(taskId);
                    let xlsTask = xls.get(xls.taskData).get(taskId);
                    if (task.state == TASK_STATE.ACCEPT) {
                        if (this._canAct)
                            clientCore.ToolTip.gotoMod(xlsTask.system_interface);
                        else
                            alert.showFWords('活动已结束')
                    }
                    if (task.state == TASK_STATE.COMPLETE) {
                        if (this._canGetReward)
                            clientCore.TaskManager.playAction(taskId, 'end', false)
                        else
                            alert.showFWords('已超出领奖时间')
                    }
                }
            }
        }

        private onDayPage(p: number) {
            if (p == -1) {
                // this.ui.listDay.startIndex = 0;
                this.ui.listDay.scrollTo(0);
            }
            if (p == 1) {
                this.ui.listDay.scrollTo(1);
                // this.ui.listDay.startIndex = 1;
            }
            this.ui.btnPrev.visible = this.ui.listDay.startIndex == 1;
            this.ui.btnNext.visible = this.ui.listDay.startIndex == 0;
        }

        private onMouseUp() {
            for (let i = 0; i < 2; i++) {
                this.ui["imgTips_" + i].visible = false;
            }
        }
        private onMouseDown(index: number) {
            this.ui["imgTips_" + index].visible = true;
        }

        private onTaskChange() {
            this.onDaySelect(this.ui.listDay.selectedIndex);
            this.ui.listTask.startIndex = this.ui.listTask.startIndex;
            this.ui.listDay.startIndex = this.ui.listDay.startIndex;
            util.RedPoint.reqRedPointRefresh(3304);
            let xlsReward = xls.get(xls.newbieChallengeReward);
            let needId = xlsReward.get(1).require.v1;
            let myNum = clientCore.ItemBagManager.getItemNum(needId);
            this.ui.txtProgress.text = myNum + '/' + xlsReward.get(2).require.v2;
            let progress = _.clamp(myNum / xlsReward.get(2).require.v2, 0, 1);
            this.ui.imgMask.x = (progress - 1) * 276;
            this.ui.imgFull.visible = (progress == 1);
        }

        addEvent() {
            // BC.addEvent(this, this.ui.btnPrev, Laya.Event.CLICK, this, this.onDayPage, [-1]);
            // BC.addEvent(this, this.ui.btnNext, Laya.Event.CLICK, this, this.onDayPage, [1]);
            BC.addEvent(this, Laya.stage, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            for (let i = 0; i < 2; i++) {
                BC.addEvent(this, this.ui["imgIcon_" + i], Laya.Event.MOUSE_DOWN, this, this.onMouseDown, [i])
            }
            BC.addEvent(this, EventManager, globalEvent.TASK_STATE_CHANGE, this, this.onTaskChange);

            BC.addEvent(this, this.ui.listDay.scrollBar, Laya.Event.END, this, this.onListScorllCom);
        }

        private onListScorllCom() {
            this.ui.btnPrev.visible = this.ui.listDay.startIndex == 1;
            this.ui.btnNext.visible = this.ui.listDay.startIndex == 0;
        }

        removeEvent() {
            BC.removeEvent(this);
            BC.removeEvent(this, EventManager, globalEvent.TASK_STATE_CHANGE, this, this.onTaskChange);
            Laya.timer.clear(this, this.onTimer);
        }
    }
}