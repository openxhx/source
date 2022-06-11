namespace inspirationCrisis {
    export class InspirationCrisisControl implements clientCore.BaseControl {
        public model: InspirationCrisisModel;

        /** 面板信息*/
        public getInfo(): Promise<pb.sc_inspire_crisis_panel> {
            return net.sendAndWait(new pb.cs_inspire_crisis_panel()).then((msg: pb.sc_inspire_crisis_panel) => {
                return Promise.resolve(msg);
            });
        }

        /** 奖励兑换*/
        public exchange(handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_inspire_crisis_exchange()).then((msg: pb.sc_inspire_crisis_exchange) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        /** 领取奖励*/
        public exchangeAward(id: number, pos: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_inspire_crisis_exchange_award({ id: id, pos: pos })).then((msg: pb.sc_inspire_crisis_exchange_award) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        /** 购买*/
        public commonBuy(handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_common_buy({ activityId: this.model.activityId })).then((msg: pb.sc_common_buy) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}