namespace aliceParadise {
    export class AliceParadiseModel implements clientCore.BaseModel {
        /**规则 id*/
        public readonly ruleId: number = 1176;
        /**套装id */
        public readonly suitId: number = 2110404;
        /**舞台id */
        public readonly stageId: number = 1000114;
        /**奖励状态 */
        public rewardStatus: number;
        /**任务信息 */
        public taskInfo: xls.taskData[];
        /**任务状态 */
        public taskStatus: pb.ITask[];

        /**获取任务配置信息 */
        public creatTaskInfo(): void {
            let sort: number[] = [10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009];
            this.taskStatus = clientCore.TaskManager.getAliceParadiseTaskInfo();
            this.taskStatus.sort((a: pb.ITask, b: pb.ITask) => {
                return sort.indexOf(a.taskid) - sort.indexOf(b.taskid);
            })
            this.taskInfo = _.filter(xls.get(xls.taskData).getValues(), (o) => {
                return o.type == 10
            });
            this.taskInfo.sort((a: xls.taskData, b: xls.taskData) => {
                return sort.indexOf(a.task_id) - sort.indexOf(b.task_id);
            });
        }

        /**所有目标是否都已经达到*/
        public isAllTaskDone(): Boolean {
            let itemState: pb.ITask;
            let itemInfo: xls.taskData;
            for (let i: number = 0, j: number = this.taskInfo.length; i < j; i++) {
                itemInfo = this.taskInfo[i];
                itemState = this.taskStatus[i];
                if (itemState.step < itemInfo.task_condition.v3) {
                    return false;
                }
            }
            return true;
        }

        /** 检查领奖*/
        public checkReward(step: number): boolean {
            return util.getBit(this.rewardStatus, step) == 1;
        }

        public dispose(): void {
            this.taskInfo = null;
            this.taskStatus = null;
        }
    }
}
