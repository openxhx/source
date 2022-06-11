namespace springMedal {
    export class SpringMedalControl implements clientCore.BaseControl {
        sign: number;
        /**面板信息 */
        getInfo(): Promise<void> {
            return net.sendAndWait(new pb.cs_get_lucky_medal_info()).then((msg: pb.sc_get_lucky_medal_info) => {
                let model: SpringMedalModel = clientCore.CManager.getModel(this.sign) as SpringMedalModel;
                model.initMsg(msg);
            });
        }

        /**领取奖励 
         * 1 领取活跃值奖励  2 领取累计消耗奖励
         */
        public getReward(index: number) {
            return net.sendAndWait(new pb.cs_get_lucky_medal_reward({ index: index })).then((msg: pb.sc_get_lucky_medal_reward) => {
                return Promise.resolve(msg);
            });
        }
    }
}