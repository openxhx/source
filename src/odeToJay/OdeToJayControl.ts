namespace odeToJay{
    export class OdeToJayControl implements clientCore.BaseControl{


        /**
         * 获取面板信息
         * @param model 
         */
        public getInfo(model: OdeToJayModel): Promise<void>{
            return net.sendAndWait(new pb.cs_ode_to_joy_panel()).then((msg: pb.sc_ode_to_joy_panel)=>{
                model.rewardIdx = msg.getTaskReward;
                model.hasReward = msg.getDailyReward == 1;
                model.cleanTimes = 3 - msg.cleanUpTimes;
                model.linkTimes = 3 - msg.linkGameTimes;
                model.bossTimes = 3 - msg.fightTimes;
            })
        }

        /**
         * 检查是否第一次打开
         * @param model 
         */
        public checkFrist(model: OdeToJayModel): Promise<void>{
            return clientCore.MedalManager.getMedal([MedalConst.OED_TO_JAY_OPEN]).then((data: pb.ICommonData[])=>{
                model.isFristTime = data[0].value == 0;
            })
        }

        /**
         * 领取奖励
         * @param pos 
         * @param handler 
         */
        public getReward(pos: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_ode_to_joy_get_task_reward({idx: pos})).then((msg: pb.sc_ode_to_joy_get_task_reward)=>{
                alert.showReward(msg.items);
                handler?.run();
            });
        }
        
        /**
         * 每日领奖
         * @param handler 
         */
        public getDaily(): void{
            net.sendAndWait(new pb.cs_ode_to_joy_get_daily_reward()).then((msg: pb.sc_ode_to_joy_get_daily_reward)=>{
                alert.showReward(msg.items);
            });
        }


        /**
         * 扫荡
         * @param handler 
         */
        public sweep(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_ode_to_joy_get_daily_mop()).then((msg: pb.sc_ode_to_joy_get_daily_mop)=>{
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /**
         * 领取衣服
         * @param id 
         * @param handler 
         */
        public getCloth(pos: number,id: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_ode_to_joy_exchange_cloth({index: pos,id: id})).then((msg: pb.sc_ode_to_joy_exchange_cloth)=>{
                alert.showReward(msg.items);
                handler?.run();
            });
        }
    }
}