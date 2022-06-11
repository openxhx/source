namespace luckyBamboo {
    export class LuckyBambooControl implements clientCore.BaseControl {
        public _model: LuckyBambooModel;
        /**自己的信息 */
        public getSelfInfo() {
            return net.sendAndWait(new pb.cs_luck_bamboo_self_panel()).then((msg: pb.sc_luck_bamboo_self_panel) => {
                return Promise.resolve(msg);
            });
        }

        /**获取别人的信息 */
        public getOtherInfo(id: number) {
            return net.sendAndWait(new pb.cs_luck_bamboo_other_panel({ uid: id })).then((msg: pb.sc_luck_bamboo_other_panel) => {
                return Promise.resolve(msg);
            });
        }

        /**给自己浇水 */
        public waterSelf(type: number) {
            return net.sendAndWait(new pb.cs_luck_bamboo_water_self({ type: type })).then((msg: pb.sc_luck_bamboo_water_self) => {
                return Promise.resolve(msg);
            }).catch(() => {
                return Promise.resolve(null);
            });
        }

        /**给好友浇水 */
        public waterOther(id: number) {
            return net.sendAndWait(new pb.cs_luck_bamboo_water_other({ uid: id })).then((msg: pb.sc_luck_bamboo_water_other) => {
                return Promise.resolve(msg);
            }).catch(() => {
                return Promise.resolve(null);
            });
        }

        /**领取随机奖励 */
        public getDailyeward(id: number) {
            return net.sendAndWait(new pb.cs_luck_bamboo_get_autogeneration_reward({ uid: id })).then((msg: pb.sc_luck_bamboo_get_autogeneration_reward) => {
                return Promise.resolve(msg);
            }).catch(() => {
                return Promise.resolve(null);
            });
        }
    }
}