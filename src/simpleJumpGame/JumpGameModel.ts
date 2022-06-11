namespace simpleJumpGame {
    /**
     * 冒险游戏model
     * **/
    export class JumpGameModel implements clientCore.BaseModel {
        private _flowerCreateInfoArr: xls.gameJumpBase[];
        private _flowerRandomRewardArr: xls.triple[];
        private _cakeInfo: pb.Item[];
        constructor() {

        }

        public get flowerCreateInfoArr(): xls.gameJumpBase[] {
            if (!this._flowerCreateInfoArr) {
                this._flowerCreateInfoArr = _.filter(xls.get(xls.gameJumpBase).getValues(), (o) => { return o.stageId == 3590001 });
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

        public get cakeInfo(): pb.Item[] {
            if (!this._cakeInfo){
                this._cakeInfo = [];
                for (let i: number = 9900227; i <= 9900232; i++) {
                    this._cakeInfo.push({ id: i, cnt: 0 });
                }
            }
            return this._cakeInfo;
        }

        public AddCake(idx: number) {
            if (!this._cakeInfo) {
                this._cakeInfo = [];
                for (let i: number = 9900227; i <= 9900232; i++) {
                    this._cakeInfo.push({ id: i, cnt: 0 });
                }
            }
            this._cakeInfo[idx - 1].cnt++;
        }

        dispose(): void {
            this._flowerCreateInfoArr = [];
            this._flowerCreateInfoArr = null;
            this._flowerRandomRewardArr = [];
            this._flowerRandomRewardArr = null;
        }
    }
}