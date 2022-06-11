namespace clientCore {
    /**
     * 奖励详情 奖励展示专用
     * 1花精灵   2花精灵王   3服装  4其他 5角色  6活动  7家具
     */
    export class RewardDetailInfo {
        public rewardArr: number[][];
        /**需要打上newtag标签的id数组 */
        public newTagIdArr: number[];
        /**需要打上即将下架标签的id数组 */
        public downIdArr: number[];
        public rateInfohashMap: util.HashMap<number>;
        constructor() {
            this.rewardArr = [[], [], [], [], [], [], [], []];
            this.newTagIdArr = [];
            this.rateInfohashMap = new util.HashMap();
        }
    }
}