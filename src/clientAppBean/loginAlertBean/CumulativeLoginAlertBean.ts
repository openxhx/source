namespace clientAppBean {
    /**
     * 累计登录领奖强弹
     */

    export class CumulativeLoginAlertBean extends BaseLoginAlertBean {
        private rewarded: number;
        private addUpDay: number;
        private time: Array<string> = ["2022-03-25 00:00:00", "2022-04-14 23:59:59"];

        async start() {
            let now: number = clientCore.ServerManager.curServerTime;
            let timeStart: number = util.TimeUtil.formatTimeStrToSec(this.time[0]);
            let timeEnd: number = util.TimeUtil.formatTimeStrToSec(this.time[1]);
            if((now > timeEnd) || (now < timeStart)) this.openNext();
            else
            this.getInfo();
        }

        private getInfo() {
            net.sendAndWait(new pb.cs_spring_sign_info()).then((data: pb.sc_spring_sign_info) => {
                this.rewarded = data.receive;
                this.addUpDay = data.sign;
                this.openModule();
            });
        }

        private openModule() {
            for (let i = 1; i <= Math.min(this.addUpDay, 5); i++) {
                if (util.getBit(this.rewarded, i) == 0) {
                    clientCore.ModuleManager.open("tigerYearSign.TigerYearSignModule");
                    EventManager.once('CumulativeLoginClose', this, this.openNext);//监听
                    return;
                }
            }
            this.openNext();
        }
    }
}