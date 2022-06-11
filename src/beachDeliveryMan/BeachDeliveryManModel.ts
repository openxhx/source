namespace beachDeliveryMan {
    export class BeachDeliveryManModel implements clientCore.BaseModel {
        /**规则Id*/
        public readonly RULE_ID: number = 1157;
        public readonly G_CURENCY: Array<number> = [9900198, 9900002];
        public readonly SUIT_ID: number = 2110441;
        //任务Id号
        public readonly TASK_IDS: number[] = [16001, 16002, 16003, 16004, 16005, 16006, 16007, 16008];
        public readonly TASK_ID_OFF: number;
        public readonly TASK_NAMES: string[] = ["露露", "露莎", "露娜", "爱德文", "安德鲁", "黛薇薇", "库库鲁", "芬妮"];
        public readonly SHENYE_ORDER_NUM: number[] = [9900002, 100];
        public readonly FRUIT_MONEY_ID: number = 9900198;
        //每日上限
        public readonly EVERYDAY_LIMITUP: number = 200;
        public readonly ACTIVITY_TIMES: string[] = ["2021-7-16 00:00:00", "2021-7-29 23:59:00"];

        //#region 主面板
        public sign_in_flag: number;
        public today_fruit_cut: number;
        //#endregion

        constructor() {
            this.TASK_ID_OFF = this.TASK_IDS[0] - 1;
            // const cfg: xls.itemBag = xls.get(xls.itemBag).get(this.FRUIT_MONEY_ID);
            // this.EVERYDAY_LIMITUP = cfg.dailyMax;
            const ecCfg: xls.eventControl = xls.get(xls.eventControl).get(168);
            const eventTime: string = ecCfg.eventTime;//获取活动时间
            if (eventTime != null && eventTime.indexOf("_") > 0) {
                this.ACTIVITY_TIMES = eventTime.trim().split("_");
            }
        }

        //获取任务信息
        public getTaskData(): Array<pb.ITask> {
            let results: Array<pb.ITask> = [];
            let cell: pb.ITask;
            this.TASK_IDS.forEach(id => {
                cell = clientCore.TaskManager.getTaskById(id);
                results.push(cell);
            });
            return results;
        }
        /**
         * 获取本活动的状态
         */
        public getActivitystate(now: number = null): BeachActivityTime {
            now == null && (now = clientCore.ServerManager.curServerTime);//获取服务器时间
            const start: number = util.TimeUtil.formatTimeStrToSec(this.ACTIVITY_TIMES[0]);
            if (now < start) {
                return BeachActivityTime.none_start;
            }
            const end: number = util.TimeUtil.formatTimeStrToSec(this.ACTIVITY_TIMES[1]);
            if (now > end) {
                return BeachActivityTime.finished;
            }
            return BeachActivityTime.inner_doing;
        }

        public dispose(): void {

        }
    }
}