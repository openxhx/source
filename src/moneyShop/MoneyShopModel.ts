namespace moneyShop {
    export class MoneyShopModel {
        static limitArr: pb.IPickUpFlowerSuit[];
        static canReward: boolean;

        static refreshLimitInfo() {
            return net.sendAndWait(new pb.cs_morning_flowers_night_pick_up_get_info()).then((data: pb.sc_morning_flowers_night_pick_up_get_info) => {
                this.limitArr = _.sortBy(data.suitInfo.slice(), o => o.isSpec == 0);
                this.canReward = data.weeklyRewardStatus == 0;
            })
        }

        private static _tmpId: number;
        private static _tmpNum: number;
        static buyLimitSuit(dawnId: number) {
            let info = xls.get(xls.dawnBlossoms).get(dawnId);
            let data = _.find(this.limitArr, o => o.idx == info.id)
            if (!data)
                return;
            if (data.limitCnt == 0) {
                alert.showSmall('已经卖完啦~');
                return;
            }
            this._tmpId = dawnId;
            this._tmpNum = data.isSpec ? info.sellPrice.v2 : info.price.v2;
            let haveSomeCloth = clientCore.SuitsInfo.getSuitInfo(info.suitId).hasCnt;
            let extraStr = haveSomeCloth > 0 ? `\n（已拥有该套装部件:${haveSomeCloth}）` : '';
            if (data.isSpec == 1 && clientCore.ItemsInfo.getItemNum(9900068) == 0) {
                this._tmpNum = info.price.v2;
                alert.showSmall(`你的朝夕石不足，是否花费原价${info.price.v2}神叶进行购买${info.suitName}？${extraStr}`, { callBack: { caller: this, funArr: [this.sureBuy] } })
            }
            else {
                alert.buySecondConfirm(info.price.v1, this._tmpNum, `${info.suitName}？${extraStr}`, {
                    caller: this, funArr: [
                        this.sureBuy
                    ]
                })
            }
        }

        private static sureBuy() {
            net.sendAndWait(new pb.cs_morning_flowers_night_pick_up_buy_suit({ idx: this._tmpId })).then((data: pb.sc_morning_flowers_night_pick_up_buy_suit) => {
                alert.showReward(data.item);
            })
        }
    }
}