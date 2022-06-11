namespace anniversary2021 {
    export class Anniversary2021Control implements clientCore.BaseControl {

        /**
         * 获取面板信息
         * @param model
         */
        getInfo(model: Anniversary2021Model): Promise<void> {
            return net.sendAndWait(new pb.cs_anniversary_panel()).then((msg: pb.sc_anniversary_panel) => {
                // model.count = msg.leftNum;
                // model.rewardIdx = msg.rewardF;
                // model.buyTimes = msg.buyItems;
                model.petRewardIdx = msg.babyRewardFlag;
            });
        }

        /**
         * 获取二期面板信息
         * @param model
         */
        getTwoInfo(model: Anniversary2021Model): Promise<void> {
            return net.sendAndWait(new pb.cs_anniversary_two_stage_panel()).then((msg: pb.sc_anniversary_two_stage_panel) => {
                model.dailyBuy = msg.dailySixBuyFlag;
            });
        }

        /**
         * 缤纷色彩购买和领取
         * @param type 从左到右 1-3
         * @param handler
         */
        getColorful(type: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_anniversary_buy_cloth({type: type})).then((msg: pb.sc_anniversary_buy_cloth) => {
                alert.showReward(msg.items);
                handler.runWith(msg.leftNum);
            }).catch(() => {
                handler.runWith(-1);
            });
        }

        /**
         * 购买
         * @param id
         * @param mod
         * @param handler
         */
        buy(id: number, mod: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_exchange({
                exchangeId: id,
                activityId: mod
            })).then((msg: pb.sc_common_exchange) => {
                alert.showReward(msg.item);
                handler ?.run();
            });
        }

        /**
         * 获得折扣
         * @param model 数据项
         */
        getDiscount(model: Anniversary2021Model, id: number): Promise<void> {
            return net.sendAndWait(new pb.cs_get_common_turntable_info({id: id})).then((msg: pb.sc_get_common_turntable_info) => {
                model.discount = msg.discount;
                model.times = msg.cnt;
                return Promise.resolve();
            });
        }

        /**
         * 开始抽奖
         * @param id
         */
        draw(id: number): Promise<pb.sc_common_turntable_draw> {
            return net.sendAndWait(new pb.cs_common_turntable_draw({id: id})).then((msg: pb.sc_common_turntable_draw) => {
                return Promise.resolve(msg);
            });
        }

        /**
         * 获取集齐奖励
         * @param id
         * @param handler
         */
        getReward(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_common_turntable_reward({id: id})).then((msg: pb.sc_get_common_turntable_reward) => {
                if (id == 4) util.RedPoint.reqRedPointRefresh(23901);
                alert.showReward(msg.items);
                handler ?.run();
            });
        }

        /** 领取坐骑*/
        getRider(id: number, hander: Laya.Handler): void {
            net.sendAndWait(new pb.cs_anniversary_get_collect_rewards({type: id})).then((msg: pb.sc_anniversary_get_collect_rewards) => {
                alert.showReward(msg.items);
                switch (id) {
                    case 1:
                        util.RedPoint.reqRedPointRefresh(23902);
                        break;
                    case 2:
                        clientCore.UserHeadManager.instance.getOneInfoById(2500038).have = true;
                        break;
                    case 3:
                        clientCore.UserHeadManager.instance.getOneInfoById(2500039).have = true;
                        break;
                    case 4:
                        clientCore.UserHeadManager.instance.getOneInfoById(2500040).have = true;
                        break;
                }
                hander ?.run();
            });
        }

        /** 获取眠花祈福奖励*/
        getFlowerReward(type: number, id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_anniversary_rank_activity_reward({
                type: type,
                id: id
            })).then((msg: pb.sc_get_anniversary_rank_activity_reward) => {
                alert.showReward(msg.items);
                handler ?.run();
            })
        }

        /**
         * 花宝赠礼
         * @param index
         */
        getPetReward(index: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_anniversary_baby_reward({babyLev: index})).then((msg: pb.sc_get_anniversary_baby_reward) => {
                alert.showReward(msg.items);
                handler ?.run();
            })
        }

        /**
         * 缤纷色彩第三期免费领取
         * @param handler
         */
        getTree(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_anniversary_three_stage_get_cloth()).then((msg: pb.sc_anniversary_three_stage_get_cloth) => {
                alert.showReward(msg.items);
                handler ?.run();
            });
        }
    }
}