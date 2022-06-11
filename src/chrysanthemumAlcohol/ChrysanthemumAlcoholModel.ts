namespace chrysanthemumAlcohol {
    export class ChrysanthemumAlcoholModel implements clientCore.BaseModel {
        public readonly activityId: number = 88;        //活动id
        public readonly redPointId: number = 18201;     //红点id
        public readonly ruleById1: number = 1097;       //规则id--主界面
        public readonly ruleById2: number = 1095;       //规则id--金菊连连看小游戏
        public readonly ruleById3: number = 1096;       //规则id--划拳猜心小游戏
        public readonly tokenId: number = 9900085;      //满意度代币id
        public readonly tokenId2: number = 9900091;     //普通酿酒代币id
        public readonly tokenId3: number = 9900092;     //额外酿酒代币id
        public readonly itemId1: number = 9900087;      //金菊道具id
        public readonly itemId2: number = 700001;       //香精道具id
        public readonly itemId3: number = 710003;       //枸杞道具id
        public readonly itemId4: number = 700007;       //芳香剂道具id
        public readonly itemId5: number = 9900086;       //菊酒道具id
        public readonly suitId: number = 2110174;       //套装ID
        public readonly mc_Id: number = 80360;          //动画id

        public buyTimes: number = 0;                    //购买次数
        public readonly buyTimesMax: number = 4;        //购买次数上限
        public gameTimes1: number = 0;                  //游戏已玩次数--花朵连连看
        public readonly gameTimesMax1: number = 3;      //游戏次数上限--花朵连连看
        public gameTimes2: number = 0;                  //游戏已玩次数--划拳猜心
        public readonly gameTimesMax2: number = 3;      //游戏次数上限--划拳猜心
        public freeFlag: number = 0;                    //每日免费奖励领取状态 1.已领取 0.未领取

        public readonly qipaoData = [
            { num: 700, desc: "这个味道闻起来有点奇怪......" },
            { num: 1500, desc: "嗯，口味一般般吧~" },
            { num: 2500, desc: "不错，比以前进步多了！" },
            { num: -1, desc: "真不错，非常滋补，总算可以送给斯尔克爷爷喝了！" }
        ]

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_get_gloden_chrysanthemum_info) {
            this.gameTimes1 = msg.timesA;
            this.gameTimes2 = msg.timesB;
            this.freeFlag = msg.freeFlag;
        }

        /** 获取奖励数据列表 **/
        getRewardArr(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取购买数据列表 **/
        getBuyInfo(): xls.commonBuy {
            return _.filter(xls.get(xls.commonBuy).getValues(), (o) => { return o.type == this.activityId })[this.buyTimes];
        }

        /** 获取满意度代币数量 **/
        public get tokenNum(): number {
            return clientCore.ItemsInfo.getItemNum(this.tokenId);
        }

        /** 获取金菊数量 **/
        public get itemNum5(): number {
            return clientCore.ItemsInfo.getItemNum(this.itemId5);
        }

        /** 是否可以购买 **/
        public get isCanBuy(): boolean {
            return this.buyTimes < this.buyTimesMax;
        }

        /** 是否可以进行游戏--花朵连连看 **/
        public get isCanGame1(): boolean {
            return this.gameTimes1 < this.gameTimesMax1;
        }

        /** 是否可以进行游戏--划拳猜心 **/
        public get isCanGame2(): boolean {
            return this.gameTimes2 < this.gameTimesMax2;
        }

        dispose(): void {

        }
    }
}