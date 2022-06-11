namespace springOrchard{
    export class SpringOrchardControl implements clientCore.BaseControl{
        
        getInfo(model: SpringOrchardModel): Promise<void>{
            return net.sendAndWait(new pb.cs_get_spring_fruit_garden_info()).then((msg: pb.sc_get_spring_fruit_garden_info)=>{
                model.times = msg.counts;
            })
        }

        getMedal(model: SpringOrchardModel): Promise<void>{
            return clientCore.MedalManager.getMedal([MedalConst.SPRING_ORCHARD_OPEN]).then((msg: pb.ICommonData[])=>{
                model.isFrist = msg[0].value == 0;
            });
        }

        gameResult(times: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_play_spring_fruit_garden_game({counts: times})).then((msg: pb.sc_play_spring_fruit_garden_game)=>{
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        getReward(id: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_get_spring_fruit_garden_rewards({id: id})).then((msg: pb.sc_get_spring_fruit_garden_rewards)=>{
                alert.showReward(msg.items);
                handler?.run();
            });
        }
    }
}