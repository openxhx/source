namespace nightRefine{
    export class NightRefineControl implements clientCore.BaseControl{


        /**
         * 获取面板信息
         * @param model 
         */
        getInfo(model: NightRefineModel): Promise<void>{
            return net.sendAndWait(new pb.cs_night_and_alchemy_panel()).then((msg: pb.sc_night_and_alchemy_panel)=>{
                model.initMsg(msg);
            })
        }

        /**
         * 领奖
         * @param model 
         */
        getReward(model: NightRefineModel,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_night_and_alchemy_receive_powder()).then((msg: pb.sc_night_and_alchemy_receive_powder)=>{
                model.gettime = msg.powderTimes;
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /**
         * 炼制
         * @param ids 
         */
        refine(ids: number[], handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_night_and_alchemy_refining({num: ids})).then((msg: pb.sc_night_and_alchemy_refining)=>{
                handler.runWith(msg);
            }).catch(()=>{
                handler.run();
            })
        }

        /**
         * 氪金炼制
         */
        moneyRefine(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_night_and_alchemy_dark_guide()).then((msg: pb.sc_night_and_alchemy_dark_guide)=>{
                alert.showReward(msg.items);
                handler?.run();
            })
        }

        /**
         * 扫荡
         * @param handler 
         */
        public sweep(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_night_and_alchemy_auto_atk_boss()).then((msg: pb.sc_night_and_alchemy_auto_atk_boss)=>{
                alert.showReward(msg.itms);
                handler?.run();
            });
        }
    }
}