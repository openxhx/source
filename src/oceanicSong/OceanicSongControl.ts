namespace oceanicSong {
    export class OceanicSongControl implements clientCore.BaseControl {
        //#region 购买套装
        public buySuit(period: number, idxs: Array<number>, flag: number, handler: Laya.Handler, index : number ): Promise<void> {
            return net.sendAndWait(new pb.cs_ocean_song_buy_cloth({
                period: period,
                idxs: idxs,
                flag: flag
            })).then((msg: pb.sc_ocean_song_buy_cloth) => {
                alert.showReward(msg.items);
                handler.runWith(index);
            }).catch(() => {
                handler.runWith(null);
            })
        }
        //#endregion

        //#region 1元购
        public init1BuyPanel(handler: Laya.Handler): Promise<void> {
            return net.sendAndWait(new pb.cs_ocean_song_panel()).then((msg: pb.sc_ocean_song_panel) => {
                handler.runWith(msg);
            }).catch(() => {
                handler.runWith(null);
            });
        }
        //兑换
        public getExchange(handler: Laya.Handler): Promise<void> {
            return net.sendAndWait(new pb.cs_ocean_song_exchange_cloth()).then((msg: pb.sc_ocean_song_exchange_cloth) => {
                alert.showReward(msg.items);
                handler.runWith(msg);
            }).catch(() => {
                handler.runWith(null);
            });
        }
        //#endregion


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

        //#region 弥蓝之情
        getDiscount(id: number): Promise<pb.sc_get_common_turntable_info> {
            return net.sendAndWait(new pb.cs_get_common_turntable_info({ id: id })).then((msg: pb.sc_get_common_turntable_info) => {
                return Promise.resolve(msg);
            });
        }
                
        /**
         * 开始抽奖
         * @param id 
         */
        draw(id: number): Promise<pb.sc_common_turntable_draw> {
            return net.sendAndWait(new pb.cs_common_turntable_draw({ id: id })).then((msg: pb.sc_common_turntable_draw) => {
                return Promise.resolve(msg);
            });
        }

        /**
         * 获取集齐奖励
         * @param id 
         * @param handler 
         */
        getReward(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_common_turntable_reward({ id: id })).then((msg: pb.sc_get_common_turntable_reward) => {
                if (id == 4) util.RedPoint.reqRedPointRefresh(23901);
                alert.showReward(msg.items);
                handler?.run();
            });
        }
        //#endregion
    }
}
