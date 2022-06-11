
namespace aliceParadise {
    export class AliceParadiseControl implements clientCore.BaseControl {
        //获取奖励领取情况
        public async getStatus(): Promise<number> {
            return net.sendAndWait(new pb.cs_get_alice_paradise_info()).then((msg: pb.sc_get_alice_paradise_info) => {
                return Promise.resolve(msg.rewardCnt);
            })
        }


        //领取奖励
        public getReward(getRewardIdx: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_alice_paradise_reward({ getRewardIdx: getRewardIdx })).then((msg: pb.sc_alice_paradise_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                handler.runWith(getRewardIdx - 1);
            });
        }
    }
}
