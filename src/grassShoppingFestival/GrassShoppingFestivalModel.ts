namespace grassShoppingFestival {
    export class GrassShoppingFestivalModel implements clientCore.BaseModel {
        //#region sc_grass_shopping_festival_panel
        public freeTaskId: number;
        public taskId: number;
        public gameTimes: number;
        public bit: number;
        //#endregion

        public readonly animationSuccTj: Array<number> = [80525, 80526, 80527, 80528, 80529, 80530];
        public readonly animationFailTj: number = 80531;
        /**口才Id号*/
        public readonly eloquenceId: number = 9900196;
        /**模块规则Id号*/
        public readonly ruleModuleId: number = 1198;
        /**套装Id号*/
        public readonly suitId: number = 2110413;
        /**最佳推荐口才*/
        public readonly optimumRecommendEloquence: Map<number, IGrassShoppingFestivalRecommendVo>;
        /**口才颜色值*/
        public readonly eloquenceColor: Array<string> = ["#f9461c", "#f7841e", "#76ed2e"];
        //百分绿
        public readonly recommendRate: number = 80;
        //气泡1
        public readonly pp_talk_1: Array<string> = [
            "这种东西真的能卖出去吗？",
            "这些东西会不会看上去太廉价？",
            "这个对平民来说可能有点贵……"
        ];
        //气泡2
        public readonly pp_talk_2: Array<string> = [
            "小赛赛，这次就交给我吧！",
            "让顾客觉得超值就好啦！",
            "与其不买后悔，不如买了再后悔哟！"
        ];
        //卡片初始信息
        public card_initInfo_list: Array<CardInitPo> = null;

        public readonly card_ruleId: number = 1199;
        //当前关卡
        public cur_card_level: number;
        //一局5题
        public readonly card_game_all: number = 5;
        //本局的5题(存储题号id)
        public card_game_questions: Array<number>;
        public card_question_upset: Array<number>;
        public card_game_succ: Array<number>;

        public constructor() {
            const sex: number = clientCore.LocalInfo.sex;
            if (sex == 1) {//女
                this.optimumRecommendEloquence = new Map([
                    [1, { goodIndex: 1, eloquenceValue: 45, bannarIndex: 1, recommendRewards: { rewards: [143626, 9900193], cnts: [1, 2] } }],
                    [2, { goodIndex: 2, eloquenceValue: 75, bannarIndex: 1, recommendRewards: { rewards: [143621, 143617], cnts: [1, 1] } }],
                    [3, { goodIndex: 3, eloquenceValue: 120, bannarIndex: 2, recommendRewards: { rewards: [143620, 9900193], cnts: [1, 3] } }],
                    [4, { goodIndex: 4, eloquenceValue: 180, bannarIndex: 2, recommendRewards: { rewards: [143622, 143623], cnts: [1, 1] } }],
                    [5, { goodIndex: 5, eloquenceValue: 255, bannarIndex: 3, recommendRewards: { rewards: [143625, 9900193], cnts: [1, 5] } }],
                    [6, { goodIndex: 6, eloquenceValue: 345, bannarIndex: 3, recommendRewards: { rewards: [143619, 143624], cnts: [1, 1] } }]
                ]);
            } else {//男
                this.optimumRecommendEloquence = new Map([
                    [1, { goodIndex: 1, eloquenceValue: 45, bannarIndex: 1, recommendRewards: { rewards: [143636, 9900193], cnts: [1, 2] } }],
                    [2, { goodIndex: 2, eloquenceValue: 75, bannarIndex: 1, recommendRewards: { rewards: [143631, 143627], cnts: [1, 1] } }],
                    [3, { goodIndex: 3, eloquenceValue: 120, bannarIndex: 2, recommendRewards: { rewards: [143630, 9900193], cnts: [1, 3] } }],
                    [4, { goodIndex: 4, eloquenceValue: 180, bannarIndex: 2, recommendRewards: { rewards: [143632, 143633], cnts: [1, 1] } }],
                    [5, { goodIndex: 5, eloquenceValue: 255, bannarIndex: 3, recommendRewards: { rewards: [143635, 9900193], cnts: [1, 5] } }],
                    [6, { goodIndex: 6, eloquenceValue: 345, bannarIndex: 3, recommendRewards: { rewards: [143629, 143634], cnts: [1, 1] } }]
                ]);
            }
        }

        //获取口才值
        public getSelfEloquence(): number {
            return clientCore.MoneyManager.getNumById(this.eloquenceId);
        }
        //获得最新的未完成的推销标记Id
        public getLastRecommendNoneFinished(): number {
            let flag: number = null;
            for (let i: number = 0, j: number = this.optimumRecommendEloquence.size; i < j; i++) {
                flag = util.getBit(this.bit, i + 1);
                if (flag == 0) {
                    return i + 1;
                }
            }
            return null;
        }
        //获取口才等级(以分辨颜色)
        public getEloquenceLv(data: IGrassShoppingFestivalRecommendVo): number {
            const money: number = this.getSelfEloquence();
            const value: number = data.eloquenceValue;
            let index: number;
            if (money < value * this.recommendRate / 100) {
                index = 0;
            } else if (money >= value * this.recommendRate / 100 && money < value) {
                index = 1;
            } else {
                index = 2;
            }
            return index;
        }
        //重置1局的5题
        public resetCardGameQuestions(): void {
            this.card_game_questions = [];
            let index: number;
            let max: number = xls.get(xls.gameWordPuzzle).length;
            let min: number = 1;
            while (this.card_game_questions.length < this.card_game_all) {
                index = this.andomNumBoth(min, max);
                if (this.card_game_questions.length == 0) {
                    this.card_game_questions.push(index);
                } else {
                    let exist: boolean = false;
                    for (let i: number = 0, j: number = this.card_game_questions.length; i < j; i++) {
                        if (this.card_game_questions[i] == index) {
                            exist = true;
                            break;
                        }
                    }
                    if (!exist) {
                        this.card_game_questions.push(index);
                    }
                }
            }
        }
        //获取本题题干字数
        public getCardsLineCnt(): number {
            const qId: number = this.card_game_questions[this.cur_card_level];
            let cfg: xls.gameWordPuzzle = xls.get(xls.gameWordPuzzle).get(qId);
            return cfg.stemWord.length;
        }

        //打乱牌字的顺序
        public cardUpset(): void {
            this.card_question_upset = [];
            let arr: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7];
            for (var i = arr.length + 1; i > 0;) {
                i--
                var rdm = Math.floor(Math.random() * arr.length)
                if (!this.card_question_upset.includes(arr[rdm])) {
                    this.card_question_upset.push(arr[rdm])
                } else {
                    if (this.card_question_upset.length == arr.length) {
                        break;
                    }
                    i++
                }
            }
        }

        /**
         * 随机算法
         */
        private andomNumBoth(min: number, max: number): number {
            const Range: number = max - min;
            if (Range != 0.0) {
                const Rand: number = Math.random();
                const num: number = min + Math.round(Rand * Range); //四舍五入
                return num;
            } else {
                return min;
            }
        }

        public dispose(): void {

        }
    }
}