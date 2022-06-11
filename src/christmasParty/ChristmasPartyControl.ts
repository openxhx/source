namespace christmasParty {
    export class ChristmasPartyControl implements clientCore.BaseControl {
        public model: ChristmasPartyModel;

        /** 面板信息*/
        public getInfo(): Promise<pb.sc_christmas_party_panel> {
            let model = this.model;
            return net.sendAndWait(new pb.cs_christmas_party_panel()).then((msg: pb.sc_christmas_party_panel) => {
                model.updateInfo(msg);
                return Promise.resolve(msg);
            });
        }

        /** 套裝奖励兑换*/
        public exchange(id: number, pos: number, handler: Laya.Handler) {
            let model = this.model;
            net.sendAndWait(new pb.cs_christmas_party_get_shower_award({ id: id, pos: pos })).then((msg: pb.sc_christmas_party_get_shower_award) => {
                util.RedPoint.reqRedPointRefresh(model.redPointId);
                handler?.runWith(msg);
            });
        }

        /** 特殊奖励兑换 */
        public commonExchange(id: number, handler: Laya.Handler) {
            return net.sendAndWait(new pb.cs_common_exchange({ activityId: this.model.activityId, exchangeId: id })).then((msg: pb.sc_common_exchange) => {
                handler?.runWith(msg);
            });
        }

        /** 
         * 提交材料
         * int32 idx = 1; //下标 0或4 对应 璐璐 安德鲁
         */
        public subItem(idx: number, itemId: number, itemCnt: number, handler: Laya.Handler) {
            return net.sendAndWait(new pb.cs_christmas_party_sub_item({ idx: idx, itemId: itemId, itemCnt: itemCnt })).then((msg: pb.sc_christmas_party_sub_item) => {
                handler?.runWith(msg);
            });
        }

        /** 
         * 提交材料奖励领取
         * int32 idx = 1; //下标 0或4 对应 璐璐 安德鲁
         */
        public subGetReward(idx: number, handler: Laya.Handler) {
            return net.sendAndWait(new pb.cs_christmas_party_sub_get_reward({ idx: idx })).then((msg: pb.sc_christmas_party_sub_get_reward) => {
                handler?.runWith(msg);
            });
        }

        /** 猜猜我是谁 */
        public whoAm(times: number, handler: Laya.Handler) {
            return net.sendAndWait(new pb.cs_christmas_party_who_am({ times: times })).then((msg: pb.sc_christmas_party_who_am) => {
                handler?.runWith(msg);
            });
        }

        /** 领取圣诞节礼包*/
        public getChristmasReward(handler: Laya.Handler) {
            let model = this.model;
            net.sendAndWait(new pb.cs_christmas_party_get_christmas_reward({})).then((msg: pb.sc_christmas_party_get_christmas_reward) => {
                model.isGetGift = 1;
                util.RedPoint.reqRedPointRefresh(model.redPointId2);
                handler?.runWith(msg);
            });
        }

        /** 兑换铃铛花 */
        public getShowerAward(handler: Laya.Handler) {
            let model = this.model;
            net.sendAndWait(new pb.cs_christmas_party_exchange_lingdang({})).then((msg: pb.sc_christmas_party_exchange_lingdang) => {
                model.exchangeItemFlag = 1;
                handler?.runWith(msg);
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}