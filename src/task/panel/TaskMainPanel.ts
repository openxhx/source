namespace task {
    import STATE = clientCore.TASK_STATE;
    export class TaskMainPanel {
        private ui: ui.task.panel.MainTaskPanelUI;
        private _curShowTaskList: pb.ITask[];
        constructor(panel: ui.task.panel.MainTaskPanelUI) {
            this.ui = panel;
            this.ui.mcMainTaskList.itemRender = MainTaskRender;
            this.ui.mcMainTaskList.mouseHandler = new Laya.Handler(this, this.taskSelectHandler);
            this.ui.mcMainTaskList.vScrollBarSkin = null;
            this.ui.mcMainTaskList.scrollBar.elasticBackTime = 200;//设置橡皮筋回弹时间。单位为毫秒。
            this.ui.mcMainTaskList.scrollBar.elasticDistance = 50;//设置橡皮筋极限距离。
            this.showTaskList();
            EventManager.on(globalEvent.TASK_STATE_CHANGE, this, this.showTaskList);

            if (clientCore.GuideMainManager.instance.isGuideAction) {
                this.ui.mcMainTaskList.scrollBar.touchScrollEnable = false;
            }
        }

        private showTaskList() {
            let mainTaskArr = clientCore.TaskManager.getMainTalkInfo();
            let branchTaskArr = clientCore.TaskManager.getBranchTalkInfo();
            //主线任务只显示一个 支线任务
            this._curShowTaskList = _.compact(_.concat([mainTaskArr[0]], branchTaskArr));
            //分拣任务 过滤已经领过奖励的
            this._curShowTaskList = _.filter(this._curShowTaskList, (task) => {
                if (task.state < STATE.REWARDED)
                    return task;
            })
            //优先级： 完成未领奖 初始状态 已接受 已领奖 剩下的按id排
            this._curShowTaskList = _.sortBy(this._curShowTaskList, (o) => {
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
            this.ui.mcMainTaskList.dataSource = this._curShowTaskList;
        }

        private taskSelectHandler(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let info = this._curShowTaskList[index];
                //点击按钮
                if (info.state == STATE.INIT) {
                    //进入接任务流程
                    console.log("开始接任务了！");
                    clientCore.TaskManager.playAction(info.taskid, "start", false);
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickTaskModuleAcceptTask") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                }
                else if (e.target.name == "btnGo") {
                    if (info.state == STATE.ACCEPT) {
                        let xlsInfo = xls.get(xls.taskData).get(info.taskid);
                        EventManager.event(TaskEvent.GO_TASK_MODULE, [xlsInfo.system_interface,xlsInfo.task_condition.v2]);
                        if(clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickGonowBtn"){
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                    }
                    else if (info.state == STATE.COMPLETE) {

                        clientCore.TaskManager.playAction(info.taskid, "end", false);
                    }

                }
                else {
                    //点击任务栏(要么触发接任务 要么察看详情)
                    if (clientCore.GuideMainManager.instance.isGuideAction) {
                        return;
                    }
                    EventManager.event(TaskEvent.OPEN_DETAIL, info);
                }
            }
        }

        show() {
            this.ui.visible = true;
        }

        hide() {
            this.ui.visible = false;
        }
        getBtnGetReward(taskID: number) {
            this.ui.mcMainTaskList.scrollBar.touchScrollEnable = false;
            if (taskID == 0) {
                return {cell:this.ui.mcMainTaskList.getCell(0),guideRealTarget:this.ui.mcMainTaskList.getCell(0).getChildByName("btnGo")};
            }
            let taskArr: pb.ITask[] = this.ui.mcMainTaskList.array;
            for (let i = 0; i < taskArr.length; i++) {
                if (taskArr[i].taskid == taskID) {
                    return {cell:this.ui.mcMainTaskList.getCell(i),guideRealTarget:this.ui.mcMainTaskList.getCell(i).getChildByName("btnGo")};
                }
            }
        }
        destory() {
            this.ui = null;
            EventManager.off(globalEvent.TASK_STATE_CHANGE, this, this.showTaskList);
        }
    }
}