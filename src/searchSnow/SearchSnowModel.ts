namespace searchSnow {
    export class SearchSnowModel implements clientCore.BaseModel {
        public readonly activityId: number = 102;       //活动id
        public readonly redPointId: number = 21001;     //红点id
        public readonly ruleById: number = 1114;        //规则id
        public readonly tokenId: number = 9900108;      //代币id
        public readonly itemId1: number = 9900109;      //印记id
        public readonly itemId2: number = 9900110;      //印记id
        public readonly itemId3: number = 9900111;      //印记id
        public readonly itemId4: number = 9900112;      //印记id
        public readonly itemId5: number = 9900113;      //印记id
        public readonly awardId1: number = 9900108;     //奖励道具id
        public readonly awardId2: number = 9900108;     //奖励道具id
        public readonly awardId3: number = 9900108;     //奖励道具id
        public readonly suitId: number = 2110217;       //套装id

        public cleanTimes: number = 0;                  //完成游戏次数
        public readonly cleanTimesMax: number = 10;     //游戏次数上限

        constructor() {
        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_sweep_the_snow_panel) {
            this.cleanTimes = msg.times;
        }

        /** 获取套装奖励数据列表 **/
        getRewardArr(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取特殊奖励数据列表 **/
        getRewardArr2(): xls.eventExchange[] {
            return _.filter(xls.get(xls.eventExchange).getValues(), (o) => { return o.type == this.activityId });
        }

        dispose(): void {

        }
    }
}