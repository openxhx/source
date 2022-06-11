namespace forTeacherGift {
    export class ForTeacherGiftModel {
        /**奖励领取标志 */
        public rewardFlag: number;
        /**活动任务 */
        public taskConfig: xls.taskData[];
        /**任务奖励 */
        public taskReward: xls.pair[][];

        /**获取相关配置 */
        public getConfig() {
            if (!this.taskConfig) {
                this.taskReward = [];
                for (let i = 1; i <= 6; i++) {
                    let config: string[] = clientCore.GlobalConfig.getPeachRewards(i);
                    this.taskReward[i] = _.map(config, (o) => {
                        let info: string[] = o.split("_");
                        return { v1: parseInt(info[0]), v2: parseInt(info[1]) };
                    });
                }
                this.taskConfig = _.filter(xls.get(xls.taskData).getValues(), (o) => {
                    return o.type == 10
                });
            }
        }

        private static _model: ForTeacherGiftModel;
        private constructor() { };
        public static get instance(): ForTeacherGiftModel {
            if (!this._model) {
                this._model = new ForTeacherGiftModel();
            }
            return this._model;
        }
    }
}