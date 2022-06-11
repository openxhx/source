namespace preludeToChristmas {
    export class PreludeToChristmasControl implements clientCore.BaseControl {
        public model: PreludeToChristmasModel;

        /** 面板信息*/
        public getInfo(): Promise<pb.sc_christmas_song_panel> {
            let model = this.model;
            return net.sendAndWait(new pb.cs_christmas_song_panel()).then((msg: pb.sc_christmas_song_panel) => {
                model.updateInfo(msg);
                return Promise.resolve(msg);
            });
        }

        /** 特殊奖励兑换 */
        public commonExchange(id: number, handler: Laya.Handler) {
            let model = this.model;
            return net.sendAndWait(new pb.cs_common_exchange({ activityId: this.model.activityId, exchangeId: id })).then((msg: pb.sc_common_exchange) => {
                util.RedPoint.reqRedPointRefresh(model.redPointId);
                handler?.runWith(msg);
            });
        }

        /** 购买*/
        public commonBuy(handler?: Laya.Handler) {
            let model = this.model;
            net.sendAndWait(new pb.cs_common_buy({ activityId: model.activityId })).then((msg: pb.sc_common_buy) => {
                model.buyTimes++;
                util.RedPoint.reqRedPointRefresh(model.redPointId);
                handler?.runWith(msg);
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}