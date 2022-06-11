namespace jumpGame {
    export interface ModuleInfo {
        modelType: string;  //模块类型
        openType: string;   //打开方式
        stageId: number;    //关卡id
        gameId: number;     //游戏id
        isTry?: boolean;    //是否是试玩
        historyHighScore?: number;  //历史最高分
    }
    /**
     * 冒险游戏model
     * **/
    export class JumpGameModel implements clientCore.BaseModel {
        public stageId: number;             //关卡id
        public gameId: number;              //游戏id
        public score: number;               //分数
        public historyHighScore: number;    //历史最高分
        public totalStep: number;           //当前步数

        public isTry: boolean;              //是否是试玩

        public modelType: string;           //模块类型（接口方式）
        public openType: string;            //打开方式（入口来源）

        private _flowerCreateInfoArr: xls.gameJumpBase[];
        private _flowerRandomRewardArr: xls.triple[];

        constructor() {

        }

        initData(data: ModuleInfo): void {
            this.modelType = data.modelType;
            this.openType = data.openType;
            this.stageId = data.stageId;
            this.gameId = data.gameId;
            this.isTry = data.isTry;
            this.historyHighScore = data.historyHighScore;
        }

        public get flowerCreateInfoArr(): xls.gameJumpBase[] {
            if (!this._flowerCreateInfoArr) {
                this._flowerCreateInfoArr = _.filter(xls.get(xls.gameJumpBase).getValues(), (o) => { return o.stageId == this.gameId });
            }
            return this._flowerCreateInfoArr;
        }

        public get flowerRandomRewardArr(): xls.triple[] {
            if (!this._flowerRandomRewardArr) {
                this._flowerRandomRewardArr = [];
                /**关卡有随机奖励的记录到数组 */
                for (let info of this.flowerCreateInfoArr) {
                    let rwd = clientCore.LocalInfo.sex == 1 ? info.randomAwardFemale : info.randomAwardMale;
                    for (let reward of rwd) {
                        if (reward.v1 > 0) {
                            this._flowerRandomRewardArr.push(reward);
                        }
                    }
                }
            }
            return this._flowerRandomRewardArr;
        }

        dispose(): void {
            this._flowerCreateInfoArr = [];
            this._flowerCreateInfoArr = null;
            this._flowerRandomRewardArr = [];
            this._flowerRandomRewardArr = null;
        }
    }
}