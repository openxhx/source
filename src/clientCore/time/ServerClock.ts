namespace time {

    export class ClockInfo {
        time: string; //每日的启动时间 例如： 15:00:00
        callFunc: Function;
        argv: any;
        constructor() { }
        handler(): void {
            this.callFunc && this.callFunc(this.argv);
        }
    }

    export class DayInfo {
        starttime: string;
        endtime: string;
        callFunc: Function;
        argv: any;
        constructor() { }
        handler(): void {
            this.callFunc && this.callFunc(this.argv);
        }
    }

    export class ServerClock {

        /** 今日需要做的事情*/
        private _dailyTodo: ClockInfo[] = [];
        /** 今日已经完成的事情*/
        private _dailyAffairTodo: ClockInfo[] = [];
        /** 注册的某日事件*/
        private _dayTodo: DayInfo[] = [];

        private _t: GTime;

        private static _instance: ServerClock;
        public static get instance(): ServerClock {
            return this._instance || (this._instance = new ServerClock());
        }

        constructor() {
            this._t = GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTimer);
        }

        startClock(): void {
            this._t.start();
        }

        /**
         * 注册闹钟
         * @param time 每日闹钟响起的时间 例如 15:00:00 
         * @param callfunc 执行函数
         * @param argv 回调参数
         */
        reg(time: string, callfunc: Function, argv?: any): void {
            let info: ClockInfo = new ClockInfo();
            info.callFunc = callfunc;
            info.argv = argv;
            info.time = time;
            this.isTimeOut(info.time) ? this._dailyAffairTodo.push(info) : this._dailyTodo.push(info);
        }

        regEvent(starttime: string, endtime: string, callFunc: Function, argv?: any): void {
            let ret: number = this.eventState(starttime, endtime);
            if (ret == 1) return;
            if (ret == 0) { //立即执行
                callFunc(argv);
                return;
            }
            let info: DayInfo = new DayInfo();
            info.starttime = starttime;
            info.endtime = endtime;
            info.callFunc = callFunc;
            info.argv = argv;
            this._dayTodo.push(info);
        }

        private onTimer(): void {
            //处理日常闹钟
            this.isOverDay() && this.onOverDay();
            let len: number = this._dailyTodo.length;
            let element: ClockInfo;
            for (let i: number = 0; i < len; i++) {
                element = this._dailyTodo[i];
                if (this.isTimeOut(element.time)) {
                    element.handler();
                    this._dailyTodo.splice(i, 1);
                    this._dailyAffairTodo.push(element);
                }
            }
            //处理某日事件
            len = this._dayTodo.length;
            let day: DayInfo;
            for (let i: number = 0; i < len; i++) {
                day = this._dayTodo[i];
                if (this.eventState(day.starttime, day.endtime) == 0) {
                    day.handler();
                    this._dayTodo.splice(i, 1);
                }
            }
        }


        /**
         * 检查时间状态 -1 未到时间 0 时间内 1 时间之外
         * @param starttime 
         * @param endtime 
         */
        private eventState(starttime: string, endtime: string): number {
            let now: number = clientCore.ServerManager.curServerTime;
            let st: number = util.TimeUtil.formatTimeStrToSec(starttime);
            let et: number = util.TimeUtil.formatTimeStrToSec(endtime);
            if (now < st) return -1;
            if (now >= st && now <= et) return 0;
            return 1;
        }

        /**
         * 时间是否到啦
         * @param time 
         */
        private isTimeOut(time: string): boolean {
            let ct: number = clientCore.ServerManager.curServerTime;
            let st: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(ct) + ' ' + time);
            return ct >= st;
        }

        private date1: Date = new Date();
        private data2: Date = new Date();

        /** 是否跨天了*/
        private isOverDay(): boolean {
            let serverTime: number = clientCore.ServerManager.curServerTime;
            this.date1.setTime(serverTime * 1000);
            this.data2.setTime((serverTime - 1) * 1000);
            return this.date1.getDate() != this.data2.getDate();
        }

        /**
         * 跨天的话把已完成的事情 重新加入到待办事情
         */
        private onOverDay(): void {
            this._dailyTodo = this._dailyTodo.concat(this._dailyAffairTodo);
            this._dailyAffairTodo = [];
            EventManager.event(globalEvent.ON_OVER_DAY);
        }
    }
}