namespace callPlayer {
    export class CallPlayerControl implements clientCore.BaseControl {
        public _model:CallPlayerModel;
        /**三日福利信息 */
        public reqThreeDayInfo() {
            return net.sendAndWait(new pb.cs_get_login_activity_status()).then((data: pb.sc_get_login_activity_status) => {
                return Promise.resolve(data);
            })
        }

        /**领取三日福利奖励 */
        public getThreeDayReward(curDay: number) {
            return net.sendAndWait(new pb.cs_get_login_activity_reward({ index: curDay })).then((o: pb.sc_get_login_activity_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(o.reward));
                return Promise.resolve(true);
            }).catch(() => {
                return Promise.resolve(false);
            })
        }

        /**获取老玩家回归状态 */
        public getPlayerStatue() {
            return net.sendAndWait(new pb.cs_watch_and_pick_up_the_light_get_info()).then((data: pb.sc_watch_and_pick_up_the_light_get_info) => {
                return Promise.resolve(data);
            })
        }

        /**领取奖励
         * @param type 2召唤奖励  3活跃值奖励
         */
        public getReward(type: number) {
            return net.sendAndWait(new pb.cs_watch_and_pick_up_the_light_get_reward({ type: type })).then((data: pb.sc_watch_and_pick_up_the_light_get_reward) => {
                return Promise.resolve(data);
            })
        }

        /**邀请 */
        public inviteId(id: number) {
            return net.sendAndWait(new pb.cs_watch_and_pick_up_the_light_write_uid({ uid: id })).then(() => {
                return Promise.resolve(true);
            })
        }

        /**获取成功召唤的玩家 */
        public getInvited() {
            return net.sendAndWait(new pb.cs_watch_and_pick_up_the_light_get_write_uid_info()).then((data: pb.sc_watch_and_pick_up_the_light_get_write_uid_info) => {
                return Promise.resolve(data);
            })
        }
    }
}