namespace pirateBucket {
    export class PirateBucketModel implements clientCore.BaseModel {
        public readonly suitId: number = 2110346;
        public readonly itemId: number = 9900159;

        public flowerTimes: number;
        public throwDiceTimes: number;
        public isGetReward: number;

        /**每日礼包勋章 */
        public readonly _buyMedalArr: number[] = [MedalDailyConst.PIRATE_BUCKET_BUY_2125, MedalDailyConst.PIRATE_BUCKET_BUY_2126, MedalConst.PIRATE_BUCKET_SWORD, MedalDailyConst.PIRATE_BUCKET_SELL];
        public _buyMedalInfo: pb.ICommonData[];
        public _swordPosFlag: number;
        public _sellOpenFlag: number;
        public getMissionInfo(id: number) {
            if (id == 1) return this.flowerTimes;
            else if (id == 2) return this.throwDiceTimes;
            else return 1;
        }

        public checkMissionFinish() {
            if (this.flowerTimes >= 1 && util.getBit(this.isGetReward, 1) == 0) return true;
            if (this.throwDiceTimes >= 5 && util.getBit(this.isGetReward, 2) == 0) return true;
            if (clientCore.FlowerPetInfo.petType == 3 && util.getBit(this.isGetReward, 3) == 0) return true;
            return false;
        }

        /**获取每日礼包购买情况 */
        async getBuyMedal() {
            let totalInfo = await clientCore.MedalManager.getMedal(this._buyMedalArr);
            this._sellOpenFlag = totalInfo.pop().value;
            this._swordPosFlag = totalInfo.pop().value;
            this._buyMedalInfo = totalInfo;
            return Promise.resolve();
        }
        dispose() {

        }
    }
}