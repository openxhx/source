namespace pirateBucket {
    export class PirateBucketControl implements clientCore.BaseControl {
        /** 面板信息*/
        public getMissionInfo(): Promise<pb.sc_joy_pirate_barrel_get_info> {
            return net.sendAndWait(new pb.cs_joy_pirate_barrel_get_info()).then((msg: pb.sc_joy_pirate_barrel_get_info) => {
                return Promise.resolve(msg);
            });
        }

        /** 点击领奖*/
        public getMissionReward(mission: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_joy_pirate_barrel_get_reward({ taskIndex: mission })).then((msg: pb.sc_joy_pirate_barrel_get_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                handler?.run();
            });
        }
    }
}