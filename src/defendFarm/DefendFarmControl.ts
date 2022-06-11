namespace defendFarm {
    export class DefendFarmControl implements clientCore.BaseControl {
        public model: DefendFarmModel;

        /** 面板信息*/
        public getInfo(): Promise<pb.sc_defend_farm_panel> {
            return net.sendAndWait(new pb.cs_defend_farm_panel()).then((msg: pb.sc_defend_farm_panel) => {
                if (this.model) {
                    this.model.updateInfo(msg);
                }
                return Promise.resolve(msg);
            });
        }

        /** 制作饼干*/
        public makeCooke(handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_defend_farm_make_cooke()).then((msg: pb.sc_defend_farm_make_cooke) => {
                if (this.model) {
                    this.model.supplyTimes++;
                }
                handler?.runWith(msg);
            });
        }

        /** 领取奖励*/
        public exchangeAward(pos: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_defend_farm_exchange({ idx: pos })).then((msg: pb.sc_defend_farm_exchange) => {
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
                    this.model.buyTimes++;
                    this.model.updateBuyTimes();
                }
                handler?.runWith(msg);
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}