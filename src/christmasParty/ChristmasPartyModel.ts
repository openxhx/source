namespace christmasParty {
    export class ChristmasPartyModel implements clientCore.BaseModel {
        public readonly activityId: number = 107;       //活动id
        public readonly redPointId: number = 21601;     //红点id
        public readonly redPointId2: number = 21602;    //红点id
        public readonly ruleById: number = 1120;        //规则id
        public readonly tokenId: number = 9900116;      //代币id
        public readonly tokenId2: number = 1301999;     //代币id
        public readonly suitId: number = 2110225;       //套装id

        public isGetGift: number = 0;                   //是否领取圣诞礼盒
        public hot: number = 0;                         //热度
        public timeStamp: number = 0;                   //热度更新时间
        public llSubTimes: number = 0;                  //璐璐已提交次数
        public anduluTimes: number = 0;                 //安德鲁已提交次数
        public exchangeItemFlag: number = 0;            //今日是否已兑换铃铛花 0 未兑换 1 已兑换
        public roleInfo: number[];                      //npc状态

        constructor() {

        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_christmas_party_panel) {
            this.isGetGift = msg.flag;
            this.hot = msg.hot;
            this.timeStamp = msg.timeStamp;
            this.llSubTimes = msg.llSubTimes;
            this.anduluTimes = msg.anduluTimes;
            this.exchangeItemFlag = msg.exchangeItemFlag;
            this.roleInfo = msg.roleInfo;
        }

        /** 获取套装奖励数据列表 **/
        getRewardArr(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取特殊奖励数据列表 **/
        getRewardArr2(): xls.eventExchange[] {
            return _.filter(xls.get(xls.eventExchange).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取露露事件可以选择的材料范围 **/
        getChrisRange1(): number[] {
            return xls.get(xls.globaltest).get(1).chrisRange1;
        }

        /** 获取安德鲁事件可以选择的材料范围 **/
        getChrisRange2(): number[] {
            return xls.get(xls.globaltest).get(1).chrisRange2;
        }

        /** 获取露露事件需要提交的材料数量 **/
        getChrisNum1(): number {
            return xls.get(xls.globaltest).get(1).chrisNum1;
        }

        /** 获取安德鲁事件需要提交的材料数量 **/
        getChrisNum2(): number {
            return xls.get(xls.globaltest).get(1).chrisNum2;
        }

        dispose(): void {

        }
    }
}