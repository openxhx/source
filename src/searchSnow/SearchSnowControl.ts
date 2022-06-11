namespace searchSnow {
    export class SearchSnowControl implements clientCore.BaseControl {
        public model: SearchSnowModel;

        /** 面板信息*/
        public getInfo(): Promise<pb.sc_sweep_the_snow_panel> {
            return net.sendAndWait(new pb.cs_sweep_the_snow_panel()).then((msg: pb.sc_sweep_the_snow_panel) => {
                this.model.updateInfo(msg);
                return Promise.resolve(msg);
            });
        }

        /** 套裝奖励兑换*/
        public exchange(id: number, pos: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_sweep_the_snow_exchange({ id: id, pos: pos })).then((msg: pb.sc_sweep_the_snow_exchange) => {
                util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                handler?.runWith(msg);
            });
        }

        /** 特殊奖励兑换 */
        public commonExchange(id: number, handler: Laya.Handler) {
            return net.sendAndWait(new pb.cs_common_exchange({ activityId: this.model.activityId, exchangeId: id })).then((msg: pb.sc_common_exchange) => {
                handler?.runWith(msg);
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}