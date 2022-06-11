namespace snowNightFestival {
    export class SnowNightFestivalControl implements clientCore.BaseControl {
        public _model: SnowNightFestivalModel;

        public readonly redPointId: number = 15401;     //红点id

        /** 获取翻牌子信息*/
        public openCardInfo(id: number): Promise<pb.sc_common_open_card_get_info> {
            return net.sendAndWait(new pb.cs_common_open_card_get_info({ id: id })).then((msg: pb.sc_common_open_card_get_info) => {
                return Promise.resolve(msg);
            })
        }

        /** 重置*/
        public resetCard(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_open_card_reset_card({ id: id })).then((msg: pb.sc_common_open_card_reset_card) => {
                handler?.runWith([msg.cardInfo]);
            })
        }

        /** 翻牌子*/
        public openCard(id: number, pos: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_open_card_divine({ id: id, cardPos: pos })).then((msg: pb.sc_common_open_card_divine) => {
                handler?.runWith(msg);
            }).catch(() => {
                handler?.run();
            })
        }

        /** 领取背景秀*/
        public reqBg(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_open_card_get_reward({ id: id })).then((msg: pb.sc_common_open_card_get_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.itms));
                handler?.run();
            })
        }

        /** 获取转盘信息*/
        public fyzcInfo(id:number): Promise<pb.sc_get_common_turntable_info> {
            return net.sendAndWait(new pb.cs_get_common_turntable_info({id:id})).then((msg: pb.sc_get_common_turntable_info) => {
                return Promise.resolve(msg);
            })
        }
    }
}