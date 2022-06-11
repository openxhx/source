namespace mermaidLove{
    export class MermaidLoveControl implements clientCore.BaseControl{


        getInfo(sign: number): Promise<void>{
            return net.sendAndWait(new pb.cs_get_mermaid_of_love_info()).then((msg: pb.sc_get_mermaid_of_love_info)=>{
                let model: MermaidLoveModel = clientCore.CManager.getModel(sign) as MermaidLoveModel;
                model.rewardIdx = msg.rewardF;
                model.buyTimes = msg.buyItems;
            });
        }

        getReward(type: number,id: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_get_mermaid_of_love_reward({type: type,id: id})).then((msg: pb.sc_get_mermaid_of_love_reward)=>{
                alert.showReward(msg.items);
                handler.run();
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