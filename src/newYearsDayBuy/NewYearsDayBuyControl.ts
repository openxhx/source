namespace newYearsDayBuy {
    export class NewYearsDayBuyControl implements clientCore.BaseControl {
        public model: NewYearsDayBuyModel;

        /** 面板信息*/
        public getInfo(): Promise<pb.sc_buy_for_six_yuan_on_the_seventh_night_get_info> {
            return net.sendAndWait(new pb.cs_buy_for_six_yuan_on_the_seventh_night_get_info({ flag: 1 })).then((msg: pb.sc_buy_for_six_yuan_on_the_seventh_night_get_info) => {
                return Promise.resolve(msg);
            });
        }

        /** 领取奖励*/
        public getReward(day: number, handler: Laya.Handler) {
            let model = this.model;
            net.sendAndWait(new pb.cs_buy_for_six_yuan_on_the_seventh_night_get_reward({ flag: 1, day: day })).then((msg: pb.sc_buy_for_six_yuan_on_the_seventh_night_get_reward) => {
                util.RedPoint.reqRedPointRefresh(model.redPointId);
                handler?.runWith(msg);
            });
        }

        /** 购买礼包*/
        public buyGift(handler: Laya.Handler) {
            let model = this.model;
            clientCore.RechargeManager.pay(model.buyGiftId).then(() => {
                util.RedPoint.reqRedPointRefresh(model.redPointId);
                handler?.run();
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}