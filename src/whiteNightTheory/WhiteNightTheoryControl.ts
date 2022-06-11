namespace whiteNightTheory {
    export class WhiteNightTheoryControl implements clientCore.BaseControl {
        /**获取签到奖励*/
        public getReward(index: number): Promise<pb.sc_get_white_night_theory_reward> {
            return net.sendAndWait(new pb.cs_get_white_night_theory_reward({ index: index })).then((msg: pb.sc_get_white_night_theory_reward) => {
                return Promise.resolve(msg);
            });
        }
    }
}