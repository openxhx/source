namespace market {

    export class MarketControl implements clientCore.BaseControl {


        constructor() { }


        /** 获取沙漠玫瑰信息*/
        public desertRoseInfo(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_field_market_desert_rose_get_info()).then((msg: pb.sc_flower_field_market_desert_rose_get_info) => {
                handler?.runWith(msg);
            })
        }

        /** 获取桔梗花信息*/
        public flowerInfo(): Promise<pb.sc_flower_field_market_orange_get_info> {
            return net.sendAndWait(new pb.cs_flower_field_market_orange_get_info({})).then((msg: pb.sc_flower_field_market_orange_get_info) => {
                return Promise.resolve(msg);
            })
        }

        /** 重置*/
        public resetCard(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_field_market_orange_reset_card()).then((msg: pb.sc_flower_field_market_orange_reset_card) => {
                handler?.runWith([msg.cardInfo]);
            })
        }

        /** 翻牌子*/
        public openCard(pos: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_field_market_orange_divine({ cardPos: pos })).then((msg: pb.sc_flower_field_market_orange_divine) => {
                handler?.runWith(msg);
            }).catch(() => {
                handler?.run();
            })
        }

        /** 领取背景秀*/
        public reqBg(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_field_market_orange_get_background({})).then((msg: pb.sc_flower_field_market_orange_get_background) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.itms));
                handler?.run();
            })
        }

        /** 第三期面板信息*/
        public moonInfo(): Promise<number> {
            return net.sendAndWait(new pb.cs_flower_field_market_orange_3_get_info()).then((msg: pb.sc_flower_field_market_orange_3_get_info) => {
                return Promise.resolve(msg.rewardStatus);
            })
        }

        /** 第三期服装购买*/
        public buyMoon(flag: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_field_market_orange_buy_suit({ suitIdx: flag })).then((msg: pb.sc_flower_field_market_orange_buy_suit) => {
                handler?.run();
            });
        }

        /** 第三期奖励领取*/
        public getReward(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_field_market_orange_get_handheld()).then((msg: pb.sc_flower_field_market_orange_get_handheld) => {
                alert.showReward(clientCore.GoodsInfo.createArray([msg.item]));
                handler?.run();
            })
        }

        /**获取童话漫游物语信息
         * 0查询，1下单，2取消
         */
        public getTaleSuitDiscountInfo(handler: Laya.Handler, type: 0 | 1 | 2) {
            net.sendAndWait(new pb.cs_fairy_tale_1st_get_qualification({ type: type })).then((msg: pb.sc_fairy_tale_1st_get_qualification) => {
                handler.runWith(msg);
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }
    }
}