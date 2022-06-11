namespace chrysanthemumAlcohol {
    export class ChrysanthemumAlcoholControl implements clientCore.BaseControl {
        public model: ChrysanthemumAlcoholModel;

        /** 面板信息*/
        public getInfo() {
            return net.sendAndWait(new pb.cs_get_gloden_chrysanthemum_info()).then((msg: pb.sc_get_gloden_chrysanthemum_info) => {
                if (this.model) {
                    this.model.updateInfo(msg);
                }
            });
        }

        /** 奖励兑换*/
        public exchange(pos: number, handler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_gloden_chrysanthemum_exchange_award({ idx: pos })).then((msg: pb.sc_gloden_chrysanthemum_exchange_award) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                handler?.runWith(msg);
            });
        }

        /** 酿酒坊插花*/
        public wine(itemId: number, handler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_gloden_chrysanthemum_wine({ itemId: itemId })).then((msg: pb.sc_gloden_chrysanthemum_wine) => {
                handler?.runWith(msg);
            });
        }

        /** 酿酒*/
        public mergeFlower(itemId: number, handler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_gloden_chrysanthemum_merge_flower({ itemId: itemId })).then((msg: pb.sc_gloden_chrysanthemum_merge_flower) => {
                handler?.runWith(msg);
            });
        }

        /** 获取每日免费奖励*/
        public getFree(type: number, handler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_gloden_chrysanthemum_get_free({ type: type, cnt: type == 2 ? this.model.itemNum5 : 0 })).then((msg: pb.sc_gloden_chrysanthemum_get_free) => {
                if (this.model) {
                    this.model.freeFlag = 1;
                }
                handler?.runWith(msg);
            });
        }

        /** 购买*/
        public commonBuy(handler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_common_buy({ activityId: this.model.activityId })).then((msg: pb.sc_common_buy) => {
                if (this.model) {
                    this.model.buyTimes++;
                    clientCore.MedalManager.setMedal([{ id: MedalDailyConst.IMPOSSIBLE_TASKS_BUY, value: this.model.buyTimes }]);
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