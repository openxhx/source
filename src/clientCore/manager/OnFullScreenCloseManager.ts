namespace clientCore {
    export class OnFullScreenCloseManager {
        constructor() {
            EventManager.on(globalEvent.FULL_SCREEN_CLOSE_OR_BACK_HOME, this, this.checkOpenModule);
        }

        private async checkOpenModule() {
            // await util.TimeUtil.awaitTime(500);
            // if (ModuleManager.curShowModuleNum == 0 && MapInfo.mapID == 1 && clientCore.LocalInfo.userLv >= 8)
            //     this.checkHalloween();
        }

        /**检查万圣节活动 */
        private async checkHalloween() {
            if (!this.checkActitity(91)) return;
            let isGot = clientCore.SuitsInfo.getSuitInfo(2100254).allGet;
            if (isGot) return;
            let random = Math.random() >= 0.5;
            if (random) return;
            let info = await clientCore.MedalManager.getMedal([MedalDailyConst.KUKULU_VISIT_DAILY]);
            if (info[0].value == 1) return;
            clientCore.ToolTip.gotoMod(191);
        }

        /** 检查对应活动是否在时间内*/
        private checkActitity(id: number): boolean {
            let ct: number = clientCore.ServerManager.curServerTime;
            let event: xls.eventControl = xls.get(xls.eventControl).get(id);
            let arr: string[] = event.eventTime.split("_");
            let dst: number = util.TimeUtil.formatTimeStrToSec(arr[0]);
            let det: number = util.TimeUtil.formatTimeStrToSec(arr[1]);
            return ct >= dst && ct <= det;
        }
    }
}