namespace hiddenElf{
    export class HiddenElfModel implements clientCore.BaseModel{

        /** 本次活动代币*/
        public readonly ACTIVITY_ID: number = 9900121;

        /** 神秘商人购买次数*/
        public buyTimes: number;
        /** 提交总数*/
        public submitCnt: number;
        /** 今日是否领奖了*/
        public isReward: boolean;
        /** 服装兑换标记*/
        public exchangeIdx: number;
        /** 游戏次数*/
        public gameTimes: number;

        init(msg: pb.sc_hidden_monster_panel): void{
            this.buyTimes = msg.buyTimes;
            this.submitCnt = msg.subTimes;
            this.isReward = msg.flag == 1;
            this.exchangeIdx = msg.exchangeIdx;
            this.gameTimes = msg.palyTimes;
        }

        dispose(): void{
        }
    }
}