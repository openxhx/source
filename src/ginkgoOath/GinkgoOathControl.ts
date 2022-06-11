namespace ginkgoOath {
    export class GinkgoOathControl implements clientCore.BaseControl {
        /**面板信息 */
        public getInfo() {
            return net.sendAndWait(new pb.cs_taobao_festival_get_info()).then((msg: pb.sc_taobao_festival_get_info) => {
                return Promise.resolve(msg);
            });
        }

        /**领取奖励 
         * 1 领取活跃值奖励  2 领取累计消耗奖励
         */
        public getReward(type: number, index: number) {
            return net.sendAndWait(new pb.cs_taobao_festival_get_reward({ flag: type, index: index })).then((msg: pb.sc_taobao_festival_get_reward) => {
                return Promise.resolve(msg);
            });
        }

        /**获取抽奖信息 */
        public getDrawInfo() {
            return net.sendAndWait(new pb.cs_spirit_tree_get_draw_times_info()).then((msg: pb.sc_spirit_tree_get_draw_times_info) => {
                return Promise.resolve(msg);
            });
        }

        /**获取晃一晃能量值 */
        public getEnergyInfo() {
            return net.sendAndWait(new pb.cs_taobao_festival_get_energy_cnt()).then((msg: pb.sc_taobao_festival_get_energy_cnt) => {
                return Promise.resolve(msg);
            });
        }
    }
}