namespace hiddenElf{
    export class HiddenElfControl implements clientCore.BaseControl{
        /**
         * 获取模块信息
         * @param sign 
         */
        getInfo(sign: number): Promise<void>{
            return net.sendAndWait(new pb.cs_hidden_monster_panel()).then((msg: pb.sc_hidden_monster_panel)=>{
                let model: HiddenElfModel = clientCore.CManager.getModel(sign) as HiddenElfModel;
                model.init(msg);
            })
        }

        /**
         * 每日购买
         * @param handler 
         */
        buyDaily(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_common_buy({activityId: 109})).then(()=>{
                handler?.run();
            });
        }
        
        /**
         * 购买特殊道具
         * @param id 
         */
        buyItem(id: number): void{
            net.sendAndWait(new pb.cs_shop_buy_item({ id: id, num: 1 })).then((msg: pb.sc_shop_buy_item) => {
                alert.showReward(msg.addItems);
            });
        }

        /**
         * 提交材料
         * @param handler 
         */
        submitMaterial(id: number, cnt: number, handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_hidden_monster_submit_items({itemId: id,itemCnt: cnt})).then(()=>{
                handler?.run();
            });
        }

        /** 领取提交材料奖励*/
        getReward(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_hidden_monster_get_submit_reward()).then((msg: pb.sc_hidden_monster_get_submit_reward)=>{
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        
        /**
         * 部件兑换
         * @param pos 对应commonAward的顺序 
         * @param id 
         */
        exchange(pos: number,id: number): Promise<number>{
            return net.sendAndWait(new pb.cs_hidden_monster_get_shower_award({pos: pos,id: id})).then((msg: pb.sc_hidden_monster_get_shower_award)=>{
                util.RedPoint.reqRedPointRefresh(22201);
                alert.showReward(msg.items);
                return Promise.resolve(msg.commonAward);
            });
        }
    }
}