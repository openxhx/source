
namespace task {
    import STATE = clientCore.TASK_STATE;
    export class TaskDailyPanel {
        private ui: ui.task.panel.DailyTaskPanelUI;
        private _rwdRenderList: ui.task.render.ActiveRenderUI[];
        private _currProgress: number = -1;
        private _taskList: pb.ITask[];
        constructor(panel: ui.task.panel.DailyTaskPanelUI) {
            this.ui = panel;
            this._rwdRenderList = [];
            this.ui.mcDiaryTaskList.itemRender = DailyTaskRender;
            this.ui.mcDiaryTaskList.mouseHandler = new Laya.Handler(this, this.taskSelectHandler);
            this.ui.mcDiaryTaskList.vScrollBarSkin = null;
            this.ui.mcDiaryTaskList.scrollBar.elasticBackTime = 200;//设置橡皮筋回弹时间。单位为毫秒。
            this.ui.mcDiaryTaskList.scrollBar.elasticDistance = 50;//设置橡皮筋极限距离。
            this.ui.mcActivePanel.visible = false;
            this.ui.listTip.renderHandler = new Laya.Handler(this, this.onTipsRender);
            this.createActiveRwd();
            this.showTaskList();
            EventManager.on(globalEvent.TASK_STATE_CHANGE, this, this.showTaskList);
            BC.addEvent(this, Laya.stage, Laya.Event.MOUSE_UP, this, this.onHideTips);
        }

        private createActiveRwd() {
            let activeInfo = clientCore.TaskManager.activeInfo;
            if (!activeInfo)
                return;
            this.ui.mcActivePanel.visible = true;
            for (let i = 0; i < activeInfo.rwdInfo.length; i++) {
                const info = activeInfo.rwdInfo[i];
                let rwd = new ui.task.render.ActiveRenderUI();
                rwd.x = info.point / activeInfo.total * this.ui.imgProBg.width + this.ui.imgProBg.x;
                rwd.y = this.ui.imgProBg.y;
                rwd.imgBox.skin = `task/clip_treasure${i + 1}.png`;
                this.ui.mcActivePanel.addChild(rwd);
                rwd.on(Laya.Event.CLICK, this, this.onActiveRewardClick, [i]);
                this._rwdRenderList.push(rwd);
            }
        }

        private showTaskList() {
            this._taskList = _.sortBy(clientCore.TaskManager.getDailyTaskInfo(), (o) => {
                let sortScore = 0;
                if (o.state == clientCore.TASK_STATE.COMPLETE) {
                    sortScore -= 40000;
                }
                if (o.state == clientCore.TASK_STATE.INIT) {
                    sortScore -= 30000;
                }
                if (o.state == clientCore.TASK_STATE.ACCEPT) {
                    sortScore -= 20000;
                }
                if (o.state == clientCore.TASK_STATE.REWARDED) {
                    sortScore -= 10000;
                }
                return o.taskid + sortScore;
            });
            this.ui.mcDiaryTaskList.dataSource = this._taskList;
            //活跃度相关
            let activeInfo = clientCore.TaskManager.activeInfo;
            if (!activeInfo)
                return;
            this.ui.txtActive.text = `${activeInfo.now}/${activeInfo.total}`;
            //宝箱状态
            for (let i = 0; i < activeInfo.rwdInfo.length; i++) {
                const info = activeInfo.rwdInfo[i];
                let mc = this._rwdRenderList[i];
                mc.imgBox.index = info.hasRewarded ? 1 : 0;
                if (!info.hasRewarded) {
                    activeInfo.now >= info.point ? mc.ani.play(0, true) : mc.ani.gotoAndStop(0);
                }
                else {
                    mc.ani.gotoAndStop(0);
                }
                BC.addEvent(this, mc, Laya.Event.MOUSE_DOWN, this, this.onShowTips, [mc, i]);
                BC.addEvent(this, mc, Laya.Event.MOUSE_OUT, this, this.onHideTips);
            }
            //进度条
            let tmp = _.clamp((activeInfo.now / activeInfo.total), 0, 1);
            if (this._currProgress == -1) {
                this._currProgress = tmp;
                this.ui.imgProgress.width = this.ui.imgProBg.width * _.clamp((activeInfo.now / activeInfo.total), 0, 1);
            }
            else {
                this._currProgress = tmp;
                Laya.Tween.to(this.ui.imgProgress, { 'width': this.ui.imgProBg.width * this._currProgress }, 500);
            }
        }

        private onActiveRewardClick(idx: number) {
            let info = clientCore.TaskManager.activeInfo.rwdInfo[idx];
            let activeInfo = clientCore.TaskManager.activeInfo;
            if (activeInfo.now >= info.point && !info.hasRewarded) {
                clientCore.TaskManager.getActiveReward(info.taskid);
            }
        }

        private taskSelectHandler(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let info = this._taskList[index];
                let xlsInfo = xls.get(xls.taskData).get(info.taskid);
                //点击按钮
                if (e.target.name == "btnGo") {
                    if (info.state == clientCore.TASK_STATE.ACCEPT) {
                        EventManager.event(TaskEvent.GO_TASK_MODULE, [xlsInfo.system_interface, xlsInfo.task_condition.v2]);
                    }
                    else if (info.state == clientCore.TASK_STATE.COMPLETE) {
                        clientCore.TaskManager.playAction(info.taskid, "end", false);
                    }
                }
                else {
                    //点击任务栏(要么触发接任务 要么察看详情)
                    if (info.state == STATE.INIT) {
                        //进入接任务流程
                        console.log("开始接任务了！");
                        clientCore.TaskManager.playAction(info.taskid, "start", false);
                    }
                    else {
                        // EventManager.event(TaskEvent.OPEN_DETAIL, info);
                    }
                }
            }
        }

        show() {
            this.ui.visible = true;
            this.ui.boxTips.visible = false;
        }



        hide() {
            this.ui.visible = false;
        }

        private onShowTips(mc: Laya.Sprite, idx: number) {
            this.ui.boxTips.visible = true;
            this.ui.boxTips.x = mc.x + this.ui.mcActivePanel.x;
            let rwdInfo = clientCore.TaskManager.activeInfo.rwdInfo[idx];
            let cfg: xls.taskData = xls.get(xls.taskData).get(rwdInfo.taskid);
            let array: xls.pair[] = [];
            if (rwdInfo.items.length > 0) {
                _.forEach(rwdInfo.items, (element) => {
                    //这里是新春活动的特殊处理
                    //需要检查是否在活动时间内
                    if (element.v3 == 10000 && this.checkActivity(119)) {
                    // if (element.v3 == 10000) {
                        let pair: xls.pair = new xls.pair();
                        pair.v1 = element.v1;
                        pair.v2 = element.v2;
                        array.push(pair);
                    }
                })
            }
            array = array.concat(rwdInfo.rewards);
            this.ui.listTip.dataSource = array;
            this.ui.listTip.repeatX = array.length;
            this.ui.imgTipsBg.width = array.length * 93 + (array.length - 1) * 30 + 16;
            this.ui.txtPoint.text = `活跃度到达${rwdInfo.point}领取`;
        }

        private checkActivity(id: number): boolean{
            let now: number = clientCore.ServerManager.curServerTime;
            let cfg: xls.eventControl = xls.get(xls.eventControl).get(id);
            if(!cfg)return false;
            let array: string[] = cfg.eventTime.split('_');
            let st: number = util.TimeUtil.formatTimeStrToSec(array[0]);
            let et: number = util.TimeUtil.formatTimeStrToSec(array[1]);
            return now >= st && now <= et;
        }

        private onHideTips() {
            this.ui.boxTips.visible = false;
        }

        private onTipsRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let data = cell.dataSource as xls.pair;
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.v1);
            cell.num.value = data.v2.toString();
            cell.txtName.visible = true;
            cell.txtName.text = clientCore.ItemsInfo.getItemName(data.v1);
        }

        destory() {
            BC.removeEvent(this);
            EventManager.off(globalEvent.TASK_STATE_CHANGE, this, this.showTaskList);
            this.ui = null;
        }
    }
}