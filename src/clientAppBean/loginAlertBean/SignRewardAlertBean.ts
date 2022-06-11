namespace clientAppBean {
    /**
     * 累计登录领奖强弹
     */

    export class SignRewardAlertBean extends BaseLoginAlertBean {
        state1: number = 0; //普通奖励领取标记
        state2: number = 0; //奇妙奖励领取标记
        private time: Array<string> = ["2022-04-08 00:00:00", "2022-05-04 23:59:59"];

        async start() {
            let now: number = clientCore.ServerManager.curServerTime;
            let timeStart: number = util.TimeUtil.formatTimeStrToSec(this.time[0]);
            let timeEnd: number = util.TimeUtil.formatTimeStrToSec(this.time[1]);
            if ((now > timeEnd) || (now < timeStart)) this.openNext();
            else
                this.getInfo();
        }

        private async getInfo() {
             await xls.load(xls.signinbydate);
            net.sendAndWait(new pb.cs_hua_12anniversary_panel()).then((data: pb.sc_hua_12anniversary_panel) => {
                this.state1 = data.normalBabyFlag;
                this.state2 = data.vipBabyFlag;
                this.openModule();
            });
        }

        private openModule() {
            for (let i = 1; i <= 12; i++) {
                let xlsInfo = xls.get(xls.signinbydate);
                let second = util.TimeUtil.formatTimeStrToSec(xlsInfo.get(i).StartTime)
                if (clientCore.ServerManager.curServerTime >= second) {
                    if (clientCore.FlowerPetInfo.petType > 0 && util.getBit(this.state2,  i) == 0
                    || clientCore.FlowerPetInfo.petType == 0 && util.getBit(this.state1,  i) == 0) {
                        clientCore.ModuleManager.open("signReward.SignRewardModule");
                        EventManager.once('SignRewardClose', this, this.openNext);//监听
                        return;
                    }
                }else{
                    this.openNext();
                    break;
                }

            }
        }
    }
}