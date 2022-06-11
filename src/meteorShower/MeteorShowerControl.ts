namespace meteorShower{
    export class MeteorShowerControl implements clientCore.BaseControl{


        async getSvrRank(sign: number): Promise<void>{
            let model: MeteorShowerModel = clientCore.CManager.getModel(sign) as MeteorShowerModel;
            model.ranks = await clientCore.RankManager.ins.getSrvRank(15);
        }

        async getMyRank(sign: number): Promise<void>{
            let model: MeteorShowerModel = clientCore.CManager.getModel(sign) as MeteorShowerModel;
            model.myRank = await clientCore.RankManager.ins.getUserRank(15,clientCore.LocalInfo.uid);
        }

        getInfo(sign: number): Promise<void>{
            return net.sendAndWait(new pb.cs_get_meteor_shower()).then((msg: pb.sc_get_meteor_shower)=>{
                let model: MeteorShowerModel = clientCore.CManager.getModel(sign) as MeteorShowerModel;
                model.msg = msg;
            })
        }

        /**
         * 部件兑换
         * @param pos 对应commonAward的顺序 
         * @param id 
         */
        exchange(pos: number,id: number): Promise<number>{
            return net.sendAndWait(new pb.cs_get_meteor_shower_award({pos: pos,id: id})).then((msg: pb.sc_get_meteor_shower_award)=>{
                alert.showReward(msg.items);
                return Promise.resolve(msg.commonAward);
            });
        }

        /**
         * 交换代币
         * @param id 
         * @param cnt 
         */
        convert(id: number,cnt: number): Promise<void>{
            return net.sendAndWait(new pb.cs_exchange_meteor_shower_coin({id: id,cnt: cnt})).then((msg: pb.sc_exchange_meteor_shower_coin)=>{
                let item: pb.Item = new pb.Item();
                item.id = msg.id;
                item.cnt = msg.cnt;
                alert.showReward([item]);
            });
        }
    }
}