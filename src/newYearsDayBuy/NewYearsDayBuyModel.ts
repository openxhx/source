namespace newYearsDayBuy {
    export class NewYearsDayBuyModel implements clientCore.BaseModel {
        public readonly activityId: number = 181;        //活动id
        public readonly redPointId: number = 24001;     //红点id
        public readonly ruleById: number = 1107;        //规则id
        public readonly buyGiftId: number = 45;         //活动礼包id
        public readonly buyEndTime: string = '2021/8/20 00:00:00';//礼包购买截止时间
        public readonly suitId: number = 2110466;       //套装id

        public loginDay: number = 0;                    //已登陆天数
        public rewardStatus: number = 0;                //奖励状态

        constructor() {

        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_buy_for_six_yuan_on_the_seventh_night_get_info) {
            this.loginDay = msg.days;
            this.rewardStatus = msg.rewardStatus;
        }

        /** 获取奖励数据列表 **/
        getRewardArr(): xls.dayAward[] {
            return _.filter(xls.get(xls.dayAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 是否可以购买**/
        public get canBuy(): boolean {
            let tokenId = clientCore.RechargeManager.getShopInfo(this.buyGiftId).rewardFamale[0].v1;
            return !clientCore.ItemsInfo.checkHaveItem(tokenId) && clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec(this.buyEndTime);
        }

        dispose(): void {

        }
    }
}