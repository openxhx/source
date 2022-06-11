namespace foreignLands{
    export class ForeignLandsControl implements clientCore.BaseControl{

        getInfo(sign: number): Promise<void>{
            return net.sendAndWait(new pb.cs_foreign_seat_panel()).then((msg: pb.sc_foreign_seat_panel)=>{
                let model: ForeignLandsModel = clientCore.CManager.getModel(sign) as ForeignLandsModel;
                model.rewardIdx = msg.rewardPos;
                model.makeTimes = msg.makeTimes;
                model.buyTimes = msg.beanBuyTimes;
            });
        }

        getReward(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_foreign_seat_get_extra_reward()).then((msg: pb.sc_foreign_seat_get_extra_reward)=>{
                util.RedPoint.reqRedPointRefresh(26301);
                alert.showReward(msg.item);
                handler.run();
            });
        }

        getCloth(pos: number,id: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_foreign_seat_get_reward({pos: pos,idx: id})).then((msg: pb.sc_foreign_seat_get_reward)=>{
                alert.showReward(msg.item);
                handler?.run();
            });
        }

        exchange(activityId: number,exchangeId: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_common_exchange({activityId: activityId,exchangeId: exchangeId})).then((msg: pb.sc_common_exchange)=>{
                alert.showReward(msg.item);
                handler.run();
            });
        }
    }
}