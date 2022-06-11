namespace lostDream {
    export class LostDreamControl implements clientCore.BaseControl {
        constructor() { }

        /** 面板奖励信息*/
        public getInfo(): Promise<pb.sc_lenis_dream_panel> {
            return net.sendAndWait(new pb.cs_lenis_dream_panel()).then((msg: pb.sc_lenis_dream_panel) => {
                return Promise.resolve(msg);
            });
        }

        /** 扫荡*/
        public sweepBattle(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_lenis_dream_mopping_up()).then((msg: pb.sc_lenis_dream_mopping_up) => {
                EventManager.event(globalEvent.UPDATE_LOST_DREAM);
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                handler?.run();
            })
        }

        /** 开启梦境*/
        public openDream(index: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_lenis_dream_movie_flag({ flag: 1, index: index })).then((msg: pb.sc_lenis_dream_movie_flag) => {
                handler?.run();
            })
        }


        /** 领奖*/
        public getReward(index: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_lenis_dream_reward({ getRewardIdx: index })).then((msg: pb.sc_get_lenis_dream_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                util.RedPoint.reqRedPointRefresh(9001);
                handler?.run();
            });
        }
    }
}