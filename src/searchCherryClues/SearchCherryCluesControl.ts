namespace searchCherryClues {
    export class SearchCherryCluesControl implements clientCore.BaseControl {
        //完成搜寻线索
        public finishSearchCule(index: number): Promise<pb.sc_memories_of_girls_serach_for_clues> {
            return net.sendAndWait(new pb.cs_memories_of_girls_serach_for_clues({ index: index })).then((msg: pb.sc_memories_of_girls_serach_for_clues) => {
                return Promise.resolve(msg);
            });
        }
        //获取线索的奖励
        public getSearchCuleReward(index: number, flag: number): Promise<pb.sc_memories_of_girls_serach_reward> {
            return net.sendAndWait(new pb.cs_memories_of_girls_serach_reward({ index: index, flag: flag })).then((msg: pb.sc_memories_of_girls_serach_reward) => {
                return Promise.resolve(msg);
            });
        }
    }
}