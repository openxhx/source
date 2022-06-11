namespace colorsGo {
    export class ColorsGoControl implements clientCore.BaseControl {
        public model: ColorsGoModel;

        /** 购买*/
        public buy(id: number, thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_colorful_every_day_go_buy({ id: id })).then((msg: pb.sc_colorful_every_day_go_buy) => {
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        /** 领取奖励*/
        public reward(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_colorful_every_day_go_get_reward({ issue: this.model.issue })).then((msg: pb.sc_colorful_every_day_go_get_reward) => {
                if (this.model) {
                    util.RedPoint.reqRedPointRefresh(this.model.redPointId);
                }
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }


        public dispose(): void {
            this.model = null;
        }
    }
}