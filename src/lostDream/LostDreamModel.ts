namespace lostDream {
    export class LostDreamModel implements clientCore.BaseModel {

        /**
         * 领奖信息
         * 数组下标表示哪个奖励
         * 数组元素 1-未开启未满足开启条件 2-满足开启条件 3-已领奖 4-已开启
         */
        public rewards: number[];
        /** 小游戏的挑战次数*/
        public gameCnt: number;
        /** boss的挑战次数*/
        public bossCnt: number;
        /** 已经购买的礼盒勋章*/
        public buys: pb.ICommonData[];
        /** 扫荡的奖励数量*/
        public sweepCnt: number;
        /** 活动道具*/
        public readonly ACTIVITY_ID: number = 9900032;

        constructor() { }
        dispose(): void {
            if (this.rewards) this.rewards.length = 0;
            if (this.buys) this.buys.length = 0;
            this.rewards = this.buys = null;
        }

        checkBuy(): number {
            for (let i: number = 0; i < 4; i++) {
                let ele: pb.ICommonData = this.buys[i];
                if (ele && ele.value == 0) return i; //未购买的啦
            }
            return -1;
        }
    }
}