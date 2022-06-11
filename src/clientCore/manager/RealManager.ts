namespace clientCore {
    /**
     * 实名认证管理者
     */
    export class RealManager {

        /** f服务器在登录时候发来的在线时间*/
        public onlineTime: number;
        /** 游戏开始时的服务器时间*/
        public startServerTime: number;
        /** 玩家累计充值金额*/
        public rechargeCnt: number;
        /** 是否等待退出 游戏已经触发了退出*/
        public waitExit: boolean = false;

        private _holidayInfo: Object = {};

        private _appVer: string
        constructor() {
            this._appVer = clientCore.NativeMgr.instance.getAppVersion();
        }

        /**
         * 根据表配来确定节假日
         * holidayInfo.xls
         */
        public checkHoliday(currTime: number = 0): boolean {
            let array: xls.holidayInfo[] = xls.get(xls.holidayInfo).getValues();
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.holidayInfo = array[i];
                let time: string = this._holidayInfo[element.holidayId];
                if (time == void 0) {
                    // time = new Date(element.dateInfo?.replace(/\-/g, '/') + " 00:00:00").getTime() / 1000 + "-" + new Date(element.dateInfo?.replace(/\-/g, '/') + " 23:59:59").getTime() / 1000;
                    time = util.TimeUtil.formatTimeStrToSec(element.dateInfo + " 00:00:00") + "-" + util.TimeUtil.formatTimeStrToSec(element.dateInfo + " 23:59:59");
                    this._holidayInfo[element.holidayId] = time;
                }
                let timeArr: string[] = time.split("-");
                if (!currTime) currTime = clientCore.ServerManager.curServerTime;
                if (currTime >= parseInt(timeArr[0]) && currTime <= parseInt(timeArr[1])) {
                    return true;
                }
            }
            return false;
        }

        public checkPlayGame(): boolean {
            let opt: alert.AlertOption = {
                callBack: {
                    funArr: [() => { window.location.reload(); }],
                    caller: this
                },
                btnType: alert.Btn_Type.ONLY_SURE,
                needClose: false,
                clickMaskClose: false
            }
            //游戏已经触发了退出
            if (this.waitExit) return false;
            //淘米sdk还没有设置实名的接口，暂时全部通过
            if (channel.ChannelConfig.channelId == channel.ChannelEnum.TAOMEE_AD && this._appVer == '3.3.1') {
                return true;
            }
            //没有实名，直接限制游戏
            if (LocalInfo.age == 0) {
                let channelInfo = clientCore.ChannelInfo.getInfoById(channel.ChannelConfig.channelId);
                if (channelInfo.isRealname) {
                    alert.showSmall("【健康系统】根据相关法律法规，登陆游戏前请先完成实名认证", opt);
                    return false;
                }
            }
            //已经充值过的不限制
            // if (LocalInfo.srvUserInfo.vipExp > 0) {
            //     return true;
            // }
            if (LocalInfo.age < 18) {
                let des = '亲爱的玩家，根据国家相关法规规定，未成年玩家只能在周五、周六、周日和法定节假日每日20:00~21:00上线。请您合理安排游戏时间，劳逸结合。';
                let date = util.TimeUtil.formatSecToDate(ServerManager.curServerTime);
                let hour: number = date.getHours();
                let day: number = date.getDay();
                //22-8未成年人不可登录
                if (day != 5 && !this.checkHoliday()) {
                    this.waitExit = true;
                    alert.showSmall(des, opt);
                    return false;
                }
                if (hour != 20) {
                    this.waitExit = true;
                    alert.showSmall(des, opt);
                    return false;
                }
            }
            return true;
        }

        /**
         * 检查这次充值是否被允许
         * @param cnt 
         */
        public checkRecharge(cnt: number): boolean {
            let age: number = LocalInfo.age;
            //淘米sdk还没有设置实名的接口，暂时全部通过
            if (channel.ChannelConfig.channelId == channel.ChannelEnum.TAOMEE_AD && this._appVer == '3.3.1') {
                return true;
            }
            //充过值就可以再充
            // if (clientCore.LocalInfo.srvUserInfo && clientCore.LocalInfo.srvUserInfo.vipExp > 0) {
            //     return true;
            // }
            if (age == 0 && (channel.ChannelConfig.channelId == channel.ChannelEnum.IOS || channel.ChannelConfig.channelId == channel.ChannelEnum.TM_H5)) {
                ModuleManager.open('realName.RealNameModule');
                return false;
            }
            if (age < 8) { //未满8周岁不可以付费
                alert.showFWords("未满8周岁不可以付费哦^_^");
                return false;
            }
            if (age < 16 && (cnt > 50 || this.rechargeCnt >= 200)) { //未满16周岁 单次不超过50 累计不超过200
                alert.showFWords("8周岁以上，未满16周岁单次充值不能超过50元，累计充值不超过200元~");
                return false;
            }
            if (age < 18 && (cnt > 100 || this.rechargeCnt >= 400)) { //未满18周岁 单次不超过100 累计不超过400
                alert.showFWords("16周岁以上，未满18周岁单次充值不能超过100元，累计充值不超过400元~");
                return false;
            }
            return true;
        }

        /**检查时间戳是否可以登录 */
        public isLoginDay(time: number) {
            if (LocalInfo.age >= 18) return true;
            let date = util.TimeUtil.formatSecToDate(time);
            let day: number = date.getDay();
            return (day == 5 || this.checkHoliday(time));
        }

        private static _ins: RealManager;
        public static get ins(): RealManager {
            return this._ins || (this._ins = new RealManager());
        }
    }
}