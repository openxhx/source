namespace oneLeafAutumn {
    export class OneLeafAutumnControl implements clientCore.BaseControl {
        public readonly redPointId: number = 15401;     //红点id
        constructor() {

        }

        /** 获取桔梗花信息*/
        public flowerInfo(): Promise<pb.sc_flower_field_market_orange_get_info> {
            return net.sendAndWait(new pb.cs_flower_field_market_orange_get_info({})).then((msg: pb.sc_flower_field_market_orange_get_info) => {
                return Promise.resolve(msg);
            })
        }

        /** 重置*/
        public resetCard(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_field_market_orange_reset_card()).then((msg: pb.sc_flower_field_market_orange_reset_card) => {
                handler?.runWith([msg.cardInfo]);
            })
        }

        /** 翻牌子*/
        public openCard(pos: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_field_market_orange_divine({ cardPos: pos })).then((msg: pb.sc_flower_field_market_orange_divine) => {
                handler?.runWith(msg);
            }).catch(() => {
                handler?.run();
            })
        }

        /** 领取背景秀*/
        public reqBg(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_field_market_orange_get_background({})).then((msg: pb.sc_flower_field_market_orange_get_background) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.itms));
                util.RedPoint.reqRedPointRefresh(this.redPointId);
                handler?.run();
            })
        }

    }
}