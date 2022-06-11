namespace odeToJay{
    export class OdeToJayModel implements clientCore.BaseModel{
        /** 任务标记*/
        rewardIdx: number;
        /** 任务*/
        taskMap: pb.ITask[] = clientCore.TaskManager.getPeachTaskInfo();
        /** 是否首次打开*/
        isFristTime: boolean;
        /** 清理游戏次数*/
        cleanTimes: number;
        /** 水果连连看次数*/
        linkTimes: number;
        /** boss挑战次数*/
        bossTimes: number;
        /** 本日是否领奖*/
        hasReward: boolean;

        private OPEN_TIME: number = util.TimeUtil.formatTimeStrToSec('2021/5/7 00:00:00');

        dispose(): void{
            if(this.taskMap) this.taskMap.length = 0;
            this.taskMap = null;
            
        }

        /** 检查领奖*/
        checkReward(step: number): boolean {
            return util.getBit(this.rewardIdx, step) == 1;
        }

        /** 检查阶段 1-5 5是检查都完成了*/
        checkStep(step: number): boolean {
            let len: number = step == 5 ? this.taskMap.length - 1 : step * 2;
            let start: number = step == 5 ? 0 : len - 2;
            for (let i: number = start; i <= len; i++) {
                let element: pb.ITask = this.taskMap[i % 8];
                if (element) {
                    let cls: xls.taskData = xls.get(xls.taskData).get(element.taskid);
                    if (cls && cls.task_condition.v3 > element.step) return false;
                }
            }
            return true;
        }

        /** 检查是否开启*/
        checkOpen(): boolean{
            return clientCore.ServerManager.curServerTime > this.OPEN_TIME;
        }
    }
}