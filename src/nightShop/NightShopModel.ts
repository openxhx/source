namespace nightShop {
    export class NightShopModel {
        private static _model: NightShopModel;
        private constructor() { };
        public static get instance(): NightShopModel {
            if (!this._model) {
                this._model = new NightShopModel();
            }
            return this._model;
        }
        /**花宝爱心值 */
        public petState: number[];
        /**商店库存 */
        public shopState: number;
        /**商店库存 */
        public shopState2: number;
        /**商店状态 */
        public shopStateArr: number[] = [0, 0, 0, 0, 0, 0];
        /**奖励详情 */
        private rewardDetial: clientCore.RewardDetailInfo;

        public getNumberBit(i: number): number {
            if (i > 9) {
                return Math.floor(this.shopState2 / Math.pow(10, i - 10)) % 10;
            } else {
                return Math.floor(this.shopState / Math.pow(10, i - 1)) % 10;
            }
        }

        private checkShop(idx: number) {
            for (let i = 1; i <= 3; i++) {
                if (NightShopModel.instance.getNumberBit(3 * idx + i) != 3) {
                    return 1;
                }
            }
            return 0;
        }

        public refreshShopState() {
            for (let i = 0; i < 6; i++) {
                this.shopStateArr[i] = this.checkShop(i);
            }
        }

        public checkPet() {
            for (let i = 0; i < 8; i++) {
                if (this.petState[i] < 30) {
                    return 1;
                }
            }
            return 0;
        }

        public creatRewardDetial() {
            if (this.rewardDetial) return this.rewardDetial;
            let rewardInfo: clientCore.RewardDetailInfo = new clientCore.RewardDetailInfo();
            let config = xls.get(xls.babypresent).getValues();
            let sex = clientCore.LocalInfo.sex;
            for (let i: number = 0; i < config.length; i++) {
                let reward = [config[i].present_1[sex - 1], config[i].present_2[0], config[i].present_3[sex - 1]];
                for (let j: number = 0; j < reward.length; j++) {
                    if (xls.get(xls.itemCloth).has(reward[j].v1)) rewardInfo.rewardArr[3].push(reward[j].v1);
                    else rewardInfo.rewardArr[4].push(reward[j].v1);
                }
            }
            return rewardInfo;
        }
    }
}