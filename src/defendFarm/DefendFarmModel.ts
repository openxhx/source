namespace defendFarm {
    export class DefendFarmModel implements clientCore.BaseModel {
        public readonly activityId: number = 94;    //活动id
        public readonly redPointId: number = 19401; //红点id
        public readonly ruleById: number = 1105;    //规则id
        public readonly suitId: number = 2110191;   //套装ID
        public readonly mc_Id: number = 80410;      //动画id
        public readonly item_id1: number = 9900100; //饼干id
        public readonly item_id2: number = 9900099; //银丝id
        public readonly item_id3: number = 710002;  //面粉id
        public readonly item_id4: number = 710003;  //枸杞id
        public readonly item_id5: number = 700004;  //白砂糖id

        public supplyTimes: number = 0;             //兑换次数
        public buyTimes: number = 0;                //购买次数
        public readonly buyTimesMax: number = 4;    //购买次数上限
        public gameTimes: number = 0;               //游戏已玩次数
        public readonly gameTimesMax: number = 5;   //游戏次数上限

        updateBuyTimes(): void {
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.DEFEND_FARM_DAY_BUY, value: this.buyTimes }]);
        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_defend_farm_panel) {
            this.buyTimes = msg.buyTimes;
            this.supplyTimes = msg.flag;
            this.gameTimes = msg.gameTimes;
        }

        /** 获取奖励数据列表 **/
        getRewardArr(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取购买数据列表 **/
        getBuyInfo(): xls.commonBuy[] {
            return _.filter(xls.get(xls.commonBuy).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取套装所有散件信息 **/
        getSuitList(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 是否可以购买 **/
        public get isCanBuy(): boolean {
            return this.buyTimes < this.buyTimesMax;
        }

        /** 是否可以进行游戏 **/
        public get isCanGame(): boolean {
            return this.gameTimes < this.gameTimesMax;
        }

        dispose() {

        }
    }
}