namespace nightRefine{
    export class NightRefineModel implements clientCore.BaseModel{

        readonly ACTIVITY_ID: number = 154;
        readonly MODULE_ID: number = 272;
        readonly ITEM_ID: number = 9900173;
        readonly SUIT_ID: number = 2110307;
        readonly RULE_ID: number = 1174;
        readonly MAX_PRO: number = 50; //最大生产数
        readonly BASE_TASK: number = 17000;

        /** 上一次领取黑魔粉时间*/
        public gettime: number;
        /** 挑战次数*/
        public fighttimes: number;
        
        get tasks(): pb.ITask[] {
            return clientCore.TaskManager.getRefineTaskInfo();
        }

        initMsg(msg: pb.sc_night_and_alchemy_panel): void{
            this.gettime = msg.powderTimes || util.TimeUtil.formatTimeStrToSec(xls.get(xls.eventControl).get(this.ACTIVITY_ID).eventTime.split('_')[0]);
            this.fighttimes = msg.fightTimes;
        }

        checkStatus(index: number): number{
            let id: number = this.BASE_TASK + index;
            return _.find(this.tasks, (element: pb.ITask)=>{ return element.taskid == id; }).state;
        }

        getTask(id: number): pb.ITask{
            return _.find(this.tasks,(element: pb.ITask)=>{ return element.taskid == id; })
        }

        dispose(): void{
        }
    }
}