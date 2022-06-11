namespace util {
    export class SystemTimerUtil {
        private static _timerCallbackList: TimerInfo[];
        private static _startSysTime: number;
        private static _preTime: number;
        public static setUp() {
            this._timerCallbackList = [];
            this._preTime = 0;
            Laya.timer.loop(100, this, this.loopAction);
            this._startSysTime = new Date().getTime();
        }
        private static loopAction() {
            let curTime = new Date().getTime();
            let disTime = Math.floor((curTime - this._startSysTime) / 1000);
            if (disTime > this._preTime) {
                this._preTime = disTime;
                this.secondsTimerAction();
            }
        }
        /**
         * 
         */
        private static secondsTimerAction() {
            for (let i = this._timerCallbackList.length - 1; i >= 0; i--) {
                if (this._timerCallbackList[i].stop) {
                    this._timerCallbackList.splice(i, 1);
                }
                else {
                    this._timerCallbackList[i].run();
                }
            }
        }
        public static add(time: number, caller: any, callback: (t?: number) => any, repeat: number = 1) {
            let timerInfo = new TimerInfo();
            timerInfo.totalTime = timerInfo.restTime = time;
            timerInfo.caller = caller;
            timerInfo.callBackFun = callback;
            timerInfo.repeatNum = repeat;
            this._timerCallbackList.push(timerInfo);
        }
        public static remove(caller: any, callback: Function) {
            for (let i = this._timerCallbackList.length - 1; i >= 0; i--) {
                if (this._timerCallbackList[i].caller == caller && this._timerCallbackList[i].callBackFun == callback) {
                    this._timerCallbackList.splice(i, 1);
                }
            }
        }
    }
}