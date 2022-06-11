namespace clientCore {
    /**
     * 好感度任务
     */
    export class FavorTaskMgr {

        /** 好感度任务*/
        public taskMap: util.HashMap<FavorTaskInfo> = new util.HashMap<FavorTaskInfo>();

        constructor() { }

        public addTaskMap(msg: pb.IfavorTask): void {
            let info: FavorTaskInfo = this.taskMap.get(msg.roleid);
            if (!info) {
                info = FavorTaskInfo.create();
                info.init(msg);
                this.taskMap.add(msg.roleid, info);
            } else {
                info.update(msg);
            }
        }

        /** 任务更迭*/
        public updateTaskMap(msg: pb.IfavorTask): void {
            this.addTaskMap(msg);
            EventManager.event(globalEvent.UPDATE_FAVORTASK);
        }

        /** 好感度任务道具更迭*/
        public updateTaskItem(data: pb.sc_favor_task_order_change_notify): void {
            _.forEach(data.changeInfo, (ele: pb.IorderTaskNotify) => {
                let info: FavorTaskInfo = this.taskMap.get(ele.roleid);
                info && info.updateItem(ele.orderInfo);
            })
            EventManager.event(globalEvent.UPDATE_FAVORTASK_ITEM);
        }

        public removeTaskMap(roleId: number): void {
            let info: FavorTaskInfo = this.taskMap.get(roleId);
            info && info.dispose();
            this.taskMap.remove(roleId);
            EventManager.event(globalEvent.UPDATE_FAVORTASK);
        }

        /**
         * 领取任务奖励
         * @param roleId 
         * @param taskId 
         */
        public getTaskReward(roleId: number, taskId: number, complete: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_favor_task_reward({ roleid: roleId, taskid: taskId })).then((msg: pb.sc_get_favor_task_reward) => {
                complete && complete.run();
                let info: FavorTaskInfo = this.getRoleTask(roleId);
                info && info.taskId == taskId && this.removeTaskMap(roleId); //领取了奖励 未更新的任务移除
                ModuleManager.open("favorTask.TaskCompletePanel", { roleId: roleId, taskId: taskId });
            })
        }

        /**
         * 处理一个玩家的好感度任务
         * @param roleId 
         */
        public handlerTask(roleId: number): void {
            let info: FavorTaskInfo = this.getRoleTask(roleId);
            if (!info) {
                alert.showFWords("该角色不存在好感度任务");
                return;
            }
            let mod: string = info.xlsTask.taskType == 2 ? "favorTask.FavorTaskPanel" : "favorTask.FavorPlotPanel";
            ModuleManager.open(mod, info.roleId)
        }

        public getRoleTask(roleId: number): FavorTaskInfo {
            return this.taskMap.get(roleId);
        }

        /**
         * 检查某个角色是否有好感度任务
         * @param roleId 
         */
        public checkHaveTask(roleId: number): boolean {
            return this.taskMap.get(roleId) != null;
        }

        /** 检查是否没有任务了*/
        public checkTaskOver(roleId: number): boolean {
            let info: role.RoleInfo = RoleManager.instance.getRoleById(roleId);
            let task: xls.triple = xls.get(xls.characterId).get(roleId).relationShip[info.faverLv - 1];
            return !task || (info.faver >= task.v1 && task.v3 == 0);
        }

        private static _ins: FavorTaskMgr;
        public static get ins(): FavorTaskMgr {
            return this._ins || (this._ins = new FavorTaskMgr());
        }
    }
}