namespace newyear2021{
    export class NewYear2021Control implements clientCore.BaseControl{
        sign: number;
        constructor(){}
        getInfo(): Promise<void>{
            return net.sendAndWait(new pb.cs_new_years_active_panel()).then((msg: pb.sc_new_years_active_panel)=>{
                let model: NewYear2021Model = clientCore.CManager.getModel(this.sign) as NewYear2021Model;
                model.initMsg(msg);
            });
        }

        /**
         * 自动填字
         * @param handler 
         */
        setCouplet(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_new_years_active_write_word()).then(()=>{
                handler?.run();
            });
        }

        /**
         * 获取填字奖励
         * @param idx 
         * @param handler 
         */
        getCoupletReward(idx: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_new_years_active_get_write_word_reward({idx: idx})).then((msg: pb.sc_new_years_active_get_write_word_reward)=>{
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /**
         * 兑换衣服
         * @param pos 
         * @param id 
         * @param handler 
         */
        exchangeReward(pos: number,id: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_new_years_active_exchange_cloth({pos: pos,id: id})).then((msg: pb.sc_new_years_active_exchange_cloth)=>{
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
    }
}