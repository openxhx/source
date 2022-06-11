namespace luckyBamboo {
    export class GrowInfo {
        id: number;
        cost: number;
        level: number;
        reward: xls.pair[];
        constructor(id, cost, reward, level) {
            this.id = id;
            this.cost = cost;
            this.reward = reward;
            this.level = level;
        }
    }
    export class LuckyBambooModel implements clientCore.BaseModel {
        /**奖励套装id */
        public readonly suitId: number = 2110200;
        /**幸运珠id */
        public readonly coinId: number = 9900106;
        /**经验值id */
        public readonly growId: number = 9900107;
        /**竹子成长信息 */
        public growInfo: util.HashMap<GrowInfo>;
        /**当前等级 */
        public curLevel: number;
        /**当前经验值 */
        public curExp: number;
        /**累计经验值 */
        public allExp: number;
        /**当前经验池 */
        public curExpPool: number;
        /**最高等级 */
        public maxLevel: number;
        /**是否限制留言 */
        public limit: number;
        /**留言板信息 */
        public allVow: pb.Iwish_palte_info[];
        /**祈愿消耗 */
        public vowCose: number;
        /**当前竹子主人 */
        public curUid: number;

        /**获取阶段奖励信息 */
        public getGrowInfo() {
            this.maxLevel = 0;
            this.growInfo = new util.HashMap();
            let arr = xls.get(xls.luckBamboo).getValues();
            for (const info of arr) {
                if (info.level > this.maxLevel) this.maxLevel = info.level;
                let reward = clientCore.LocalInfo.sex == 1 ? info.femaleAward : info.maleAward;
                this.growInfo.add(info.level, new GrowInfo(info.id, info.experience, reward, info.level));
            }
        }

        /**解析竹子的等级 */
        public getBambooInfo() {
            let curGrow = this.allExp;
            if (curGrow >= this.growInfo.get(this.maxLevel).cost) {
                this.curLevel = this.maxLevel;
            } else {
                let index = 0;
                while (index < this.growInfo.length) {
                    if (curGrow >= this.growInfo.get(index).cost && curGrow < this.growInfo.get(index + 1).cost) {
                        this.curLevel = index;
                        break;
                    }
                    index++;
                }
            }
            if (this.curLevel > 0) this.curExp = curGrow - this.growInfo.get(this.curLevel).cost;
            else this.curExp = curGrow;
            if (this.curLevel < this.maxLevel) {
                this.curExpPool = this.growInfo.get(this.curLevel + 1).cost - this.growInfo.get(this.curLevel).cost;
            }
        }
        dispose() {
            this.growInfo.clear();
            this.growInfo = null;
        }
    }
}