namespace playground {
    export class PlaygroundControl implements clientCore.BaseControl {
        constructor() { }

        /** 获取面板信息*/
        public getInfo(): Promise<pb.sc_flower_land_panel> {
            return net.sendAndWait(new pb.cs_flower_land_panel()).then((msg: pb.sc_flower_land_panel) => {
                return Promise.resolve(msg);
            })
        }

        /**
         * 摇骰子
         * @param type 骰子类型 1普通 2特殊
         * @param score 特殊骰子掷出的点数 ， 普通骰子可传0
         * @param gardenType 花园类型 1普通 2神秘
         * @param handler 
         */
        public shakeDice(type: number, score: number, gardenType: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_land_event({ type: type, score: score, flowerType: gardenType })).then((msg: pb.sc_flower_land_event) => {
                handler?.runWith(msg);
            }).catch(() => {
                handler?.run();
            })
        }

        /**
         * 购买骰子
         * @param type 1-普通 2-特殊
         * @param num 购买数量
         */
        public buyDice(type: number, num: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_land_buy_dice({ type: type })).then((msg: pb.sc_flower_land_buy_dice) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                handler?.run();
            })
        }

        /**
         * 每日领取
         * @param type 1普通 2花宝 3任务
         * @param handler 
         */
        public getDaily(type: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_land_get_dice({ type: type })).then((msg: pb.sc_flower_land_get_dice) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                handler?.runWith(msg);
            })
        }

        /** 进入神秘花园*/
        public enterGarden(): Promise<number> {
            return net.sendAndWait(new pb.cs_flower_land_go_mystery_land()).then((msg: pb.sc_flower_land_go_mystery_land) => {
                return Promise.resolve(msg.score);
            });
        }

        /**
         * 命运占卜
         */
        public randomEvent(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_land_destiny_divination()).then((msg: pb.sc_flower_land_destiny_divination) => {
                handler?.runWith(msg);
            })
        }

        /**
         * 命运抉择
         * @param id
         * @param choice 
         * @param handler 
         */
        public destinyChoice(id: number, choice: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_land_destiny_choice({ eventId: id, choserId: choice })).then((msg: pb.sc_flower_land_destiny_choice) => {
                handler?.runWith(msg);
            });
        }

        /** 能量兑换骰子*/
        public exchangeDice(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_land_get_energy_dice()).then((msg: pb.sc_flower_land_get_energy_dice) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                handler?.run();
            })
        }

        /** 查询活动面板信息*/
        public queryActivity(): Promise<pb.sc_flower_land_get_active_reward_panel> {
            return net.sendAndWait(new pb.cs_flower_land_get_active_reward_panel()).then((msg: pb.sc_flower_land_get_active_reward_panel) => {
                return Promise.resolve(msg);
            })
        }


        /** 获取活动奖励*/
        public getReward(array: number[], handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_land_get_active_reward({ index: array })).then((msg: pb.sc_flower_land_get_active_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                handler.run();
            })
        }

        /** 集齐领取*/
        public getCloth(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_land_get_mystery_reward()).then((msg: pb.sc_flower_land_get_mystery_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                handler && handler.run();
            })
        }
    }
}