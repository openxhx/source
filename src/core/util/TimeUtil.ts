namespace util {
    /**
     * 时间工具
     */
    export class TimeUtil {

        /** 一天多少秒*/
        public static readonly DAYTIME: number = 86400;

        public static readonly DEFAULT_TIME_ZONE: number = 8;

        constructor() { }

        /**
         * await 延时
         * @param t  毫秒
         */
        public static awaitTime(t: number) {
            return new Promise((ok) => {
                Laya.timer.once(t, this, ok);
            })
        }

        /**
         * 延迟多少帧
         * @param t 帧数
         */
        public static awaitFrame(t: number): Promise<void> {
            return new Promise((suc) => {
                Laya.timer.frameOnce(t, this, suc);
            })
        }

        /**
         * 解析出时间 xx/xx/xx xx:xx
         */
        public static formatData(date: Date): string {
            let year: string = date.getFullYear().toString();
            let month: string = (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1);
            let day: string = (date.getDate() < 10 ? "0" : "") + date.getDate();
            let hour: string = date.getHours() < 10 ? "0" + date.getHours() : date.getHours().toString();
            let min: string = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes().toString();
            return year + "/" + month + "/" + day + " " + hour + ":" + min;
        }

        /**
         * 解析时间戳到日期
         * @param time 毫秒
         * @param needYear 
         */
        public static analysicTime(time: number, needYear?: boolean, symbol: string = "-"): string {
            let date: Date = new Date(time);
            let timeStr: string = "";
            if (needYear) {
                timeStr += date.getFullYear() + symbol;
                timeStr += date.getMonth() + 1 + symbol;
                timeStr += date.getDate() + " ";
            }
            let h: number = date.getHours();
            timeStr += (h < 10 ? ("0" + h) : h) + ":";
            let m: number = date.getMinutes();
            timeStr += (m < 10 ? ("0" + m) : m) + ":";
            let s: number = date.getSeconds();
            timeStr += (s < 10 ? ("0" + s) : s);
            return timeStr;
        }


        /** 解析秒级时间戳到日期 例如：2020/7/10*/
        public static formatDate(time: number): string {
            let date: Date = this.formatSecToDate(time);
            let y: number = date.getFullYear();
            let m: number = date.getMonth() + 1;
            let d: number = date.getDate();
            return y + '/' + (m < 10 ? '0' + m : m) + '/' + (d < 10 ? '0' + d : d);
        }

        /**
         * 获取年月日
         * @param time 秒级时间戳
         */
        public static analysicYear(time: number): string {
            // let date: Date = new Date(time * 1000);
            let date = TimeUtil.formatSecToDate(time);
            let timeStr: string = date.getFullYear() + "/";
            timeStr += date.getMonth() + 1 + "/";
            timeStr += date.getDate();
            return timeStr;
        }

        /**
         * 秒转成xx天xx小时xx分xx秒
         * @param second 
         * @param symbol 分割符号 例如： " " "-"
         */
        public static formatRemain(second: number, symbol?: string): string {
            if (symbol == void 0) symbol = "";
            let result = "";
            let day: number = _.floor(second / 60 / 60 / 24);
            if (day > 0) result += day + "天" + symbol;
            let hour: number = _.floor(second / 60 / 60) % 24;
            if (hour > 0) result += hour + "小时" + symbol;
            let min: number = _.floor(second / 60) % 60;
            if (min > 0) result += min + "分" + symbol;
            let sec: number = second % 60;
            result += sec + "秒";
            return result;
        }

        /**
         * 判断时间戳是否是当天
         * @param second 秒
         */
        public static isToday(second: number): boolean {
            return new Date(second * 1000).toDateString() === new Date().toDateString();
        }

        /**判断两个秒数时间戳是不是同一天 */
        public static isSameDay(sec1: number, sec2: number) {
            return this.formatSecToDate(sec1).toDateString() == this.formatSecToDate(sec2).toDateString();
        }

        /**
         * 计算离线时间
         * @param second 
         */
        public static getOfflineTime(second: number): string {
            let timeStr: string = "离线";
            let hour: number = _.floor(second / 60 / 60);
            if (hour < 24) return timeStr + hour + "小时";
            let day: number = _.floor(hour / 24);
            if (day < 7) return timeStr + day + "天";
            return timeStr + "7天以上";
        }
        /**
         * 计算两天间隔（自然日）
         * @param day1 
         * @param day2 
         */
        public static calIntervalTime(day1: number, day2: number): number {
            return Math.abs((this.floorTime(day1) - this.floorTime(day2)) / 86400);
        }
        /**把时间规整到当天的00:00:00 */
        public static floorTime(day: number): number {
            return day - ((day + 28800) % 86400);
        }

        /**
         * 根据传入的字符串时候。得到东八区的时候秒数
         * @param timeStr 
         */
        public static formatTimeStrToSec(timeStr: string): number {
            timeStr = timeStr.replace(/-/g, "/");
            let date = new Date(timeStr);
            let tempDate = new Date();
            let offset = -this.DEFAULT_TIME_ZONE - Math.floor(tempDate.getTimezoneOffset() / 60);
            return Math.floor((date.getTime() + offset * 3600000) / 1000);
        }
        /**
         * 根据给定的秒数时间，返回对应东八区的Date
         * @param sec 
         */
        public static formatSecToDate(sec: number): Date {
            let tempDate = new Date();
            let offset_GMT = tempDate.getTimezoneOffset();
            let eastEightZoneDate = new Date((sec + offset_GMT * 60 + this.DEFAULT_TIME_ZONE * 3600) * 1000);
            return eastEightZoneDate;
        }

        /**
         * 秒转成xx:xx:xx，不足一小时忽略h位置
         * @param second
         */
        public static formatSecToStr(second: number, needHour?: boolean): string {
            if (second < 0) second = 0;
            let result = "";
            let hour: number = _.floor(second / 60 / 60) % 24;
            if (hour > 0 || needHour) {
                if (hour < 10) result += "0"
                result += hour + ":";
            }
            let min: number = _.floor(second / 60) % 60;
            if (min < 10) result += "0";
            result += min + ":";
            let sec: number = _.floor(second % 60);
            if (sec < 10) result += "0";
            result += sec;
            return result;
        }

        /**获取前端展示用的活动时间 */
        public static getEventShowStr(base: string): string {
            let result = "";
            let start = base.split("_")[0];
            let end = base.split("_")[1];
            start = start.split(" ")[0];
            end = end.split(" ")[0];
            let startDay = start.split("-");
            let endDay = end.split("-");
            result = "活动时间：" + startDay[1] + "月" + startDay[2] + "日-" + endDay[1] + "月" + endDay[2] + "日";
            return result;
        }

        /**将当前时间规整到当周的0点 */
        public static floorWeekTime(time: number): number {
            let cur = util.TimeUtil.formatSecToDate(time);
            let disDay = cur.getDay() >= 1 ? cur.getDay() - 1 : 6;
            let updata = time - disDay * util.TimeUtil.DAYTIME;
            return updata - ((updata + 28800) % 86400);
        }
    }
}



