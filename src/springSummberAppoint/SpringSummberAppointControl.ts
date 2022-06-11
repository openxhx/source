namespace springSummberAppoint{
    export class SpringSummberAppointControl implements clientCore.BaseControl{

        /**
         * 获得折扣
         * @param model 数据项
         */
        getDiscount(model: SpringSummberAppointModel, id: number): Promise<void> {
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
        getReward(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_common_turntable_reward({ id: id })).then((msg: pb.sc_get_common_turntable_reward) => {
                if (id == 4) util.RedPoint.reqRedPointRefresh(23901);
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /**
         * 获得购买名单
         * @param handler 
         */
        getBuyList(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_season_appoint_buy_history()).then((msg: pb.sc_season_appoint_buy_history)=>{
                handler?.runWith([msg.buyHistory]);
            });
        }

        /** 查询购买情况*/
        query(): Promise<pb.sc_season_appoint_panel>{
            return net.sendAndWait(new pb.cs_season_appoint_panel()).then((msg: pb.sc_season_appoint_panel)=>{
                return Promise.resolve(msg);
            });
        }
        
        /** 购买衣服*/
        buyCloth(discount: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_season_appoint_buy({discount: discount})).then((msg: pb.sc_season_appoint_buy)=>{
                alert.showReward(msg.item);
                handler.run();
            });
        }

        /** 领取坐骑*/
        getComReward(id: number, hander: Laya.Handler): void {
            net.sendAndWait(new pb.cs_anniversary_get_collect_rewards({ type: id })).then((msg: pb.sc_anniversary_get_collect_rewards) => {
                alert.showReward(msg.items);
                hander?.run();
            });
        }
    }
}