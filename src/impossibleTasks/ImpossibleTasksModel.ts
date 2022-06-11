namespace impossibleTasks {
    export class ImpossibleTasksModel implements clientCore.BaseModel {
        public readonly activityId: number = 77;        //活动id
        public readonly redPointId: number = 16701;     //红点id
        public readonly ruleById: number = 1071;        //规则id--主面板
        public readonly ruleById2: number = 1069;       //规则id--收集花露
        public readonly ruleById3: number = 1070;       //规则id--驱逐捣乱怪
        public readonly tokenId: number = 9900079;      //心情值代币id
        public readonly tokenId2: number = 9900080;     //进度代币id
        public readonly suitId: number = 2110158;       //套装ID
        public readonly mc_Id: number = 80230;          //动画id
        public readonly battle_id: number = 60120;      //战斗id

        public bossCnt: number = 0;                     //挑战BOSS次数
        private readonly _bossCntMax: number = 3;       //挑战BOSS最大次数
        private readonly _bossCntMax2: number = 4;      //挑战BOSS最大次数(奇妙花宝玩家)
        public sweepCnt: number = 0;                    //扫荡可获得奖励
        public buyTimes: number = 0;                    //购买次数
        public readonly buyTimesMax: number = 4;        //购买次数上限
        public gameTimes: number = 0;                   //游戏已玩次数
        public readonly gameTimesMax: number = 3;       //游戏次数上限
        public readonly tokenNumMin: number = 100;      //心情值说服下限
        public readonly tokenNumMax: number = 300;      //心情值上限
        public readonly tokenNum2Max: number = 100;     //进度值上限

        public readonly duihuaData = {
            "1": ["我以一个编剧的名义起誓，你非常适合这个角色", "距离一场完美的中秋话剧只差一个完美契合的演员"],
            "2": ["看在我熬了几个通宵的份上，你就看看剧本吧", "拉贝尔的大家都很期待能够看到你的演出！"],
            "3": ["你不答应我我就不起来QAQ（抱住大腿）", "看在我这么诚心诚意的份上，你就答应我吧QAQ"]
        };

        public readonly duihuaData2 = {
            "1": ["抱歉，我对话剧不感兴趣", "我个人认为你选择芬妮效果会更好", "……好吧，有时间的话我会看看剧本", "（扶额）好吧，我答应你，不过我可不敢保证演出质量"],
            "2": ["我想…我会是一个很好的观众", "我可以在其他方面向你提供帮助", "剧本还是不错的，再给我半天考虑一下", "（扶额）好吧，我答应你，不过我可不敢保证演出质量"]
        };

        public readonly duihuanTipsData = ["伊紫感到兴趣泛泛 说服进度提升", "伊紫尝试委婉拒绝 说服进度提升", "伊紫开始动摇 说服进度提升", "伊紫接受了你的请求 说服进度提升"];

        updateBuyTimes(): void {
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.IMPOSSIBLE_TASKS_BUY, value: this.buyTimes }]);
        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_impossible_task_panel) {
            this.buyTimes = msg.buyTimes;
            this.gameTimes = msg.gameTimes;
            this.bossCnt = msg.fightTimes;
            this.sweepCnt = msg.mopNum;
        }

        /** 获取奖励数据列表 **/
        getRewardArr(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取购买数据列表 **/
        getBuyInfo(): xls.commonBuy[] {
            return _.filter(xls.get(xls.commonBuy).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取心情值代币数量 **/
        public get tokenNum(): number {
            return clientCore.ItemsInfo.getItemNum(this.tokenId);
        }

        /** 获取进度代币数量 **/
        public get tokenNum2(): number {
            return clientCore.ItemsInfo.getItemNum(this.tokenId2);
        }

        /** 获取挑战BOSS最大次数 **/
        public get bossCntMax(): number {
            return clientCore.FlowerPetInfo.petType > 0 ? this._bossCntMax2 : this._bossCntMax;
        }

        /** 是否可以购买 **/
        public get isCanBuy(): boolean {
            return this.buyTimes < this.buyTimesMax;
        }

        /** 是否可以进行游戏 **/
        public get isCanGame(): boolean {
            return this.gameTimes < this.gameTimesMax;
        }

        /** 是否可以进行战斗 **/
        public get isCanBattle(): boolean {
            return this.bossCnt < this.bossCntMax;
        }

        dispose() {

        }
    }
}