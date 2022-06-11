namespace fullRedPomole {
    export class FullRedPomoleControl implements clientCore.BaseControl {
        //获取奖励
        public getReward(list: number[]) {
            return net.sendAndWait(new pb.cs_song_of_flower_reward({ list: list })).then((msg: pb.sc_song_of_flower_reward) => {
                return Promise.resolve(msg);
            });
        }
    }
}
