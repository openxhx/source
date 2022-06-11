namespace secretPercious{
    /**
     * 数据
     */
    export class SecretPerciousModel implements clientCore.BaseModel{

        public rewardIdx: number;
        public times: number; //每日已经占卜次数
        public totalTimes: number; //每日可占卜次数（不含免费）
        public feelTimes: number; //免费可占卜次数
        public mapId: number; //当前宝藏地图ID
        public historyTimes: number; //历史占卜总数
        public clothId: number = 2110265;

        init(data: pb.sc_get_secret_treasure_info): void{
            this.times = data.cntUsed;
            this.rewardIdx = data.rewardFlag;
            this.totalTimes = data.cntTotal;
            this.feelTimes = data.freeUsed;
            this.mapId = data.mapId;
            this.historyTimes = data.cntHistory;
        }

        dispose(): void{

        }

        /**是否可免费*/
        get isFeel(): boolean{
            let now: number = clientCore.ServerManager.curServerTime;
            let st: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 12:00:00');
            let et: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 18:00:00');
            return this.feelTimes < 2 && now >= st && now <= et;
        }

        /** 是否可以占卜*/
        get canAugur(): boolean{
            return this.isFeel || this.realTimes < this.totalTimes;
        }

        /** 除免费外的占卜次数*/
        get realTimes(): number{
            // return this.times - this.feelTimes;
            return this.times;
        }
    }
}