namespace spacetimeDetective {
    export class SpacetimeDetectiveControl implements clientCore.BaseControl {
        //获取面板
        public getPanelInfo(): Promise<pb.sc_space_time_detective_info> {
            return net.sendAndWait(new pb.cs_space_time_detective_info()).then((msg: pb.sc_space_time_detective_info) => {
                return Promise.resolve(msg);
            });
        }

        //领取火光支援
        public getSupportReward(): Promise<pb.sc_space_time_detective_sign> {
            return net.sendAndWait(new pb.cs_space_time_detective_sign()).then((msg: pb.sc_space_time_detective_sign) => {
                return Promise.resolve(msg);
            });
        }
        /**
         * 点亮
         */
        public lightingCapter(index: number, flag: number): Promise<pb.sc_space_time_detective_light> {
            return net.sendAndWait(new pb.cs_space_time_detective_light({ index: index, flag: flag })).then((msg: pb.sc_space_time_detective_light) => {
                return Promise.resolve(msg);
            });
        }
        /**
         * 获得游戏fun 1~4
         */
        public getFunIndex(): Promise<pb.sc_get_space_time_detective_game> {
            return net.sendAndWait(new pb.cs_get_space_time_detective_game()).then((msg: pb.sc_get_space_time_detective_game) => {
                return Promise.resolve(msg);
            });
        }

        /**
         * 触摸火光 - 获取篝火奖励
         */
        public getBonfireReward(): Promise<pb.sc_space_time_detective_fire> {
            return net.sendAndWait(new pb.cs_space_time_detective_fire()).then((msg: pb.sc_space_time_detective_fire) => {
                return Promise.resolve(msg);
            });
        }
        /**
         * 拾取 - 领取章节奖励
         */
        public getCapterReward(capter: number): Promise<pb.sc_get_space_time_detective_reward> {
            return net.sendAndWait(new pb.cs_get_space_time_detective_reward({ index: capter })).then((msg: pb.sc_get_space_time_detective_reward) => {
                return Promise.resolve(msg);
            });
        }
        /**
         * 获取解锁奖励
         */
        public getUnlockReward(flag: number): Promise<pb.sc_space_time_detective_unlock> {
            return net.sendAndWait(new pb.cs_space_time_detective_unlock({ flag: flag })).then((msg: pb.sc_space_time_detective_unlock) => {
                return Promise.resolve(msg);
            });
        }
        /**
         * 获取解锁奖励
         */
        public getAnswerReward(flag: number, tf: number): Promise<pb.sc_space_time_detective_answer> {
            return net.sendAndWait(new pb.cs_space_time_detective_answer({ flag: flag, tf: tf })).then((msg: pb.sc_space_time_detective_answer) => {
                return Promise.resolve(msg);
            });
        }
    }
}