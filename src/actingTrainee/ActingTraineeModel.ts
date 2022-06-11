namespace actingTrainee {
    export class ActingTraineeModel implements clientCore.BaseModel {
        public readonly activityId: number = 72;    //活动id
        public readonly redPointId: number = 16101; //红点id
        public readonly ruleById: number = 1063;    //规则id
        public readonly ruleById2: number = 1033;   //规则id
        public readonly ruleById3: number = 1066;   //规则id
        public readonly tokenId: number = 9900073;  //演技值代币id
        public readonly tokenId2: number = 9900074; //分数代币代币id
        public readonly suitId: number = 2110057;   //套装id
        public readonly suitId2: number = 2100228;  //排行榜套装id
        public readonly wutai_id: number = 1100022;         //舞台id
        public readonly beijingxiu_id: number = 1000039;    //背景秀id
        public readonly mc_Id: number = 80220;      //动画id
        public readonly buy_price: number = 100;    //无限购买的价格
        public readonly buy_num: number = 10;       //无限购买数量
        public readonly subject_zu_num: number = 4; //答题单组题目数量
        public readonly rank_Id: number = 12;       //排行榜id
        public readonly game_Id: number = 6;        //小游戏id


        public buyTimes: number = 0;        //购买次数
        public buyTimesMax: number = 3;     //购买次数
        public answerTimes: number = 0;     //答题数量
        public answerNumMax: number = 3;    //答题最大数量

        constructor() {

        }

        /**获取勋章情况 */
        async getBuyMedal() {
            let totalInfo = await clientCore.MedalManager.getMedal([MedalDailyConst.ACTING_TRAINEE_BUY]);
            this.buyTimes = totalInfo[0].value;
            return Promise.resolve();
        }

        updateBuyTimes(): void {
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.ACTING_TRAINEE_BUY, value: this.buyTimes }]);
        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_drama_actor_panel) {
            this.buyTimes = msg.buyTimes;
            this.answerTimes = msg.answerTimes;
        }

        /** 答题题目数据 **/
        getMiniAnswers(): xls.miniAnswer[] {
            return _.filter(xls.get(xls.miniAnswer).getValues(), (o) => { return o.activityId == this.activityId });
        }

        /** 获取奖励数据列表 **/
        getRewardArr(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取购买数据列表 **/
        getBuyInfo(): xls.commonBuy[] {
            return _.filter(xls.get(xls.commonBuy).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取当前答题题目数据 **/
        getSubjectList(): { index: number, data: xls.miniAnswer[] } {
            let arr = this.getMiniAnswers();
            let arr2 = _.chunk(arr, this.subject_zu_num);
            let ran = _.random(0, arr2.length - 1, false);//先随一个随机数
            return { index: ran, data: arr2[ran] };
        }

        /** 检查活动剩余时间 **/
        public checkActivity(): number {
            let data: xls.rankInfo = xls.get(xls.rankInfo).get(this.rank_Id);
            let closeTime: number = util.TimeUtil.formatTimeStrToSec(data.closeTime);;
            return closeTime - clientCore.ServerManager.curServerTime;
        }

        /** 是否可以答题 **/
        public get isCanAnswer(): boolean {
            return this.answerTimes < this.answerNumMax;
        }

        /** 是否可以购买 **/
        public get isCanBuy(): boolean {
            return this.buyTimes < this.buyTimesMax;
        }

        /** 获取演技值代币数量 **/
        public get tokenNum(): number {
            return clientCore.ItemsInfo.getItemNum(this.tokenId);
        }

        dispose(): void {

        }
    }
}