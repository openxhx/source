namespace clientCore {
    /**
     * 春日果园管理者
     */
    export class OrchardMgr {
        public static open: boolean;
        public static start: boolean;
        constructor() { }

        /**
         * 检查是否在活动时间内 策划的意思是写死时间
         */
        static checkActivity(): boolean {
            let now: number = clientCore.ServerManager.curServerTime;
            let day: string = util.TimeUtil.formatDate(now);
            let st: number = util.TimeUtil.formatTimeStrToSec(day + ' 10:00:00');
            let et: number = util.TimeUtil.formatTimeStrToSec(day + ' 22:00:00');
            return now >= st && now <= et;
        }
    }
}