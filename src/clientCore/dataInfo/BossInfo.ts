namespace clientCore {
    /**
     * BOSS数据
     */
    export class BossInfo {

        /**
         * 当前状态
         * 0-活动未开启 1-活动准备中 2-活动进行中
         */
        public static status: number = 0;


        public waitT: number;
        public startT: number;
        public closeT: number;

        constructor() { }

        public initData(msg: pb.sc_get_world_boss_info): void {
            let data: xls.bossCommomData = xls.get(xls.bossCommomData).get(1);
            let ct: number = clientCore.ServerManager.curServerTime;
            let day: string = util.TimeUtil.formatData(new Date(ct * 1000)).split(" ")[0];
            this.waitT = util.TimeUtil.formatTimeStrToSec(day + " " + data.prepareTime);
            this.startT = util.TimeUtil.formatTimeStrToSec(day + " " + data.openTime);
            this.closeT = util.TimeUtil.formatTimeStrToSec(day + " " + data.closeTime);
        }
    }
}