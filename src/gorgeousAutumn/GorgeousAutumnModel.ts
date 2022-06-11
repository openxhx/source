namespace gorgeousAutumn {
    export class GorgeousAutumnModel {
        private static _model: GorgeousAutumnModel;
        private constructor() { };
        public static get instance(): GorgeousAutumnModel {
            if (!this._model) {
                this._model = new GorgeousAutumnModel();
            }
            return this._model;
        }
        /**玩家性别 */
        public sex: number;
        /**当前步骤 */
        public curStep: number;
        /**奖励配置 */
        public rewardConfig: xls.pair[];
        /**素材配置 */
        public materialConfig: xls.colourfulautumn[];
        /**套装id */
        private readonly suitId: number = 2110480;
        /**上色奖励 */
        public dyeingReward: pb.IItem[];
        /**初始化配置 */
        public initConfig() {
            if (!this.rewardConfig) {
                this.sex = clientCore.LocalInfo.sex;
                this.materialConfig = xls.get(xls.colourfulautumn).getValues();
                this.rewardConfig = [];
                for (let i: number = 0; i < this.materialConfig.length; i++) {
                    this.rewardConfig.push(this.materialConfig[i].reward[this.sex - 1]);
                }
                this.getCurStep();
            }
        }

        /**获取当前步骤的素材 */
        public getCurConfig(): xls.colourfulautumn {
            if (this.isFinish()) {
                alert.showFWords('已完成所有上色！');
                return null;
            }
            return this.materialConfig[this.curStep];
        }

        /**判断当前步骤 */
        private getCurStep() {
            this.curStep = this.rewardConfig.length - 1;
            for (let i: number = 0; i < this.rewardConfig.length; i++) {
                if (!clientCore.ItemsInfo.checkHaveItem(this.rewardConfig[i].v1)) {
                    this.curStep = i;
                    break;
                }
            }
        }

        /**是否可以领取翅膀 */
        public canGetVipReward() {
            return clientCore.FlowerPetInfo.petType == 3 && this.isFinish() && !clientCore.ItemsInfo.checkHaveItem(this.rewardConfig[this.rewardConfig.length - 1].v1);
        }

        /**是否制作完毕 */
        public isFinish() {
            return this.curStep >= this.rewardConfig.length - 1;
        }

        /**试穿套装 */
        public trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
        }
    }
}