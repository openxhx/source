namespace anniversary {
    export class AnniversaryControl implements clientCore.BaseControl {
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

        /**监听密码通知 */
        public listenCode() {
            net.listen(pb.sc_notify_year_of_flower_love_stream_magic_passwd, this, this.eventCode);
        }

        /**取消监听密码通知 */
        public cancleListenCode() {
            net.unListen(pb.sc_notify_year_of_flower_love_stream_magic_passwd, this, this.eventCode);
        }

        /**事件通知密码内容 */
        private eventCode(msg: pb.sc_notify_year_of_flower_love_stream_magic_passwd) {
            EventManager.event("ANNIVERSARY_GET_CODE", msg.magicPasswd);
        }

        /**获取抽奖信息 */
        public getDrawInfo() {
            return net.sendAndWait(new pb.cs_spirit_tree_get_draw_times_info()).then((msg: pb.sc_spirit_tree_get_draw_times_info) => {
                return Promise.resolve(msg);
            });
        }

        /**获取背景秀全服限量 
         * @param flag 0不锁定  1锁定
        */
        public getLimitInfo(flag: number) {
            return net.sendAndWait(new pb.cs_year_of_flower_love_stream_get_bg_limit({ isLock: flag })).then((msg: pb.sc_year_of_flower_love_stream_get_bg_limit) => {
                return Promise.resolve(msg);
            });
        }

        /**解锁背景秀占位 */
        public unlockLimit() {
            return net.sendAndWait(new pb.cs_year_of_flower_love_stream_unlock_bg());
        }

        /**获取晃一晃能量值 */
        public getEnergyInfo() {
            return net.sendAndWait(new pb.cs_year_of_flower_love_stream_get_energy_cnt()).then((msg: pb.sc_year_of_flower_love_stream_get_energy_cnt) => {
                return Promise.resolve(msg);
            });
        }

        /**获取云翳之巅面板数据 */
        public getSellInfo() {
            return net.sendAndWait(new pb.cs_year_of_flower_love_stream_top_cloud_get_info()).then((msg: pb.sc_year_of_flower_love_stream_top_cloud_get_info) => {
                return Promise.resolve(msg);
            });
        }

        /**云翳之巅购买套装 */
        public buyCloudTop(off: number) {
            return net.sendAndWait(new pb.cs_year_of_flower_love_stream_top_cloud_buy({ discount: off })).then((msg: pb.sc_year_of_flower_love_stream_top_cloud_buy) => {
                return Promise.resolve(msg);
            }).catch(() => {
                return null;
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

        /**监听购买信息 */
        public listenBuy() {
            net.listen(pb.sc_year_of_flower_love_stream_top_cloud_notify, this, this.eventBuyInfo);
        }

        /**事件通知购买信息 */
        private eventBuyInfo(msg: pb.sc_year_of_flower_love_stream_top_cloud_notify) {
            EventManager.event("ANNIVERSARY_GET_BUY_INFO", msg.buyHistory);
        }

        /**取消监听购买信息 */
        public cancleListenBuy() {
            net.unListen(pb.sc_year_of_flower_love_stream_top_cloud_notify, this, this.eventCode);
        }
    }
}