namespace lantern2021{
    export class Lantern2021Control implements clientCore.BaseControl{


        /** 获取面板信息*/
        getInfo(sign: number): Promise<void>{
            return net.sendAndWait(new pb.cs_lantern_festival_panel()).then((msg: pb.sc_lantern_festival_panel)=>{
                let model: Lantern2021Model = clientCore.CManager.getModel(sign) as Lantern2021Model;
                model.init(msg);
            })
        }

        /**
         * 兑换衣服
         * @param pos 
         * @param id 
         * @param handler 
         */
        exchangeReward(pos: number,id: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_lantern_festival_exchange_cloth({pos: pos,id: id})).then((msg: pb.sc_new_years_active_exchange_cloth)=>{
                util.RedPoint.reqRedPointRefresh(23404);
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /**
         * 特殊奖励兑换
         * @param id 
         * @param mod 
         */
        exchange(id: number,mod: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_common_exchange({exchangeId: id,activityId: mod})).then((msg: pb.sc_common_exchange)=>{
                alert.showReward(msg.item);
                handler?.run();
            })
        }
        
        /**
         * 制作元宵
         * @param id 
         * @param handler 
         */
        makeLantern(id: number,activityId: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_common_cost_materials_exchange({exchangeId: id,activityId: activityId})).then((msg: pb.sc_common_cost_materials_exchange)=>{
                util.RedPoint.reqRedPointRefresh(23402);
                handler?.runWith(msg);
            });
        }

        /**
         * 每日领取
         */
        dailyReward(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_lantern_festival_daily_get()).then((msg: pb.sc_lantern_festival_daily_get)=>{
                util.RedPoint.reqRedPointRefresh(23401);
                alert.showReward(msg.items);
                handler?.run();
            })
        }

        /** 答题*/
        answer(id: number,ret: number,pos: number): void{
            net.sendAndWait(new pb.cs_lantern_festival_answer_question({questionId: id,result: ret,pos: pos})).then((msg: pb.sc_lantern_festival_answer_question)=>{
                util.RedPoint.reqRedPointRefresh(23403);
                alert.showReward(msg.items);
                EventManager.event(Lantern2021Constant.ANSWER_COMPLETE,[pos]);
            });
        }
    }
}