namespace preludeToChristmas {
    export class PreludeToChristmasModel implements clientCore.BaseModel {
        public readonly activityId: number = 104;       //活动id
        public readonly redPointId: number = 21201;     //红点id
        public readonly ruleById: number = 1116;        //规则id
        public readonly ruleById2: number = 1117;       //规则id
        public readonly tokenId: number = 1301999;      //代币id
        public readonly suitId: number = 2110218;       //套装id

        public buyTimes: number = 0;                    //购买次数
        public buyTimesMax: number = 4;                 //购买次数
        public gameTimes: number = 0;                   //游戏次数
        public gameTimesMax: number = 3;                //游戏次数
        public isGetGift: number = 0;                   //是否领取圣诞礼盒

        constructor() {

        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_christmas_song_panel) {
            this.buyTimes = msg.buyTimes;
            this.gameTimes = msg.gameTimes;
            this.isGetGift = msg.flag;
        }

        /** 获取奖励数据列表 **/
        getRewardArr(): xls.eventExchange[] {
            return _.filter(xls.get(xls.eventExchange).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取购买数据列表 **/
        getBuyInfo(): xls.commonBuy {
            return _.filter(xls.get(xls.commonBuy).getValues(), (o) => { return o.type == this.activityId })[this.buyTimes];
        }

        /** 获取圣诞礼盒数据 **/
        getChristmasGift(): xls.pair[] {
            if (clientCore.LocalInfo.sex == 1)
                return xls.get(xls.globaltest).get(1).christmasGiftFemale;
            else
                return xls.get(xls.globaltest).get(1).christmasGiftMale;
        }

        /** 是否可以购买 **/
        public get isCanBuy(): boolean {
            return this.buyTimes < this.buyTimesMax;
        }

        /** 是否可以游戏 **/
        public get isCanGame(): boolean {
            return this.gameTimes < this.gameTimesMax;
        }

        dispose(): void {

        }
    }
}