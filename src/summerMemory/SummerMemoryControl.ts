namespace summerMemory {
    export class SummerMemoryControl implements clientCore.BaseControl {
        /** 面板信息*/
        public getInfo(): Promise<pb.sc_summer_memory_panel> {
            return net.sendAndWait(new pb.cs_summer_memory_panel()).then((msg: pb.sc_summer_memory_panel) => {
                return Promise.resolve(msg);
            });
        }

        /**领取人气值奖励 */
        public getReward(pos: number, id: number) {
            net.sendAndWait(new pb.cs_summer_memory_exchange_award({ pos: pos, id: id })).then((msg: pb.sc_summer_memory_exchange_award) => {
                alert.showReward(msg.items, null, {
                    callBack: {
                        caller: this, funArr: [() => {
                            EventManager.event("MOKA_REWARD_BACK");
                        }]
                    }
                });
            });
        }
    }
}