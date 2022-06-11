namespace schoolTeachersDay {
    export class SchoolTeachersDayModel implements clientCore.BaseModel {
        public readonly activityId: number = 67;    //勋章id
        public readonly redPointId: number = 15001; //红点id
        public readonly suitId: number = 2110043;   //套装ID
        public readonly coinId: number = 9900067;   //勋章id
        public readonly mc_Id: number = 80200;      //动画id


        public coinNum: number = 0;         //勋章数量
        public answerTimes: number = 0;     //答题数量
        public answerNumMax: number = 5;    //答题最大数量
        public buyTimes: number = 0;        //购买次数
        public buyTimesMax: number = 4;     //购买次数

        constructor() {

        }

        /**获取勋章情况 */
        async getBuyMedal() {
            let totalInfo = await clientCore.MedalManager.getMedal([MedalDailyConst.SCHOOL_TEACHERS_DAY_BUY]);
            this.buyTimes = totalInfo[0].value;
            return Promise.resolve();
        }

        updateBuyTimes(): void {
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.SCHOOL_TEACHERS_DAY_BUY, value: this.buyTimes }]);
        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_teachers_day_panel) {
            this.coinNum = msg.coinNum;
            this.answerTimes = msg.answerTimes;
        }

        /** 获取指定id题目数据 **/
        getMiniAnswer(id: number): xls.miniAnswer {
            return xls.get(xls.miniAnswer).get(id);
        }

        /** 获取奖励数据列表 **/
        getRewardArr(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取购买数据列表 **/
        getBuyInfo(): xls.commonBuy[] {
            return _.filter(xls.get(xls.commonBuy).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 是否可以答题 **/
        public get isCanAnswer(): boolean {
            return this.answerTimes < this.answerNumMax;
        }

        /** 是否可以购买 **/
        public get isCanBuy(): boolean {
            return this.buyTimes < this.buyTimesMax;
        }

        dispose(): void {

        }
    }
}