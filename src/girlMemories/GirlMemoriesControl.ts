namespace girlMemories {
    export class GirlMemoriesControl implements clientCore.BaseControl {
        //获取线人来报奖励
        public getInformationReward(): Promise<pb.sc_get_memories_of_girls_informant_reward> {
            return net.sendAndWait(new pb.cs_get_memories_of_girls_informant_reward()).then((msg: pb.sc_get_memories_of_girls_informant_reward) => {
                return Promise.resolve(msg);
            });
        }
        //领取找茬下游戏奖励
        public getQuickspotReward(index: number, flag: number): Promise<pb.sc_memories_of_girls_reasoning_reward> {
            return net.sendAndWait(new pb.cs_memories_of_girls_reasoning_reward({ index: index, flag: flag })).then((msg: pb.sc_memories_of_girls_reasoning_reward) => {
                return Promise.resolve(msg);
            });
        }
    }
}