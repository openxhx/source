namespace summerDream{
    export class SummerDreamControl implements clientCore.BaseControl{
        sign:number;
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

        /**领取奖励 
         * 领取累计消耗奖励
         */
         public getReward(index: number) {
            return net.sendAndWait(new pb.cs_summer_night_feedback_get_reward({idx: index })).then((msg: pb.sc_summer_night_feedback_get_reward) => {
                return Promise.resolve(msg);
            });
        }

        /**获取晃一晃能量值 */
        public getEnergyInfo() {
            return net.sendAndWait(new pb.cs_summer_night_feedback_panel()).then((msg: pb.sc_summer_night_feedback_panel) => {
                return Promise.resolve(msg);
            });
        }

        /**获取服装限量 */
        public getLimitInfo() {
            return net.sendAndWait(new pb.cs_summer_night_panel()).then((msg: pb.sc_summer_night_panel) => {
                return Promise.resolve(msg);
            });
        }

        /**
         * 获得折扣
         * @param model 数据项
         */
         getDiscount(model: SummerDreamModel, id: number): Promise<void> {
            return net.sendAndWait(new pb.cs_get_common_turntable_info({ id: id })).then((msg: pb.sc_get_common_turntable_info) => {
                model.discount = msg.discount;
                model.times = msg.cnt;
                return Promise.resolve();
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
         getCompleteReward(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_common_turntable_reward({ id: id })).then((msg: pb.sc_get_common_turntable_reward) => {
                if (id == 4) util.RedPoint.reqRedPointRefresh(23901);
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /** 领取背景秀*/
        getComReward(id: number, hander: Laya.Handler): void {
            net.sendAndWait(new pb.cs_anniversary_get_collect_rewards({ type: id })).then((msg: pb.sc_anniversary_get_collect_rewards) => {
                alert.showReward(msg.items);
                hander?.run();
            });
        }
    }
}