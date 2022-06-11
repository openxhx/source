namespace clientCore {
    export enum TASK_TYPE {
        /**主线任务 */
        MAIN = 1,
        /**支线任务 */
        BRANCH = 2,
        /**日常任务 */
        DAILY = 3,
        /** 活跃值（当做任务来配了） */
        ACTIVE = 4,
        /** 扩建任务 */
        EXPAND = 6,
        /**导师任务 */
        MENTOR = 9,
        /** 桃源花涧 */
        PEACH = 10,
        /**花缘任务 */
        CP = 11,
        /** 星夜摇光*/
        STARRY = 12,
        /**中秋话剧阵营 */
        OPERA_SIDE = 13,
        /** 碧星的宝藏*/
        EARTH_PERCIOUS = 15,
        /** 夜的炼成术*/
        NIGHT_REFINE = 17,
        /**爱丽丝的乐园*/
        AILICE_PARADISE = 10
    }
    export enum TASK_STATE {
        /**初始状态 */
        INIT,
        /**已接受 */
        ACCEPT,
        /**已完成 */
        COMPLETE,
        /**已领奖 */
        REWARDED
    }
    export class TaskManager {
        private static _allTask: pb.ITask[];
        private static _curActionTaskID: number;
        private static _curActionTaskType: string;
        private static _xlsTask: util.HashMap<xls.taskData>;
        static _needOPenModAfter: boolean;

        public static setUp() {
            this._xlsTask = xls.get(xls.taskData);
            net.listen(pb.sc_notify_task_state, this, this.taskStateChange);
            this.getAllTaskInfo();
        }

        public static getAllTaskInfo() {
            net.sendAndWait(new pb.cs_get_task_info())
                .then((data: pb.sc_get_task_info) => {
                    this._allTask = data.tasks;
                    this._allTask = _.uniqBy(this._allTask, 'taskid');
                    EventManager.event(globalEvent.TASK_STATE_CHANGE);
                });
        }

        public static getTaskById(id: number) {
            return _.find(this._allTask, (o) => {
                return o.taskid == id
            });
        }

        private static taskStateChange(data: pb.sc_notify_task_state) {
            this._allTask = data.visibleTasks;
            EventManager.event(globalEvent.TASK_STATE_CHANGE);

            if (data.curAcceptTaskId > 0) {
                let actionInfo = xls.get(xls.taskData).get(data.curAcceptTaskId).task_talk;
                TaskActionControl.playAction(actionInfo, this, this.autoAcceptActionPlayComplete);
            }
            else {
                this.autoAcceptActionPlayComplete();
            }
        }

        private static autoAcceptActionPlayComplete() {
            if (GuideMainManager.instance.curGuideInfo.showMaskBehavior == "taskAcceptAnimatePlayOver") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        /**获取主要任务列表（主线和支线） */
        public static getMainTalkInfo(): pb.ITask[] {
            if (!this._allTask)
                return [];
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.MAIN)
                    return t;
            })
        }

        /**获取主要任务列表（主线和支线） */
        public static getBranchTalkInfo(): pb.ITask[] {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.BRANCH)
                    return t;
            })
        }

        /**获取日常任务列表 */
        public static getDailyTaskInfo(): pb.ITask[] {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.DAILY)
                    return t;
            })
        }

        /**获取扩建任务 */
        public static getExpandTaskById(id: number): pb.ITask {
            return _.find(this._allTask, { taskid: id });
        }

        /**获取活跃度任务 */
        public static getActiveTaskInfo(): pb.ITask[] {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.ACTIVE)
                    return t;
            })
        }

        /**获取导师任务 */
        public static getMentorTaskInfo() {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.MENTOR)
                    return t;
            })
        }

        /** 获取桃源花涧任务*/
        public static getPeachTaskInfo(): pb.ITask[] {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.PEACH)
                    return t;
            })
        }

        /** 获取星夜摇光任务*/
        public static getStarryTaskInfo(): pb.ITask[] {
            return _.filter(this._allTask, (t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.STARRY)
                    return t;
            })
        }

        /** 获取花仙乐园的任务*/
        public static playgroundTask(taskId: number): pb.ITask {
            return _.filter(this._allTask, (ele) => {
                return ele.taskid == taskId;
            })[0];
        }

        /**获取花缘任务 */
        public static getCpTaskInfo() {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.CP)
                    return t;
            })
        }

        /**获取中秋阵营任务 */
        public static getOperaSideTaskInfo() {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.OPERA_SIDE)
                    return t;
            })
        }

        /** 获取碧星的宝藏任务*/
        public static getEarthPerciousTaskInfo(): pb.ITask[] {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.EARTH_PERCIOUS)
                    return t;
            })
        }

        /** 获取夜的炼成术任务*/
        public static getRefineTaskInfo(): pb.ITask[] {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.NIGHT_REFINE)
                    return t;
            })
        }

        /** 获取爱丽丝的乐园任务*/
        public static getAliceParadiseTaskInfo(): pb.ITask[] {
            return _.sortBy(this._allTask, 'taskid').filter((t) => {
                if (this._xlsTask.get(t.taskid).type == TASK_TYPE.AILICE_PARADISE)
                    return t;
            })
        }

        /**
         * 获取活跃值相关信息
         * now:当前活跃值
         * total：总共需要活跃值
         * rwdInfo：奖励阶段数据内部为{taskid:任务id  point：需要的活跃值 hasRewarded：是否已领取}
         */
        public static get activeInfo(): { now: number, total: number, rwdInfo: Array<{ taskid: number, point: number, hasRewarded: boolean, rewards: xls.pair[], items: xls.triple[] }> } {
            let rtn = {
                now: 0,
                total: 0,
                rwdInfo: []
            };
            let activeTaskInfos = this.getActiveTaskInfo();
            let laskTask = _.last(activeTaskInfos);
            if (!laskTask) {
                console.warn('没有活跃值任务！');
                return;
            }
            rtn.now = laskTask.step;
            rtn.total = this._xlsTask.get(laskTask.taskid).task_condition.v3;

            for (const task of activeTaskInfos) {
                let xlsInfo = this._xlsTask.get(task.taskid);
                let rwdInfo = { taskid: 0, point: 0, hasRewarded: false, rewards: [], items: [] };
                rwdInfo.taskid = task.taskid;
                rwdInfo.point = xlsInfo.task_condition.v3;
                rwdInfo.hasRewarded = task.state == TASK_STATE.REWARDED;
                rwdInfo.rewards = xlsInfo.f_others_award;
                rwdInfo.items = xlsInfo.activityItem;
                rtn.rwdInfo.push(rwdInfo);
            }
            return rtn;
        }

        public static playAction(taskID: number, type: "start" | "end", needOPenModAfter: boolean = true) {
            this._curActionTaskID = taskID;
            this._curActionTaskType = type;
            this._needOPenModAfter = needOPenModAfter;
            let actionInfo = type == "start" ? xls.get(xls.taskData).get(taskID).task_talk : xls.get(xls.taskData).get(taskID).finish_talk;
            TaskActionControl.playAction(actionInfo, this, this.actionPlayComplete);
        }

        private static actionPlayComplete() {
            if (this._curActionTaskType == "start") {
                net.sendAndWait(new pb.cs_task_finish_interactive({ taskid: this._curActionTaskID }))
                    .then(() => {
                        if (this._needOPenModAfter)
                            ModuleManager.open("task.TaskModule");
                        if (this._curActionTaskID == 1 && GuideMainManager.instance.curGuideInfo.showMaskBehavior == "taskAcceptSucc") {
                            // EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                    });
            }
            else {
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "getTaskReward") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
                net.sendAndWait(new pb.cs_get_task_reward({ taskid: this._curActionTaskID }))
                    .then((data: pb.sc_get_task_reward) => {
                        // _.remove(this._allTask, { taskid: this._curActionTaskID })
                        if (clientCore.GuideMainManager.instance.isGuideAction)
                            for (let i = 0; i < data.items.length; i++) {
                                alert.showFWords("恭喜获得 " + ItemsInfo.getItemName(data.items[i].id) + " x" + data.items[i].cnt);
                            }
                        else
                            alert.showReward(GoodsInfo.createArray(data.items as pb.Item[]));
                        util.RedPoint.reqRedPointRefreshArr([2501, 2502]);
                        EventManager.event(globalEvent.TASK_GET_REWARD);
                        if (this._curActionTaskID == 1033) {
                            clientCore.PartyManager.openFlag = true;
                            clientCore.PartyManager.openGuideFlag = true;
                            clientCore.GuideMainManager.instance.checkGuideByStageComplete(99998);
                        }
                        if (this._curActionTaskID == 1034) {
                            clientCore.RestaurantManager.openFlag = true;
                            clientCore.RestaurantManager.openGuideFlag = true;
                            clientCore.GuideMainManager.instance.checkGuideByStageComplete(99997);
                        }
                    });
            }
        }

        /**领取活跃度奖励 */
        static getActiveReward(id: number) {
            net.sendAndWait(new pb.cs_get_task_reward({ taskid: id }))
                .then((data: pb.sc_get_task_reward) => {
                    //任务完成了 从任务列表里删除(活跃度任务不需要删除)
                    _.find(TaskManager._allTask, { taskid: id }).state = TASK_STATE.REWARDED;
                    alert.showReward(GoodsInfo.createArray(data.items as pb.Item[]), "活跃度奖励");
                    util.RedPoint.reqRedPointRefresh(2502);
                    if (!clientCore.SystemOpenManager.ins.checkActOver(67)) {
                        util.RedPoint.reqRedPointRefresh(15001);
                    }
                    EventManager.event(globalEvent.TASK_STATE_CHANGE);
                });
        }

        /**领取导师系统的任务奖励 */
        static getMentorTaskReward(id: number) {
            return net.sendAndWait(new pb.cs_get_task_reward({ taskid: id }))
                .then((data: pb.sc_get_task_reward) => {
                    //任务完成了 从任务列表里删除(活跃度任务不需要删除)
                    _.find(TaskManager._allTask, { taskid: id }).state = TASK_STATE.REWARDED;
                    alert.showReward(GoodsInfo.createArray(data.items));
                    EventManager.event(globalEvent.TASK_STATE_CHANGE);
                });
        }

        /**领取碧星的宝藏任务奖励 */
        static getEarthTaskReward(id: number): Promise<void> {
            return net.sendAndWait(new pb.cs_get_task_reward({ taskid: id }))
                .then((data: pb.sc_get_task_reward) => {
                    //任务完成了 从任务列表里删除(活跃度任务不需要删除)
                    _.find(TaskManager._allTask, { taskid: id }).state = TASK_STATE.REWARDED;
                    alert.showReward(GoodsInfo.createArray(data.items));
                    EventManager.event(globalEvent.TASK_STATE_CHANGE);
                });
        }

        /**解锁夜的炼成术符文 */
        static getRefine(id: number): Promise<void> {
            return net.sendAndWait(new pb.cs_get_task_reward({ taskid: id }))
                .then(() => {
                    _.find(TaskManager._allTask, { taskid: id }).state = TASK_STATE.REWARDED;
                    EventManager.event(globalEvent.REFINE_TASK_STATE_CHANGE, id);
                });
        }
    }
}