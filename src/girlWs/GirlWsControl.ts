namespace girlWs{
    export class GirlWsControl implements clientCore.BaseControl{

        
        /**
         * 购买
         * @param id 
         * @param mod 
         * @param handler 
         */
        buy(id: number,mod: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_common_exchange({exchangeId: id,activityId: mod})).then((msg: pb.sc_common_exchange)=>{
                alert.showReward(msg.item);
                handler?.run();
            });
        }

        /**
         * 获得折扣
         * @param model 数据项
         */
        getDiscount(model: GirlWsModel): Promise<void>{
            return net.sendAndWait(new pb.cs_get_common_turntable_info({id: model.DRAW_ID})).then((msg: pb.sc_get_common_turntable_info)=>{
                model.discount = msg.discount;
                model.times = msg.cnt;
                return Promise.resolve();
            });
        }

        /**
         * 开始抽奖
         * @param id 
         */
        draw(id: number): Promise<pb.sc_common_turntable_draw>{
            return net.sendAndWait(new pb.cs_common_turntable_draw({id: id})).then((msg: pb.sc_common_turntable_draw)=>{
                return Promise.resolve(msg);
            });
        }

        /**
         * 获取集齐奖励
         * @param id 
         * @param handler 
         */
        getReward(id: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_get_common_turntable_reward({id: id})).then((msg: pb.sc_get_common_turntable_reward)=>{
                util.RedPoint.reqRedPointRefresh(23901);
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /** 领取坐骑*/
        getRider(hander: Laya.Handler): void{
            net.sendAndWait(new pb.cs_girls_colorful_star_get_rewards()).then((msg: pb.sc_girls_colorful_star_get_rewards)=>{
                util.RedPoint.reqRedPointRefresh(23902);
                alert.showReward(msg.items);
                hander?.run();
            });
        }
    }
}