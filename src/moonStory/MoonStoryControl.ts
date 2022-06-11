namespace moonStory {
    export class MoonStoryControl implements clientCore.BaseControl {
        /**面板信息 */
        public getInfo() {
            return net.sendAndWait(new pb.cs_year_of_flower_love_stream_get_info()).then((msg: pb.sc_year_of_flower_love_stream_get_info) => {
                return Promise.resolve(msg);
            });
        }

        /**领取奖励 
         * 1 领取背景秀和舞台  2 领取活跃值奖励  3 领取累计消耗奖励
         */
        public getReward(type: number, index: number) {
            return net.sendAndWait(new pb.cs_year_of_flower_love_stream_get_reward({ flag: type, index: index })).then((msg: pb.sc_year_of_flower_love_stream_get_reward) => {
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
            return net.sendAndWait(new pb.cs_year_of_flower_love_stream_get_energy_cnt()).then((msg: pb.sc_year_of_flower_love_stream_get_energy_cnt) => {
                return Promise.resolve(msg);
            });
        }

        /**获取购买记录 */
        public getBuyInfo() {
            return net.sendAndWait(new pb.cs_year_of_flower_love_stream_top_cloud_buy_history()).then((msg: pb.sc_year_of_flower_love_stream_top_cloud_buy_history) => {
                return Promise.resolve(msg);
            }).catch(() => {
                return null;
            });
        }
    }
}