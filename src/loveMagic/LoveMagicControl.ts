namespace loveMagic{
    export class LoveMagicControl implements clientCore.BaseControl{


        /**
         * 获取面板信息
         * @param model 
         */
        public getInfo(model: LoveMagicModel): Promise<void>{
            return net.sendAndWait(new pb.cs_love_magic_panel()).then((msg: pb.sc_love_magic_panel)=>{
                model.bubbleTimes = msg.gameBalloonTimes;
                model.collectTimes = msg.gameDoughnutTimes;
                model.exchangeTimes = msg.exchangeFlag;
            })
        }

        public checkFirst(model: LoveMagicModel): Promise<void>{
            return clientCore.MedalManager.getMedal([MedalConst.LOVEMAGIC_OPEN]).then((data: pb.ICommonData[])=>{
                model.isFirst = data[0].value == 0;
            });
        }

        /**
         * 服装兑换
         * @param index 
         * @param id 
         * @param handler 
         */
        public getCloth(index: number,id: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_love_magic_exchange_cloth({pos: index,id: id})).then((msg: pb.sc_love_magic_exchange_cloth)=>{
                util.RedPoint.reqRedPointRefresh(25701);
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /** 开始游戏*/
        public startGame(id: number,handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_mini_game_begin({ stageId: id })).then(() => {
                handler?.run();
            })
        }

        /** 结束游戏*/
        public overGame(id: number,score: 0 | 1,handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_mini_game_over({ stageId: id, score: score})).then((msg: pb.sc_mini_game_over) => {
                alert.showReward(msg.rewardInfo);
                handler?.run();
            })
        }

        /**
         * 奖励兑换
         * @param id 
         * @param mod 
         * @param handler 
         */
        public exchange(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_love_magic_exchange_item()).then((msg: pb.sc_love_magic_exchange_item)=>{
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /**
         * 称号领取
         */
        public getTitle(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_love_magic_get_title()).then((msg: pb.sc_love_magic_get_title)=>{
                util.RedPoint.reqRedPointRefresh(25702);
                alert.showReward(msg.items);
                handler?.run();
            });
        }
    }
}