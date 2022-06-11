namespace jumpGame {
    export class JumpGameInfo {
        private _sign: number;

        private _model: JumpGameModel;

        constructor(sign: number) {
            this._sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this._sign) as JumpGameModel;
        }
        getCreateFlowerInfo(num: number): { type: number, disX: number, disY: number, item: clientCore.GoodsInfo } {
            let disX: number = 0;
            let disY: number = 0;
            let flowerType: number = 0;
            let reward: clientCore.GoodsInfo = new clientCore.GoodsInfo(0, 0);
            let flowerCreateInfoArr = this._model.flowerCreateInfoArr;
            for (let i = 0; i < flowerCreateInfoArr.length; i++) {
                if (num < flowerCreateInfoArr[i].stageRange.v2) {
                    let info = flowerCreateInfoArr[i];
                    disX = Math.floor(Math.random() * (info.distance.v2 - info.distance.v1) + info.distance.v1);
                    disY = Math.floor(Math.random() * (info.height * 2) - info.height);
                    /**花朵出现是有概率的 */
                    flowerType = this.findFlowerType(info.random);
                    /**防一手，万一策划配表概率没满100% */
                    if (flowerType == 0) {
                        flowerType = info.random[0].v1;
                    }
                    break;
                }
            }
            let flowerRandomRewardArr = this._model.flowerRandomRewardArr;
            for (let i = 0; i < flowerRandomRewardArr.length; i++) {
                if (flowerRandomRewardArr[i].v1 == num) {
                    reward.itemID = flowerRandomRewardArr[i].v2;
                    reward.itemNum = flowerRandomRewardArr[i].v3;
                }
            }
            return { type: flowerType, disX: disX, disY: disY, item: reward };
        }
        private findFlowerType(randomArr: xls.pair[]): number {
            let randomFlower = Math.random() * 100;
            for (let k = 0; k < randomArr.length; k++) {
                if (randomFlower <= randomArr[k].v2) {
                    return randomArr[k].v1;
                }
                randomFlower -= randomArr[k].v2;
            }
            return 0;
        }
        public checkShowRewardBox(num: number): boolean {
            for (let i = 0; i < this._model.flowerRandomRewardArr.length; i++) {
                if (this._model.flowerRandomRewardArr[i].v1 == num) {
                    return true;
                }
            }
            return false;
        }
        /** 根据跳在台上的位置，算出得分 */
        public getScore(flowerID: number, disPersent: number): number {
            let scoreArr = xls.get(xls.gameJumpFlower).get(flowerID).rangeAward;
            for (let i = 0; i < scoreArr.length; i++) {
                if (disPersent < scoreArr[i].v1) {
                    return scoreArr[i].v2;
                }
            }
            return scoreArr[scoreArr.length - 1].v2;
        }

        destroy(): void {
            this._model = null;
        }
    }
}