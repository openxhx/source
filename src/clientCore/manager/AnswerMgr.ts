namespace clientCore {
    /**
     * 心有灵夕管理者
     */
    export class AnswerMgr {
        private static _times: number;
        public static open: boolean;
        public static debug: boolean;
        public static source: number;
        public static sureTime: number;
        constructor() { }

        /**
         * 检查是否在活动时间内 策划的意思是写死时间
         */
        static checkActivity(): boolean {
            if (this.debug) return true;
            let ct: number = clientCore.ServerManager.curServerTime;
            let st: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(ct) + ' 18:00');
            let et: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(ct) + ' 22:00');
            return ct >= st && ct <= et;
        }

        static get times(): number {
            if (this.debug) return 1;
            return this._times;
        }

        static set times(value: number) {
            this._times = value;
        }
    }
}