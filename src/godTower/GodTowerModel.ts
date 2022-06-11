namespace godTower {
    export interface BoxInfo {
        pos: number;
        reward: xls.pair;
    }
    export class GodTowerModel implements clientCore.BaseModel {
        private _severInfo: { rewardId: number, isGot: number }[];
        private _rewardMap: util.HashMap<{ rewardId: number, isGot: number }[]>;
        public _gotReward: BoxInfo[];
        public _curOpenLevel: number;
        /**打折券ID */
        public readonly ticketIds: number[] = [9900029, 9900030, 9900031];
        /**套装ID */
        public readonly suitId: number = 2100188;
        /**层级对应的最大ID */
        public levelCount: number[] = [0, 5, 10, 14, 18, 21, 24, 25, 0];
        /**层级对应部件数量 */
        private clothCount: number[] = [3, 6, 8, 10, 11, 12, 13];
        constructor() {

        }

        setGotReward(info: pb.ItowerBox[]): void {
            this._gotReward = [];
            for (let i: number = 0; i < info.length; i++) {
                this._gotReward.push({ pos: info[i].posId, reward: clientCore.LocalInfo.sex == 1 ? xls.get(xls.godTower).get(info[i].rewardId).femaleReward : xls.get(xls.godTower).get(info[i].rewardId).maleReward });
            }
            this._curOpenLevel = this.getOpenLevel();
        }

        addGotReward(pos: number, reward: xls.pair) {
            this._gotReward.push({ pos: pos, reward: reward });
        }

        checkNewLevelOpen(): void {
            let openLevel = this.getOpenLevel();
            if (openLevel > this._curOpenLevel) {
                this._curOpenLevel = openLevel;
                EventManager.event('OPEN_NEW_TOWER_LEVEL');
            }
        }

        getRewardInfo(id: number): xls.pair[] {
            let arr = [];
            arr.push(clientCore.LocalInfo.sex == 1 ? xls.get(xls.godTower).get(id).femaleReward : xls.get(xls.godTower).get(id).maleReward);
            return arr;
        }

        getRewardByPos(pos: number): BoxInfo {
            return _.find(this._gotReward, (o) => { return o.pos == pos });
        }

        getOpenLevel(): number {
            if (this._gotReward.length <= 0) return 1;
            let target = clientCore.SuitsInfo.getSuitInfo(this.suitId).clothes;
            let gotCount = 0;
            for (let i: number = 0; i < this._gotReward.length; i++) {
                if (target.indexOf(this._gotReward[i].reward.v1) >= 0) gotCount++;
            }
            for (let i: number = 0; i < this.clothCount.length; i++) {
                if (gotCount < this.clothCount[i]) {
                    return i + 1;
                }
            }
            return 7;
        }

        checkAllGet(level: number): boolean {
            return _.filter(this._gotReward, (o) => { return (o.pos > this.levelCount[level - 1] && o.pos <= this.levelCount[level]) }).length == this.levelCount[level] - this.levelCount[level - 1];
        }

        getRewardByLevel(level: number): xls.pair[] {
            return _.filter(xls.get(xls.godTower).getValues(), (o) => { return o.levelId == level }).map((o) => { return clientCore.LocalInfo.sex == 1 ? o.femaleReward : o.maleReward });
        }

        dispose(): void {

        }
    }
}