namespace anniversary2021 {
    export class Anniversary2021Model implements clientCore.BaseModel {
        /** 活动ID*/
        readonly ACTIVITY_ID: number = 133;
        /** 活动代币ID*/
        public readonly ACTIVITY_MONEY_ID: number = 9900140;

        /** 套装剩余数量*/
        count: number;
        /** 当前折扣*/
        discount: number;
        /** 抽奖次数*/
        times: number;
        /** 超值礼包购买次数*/
        public buyTimes: pb.IcommonShop[];
        /** 奖励领取信息*/
        public rewardIdx: number;

        /** 花宝赠礼奖励领取信息*/
        public petRewardIdx: number;

        /**每日六元购 */
        public dailyBuy:number;

        getCfg(id: number): xls.rouletteDrawCost {
            let array = _.filter(xls.get(xls.rouletteDrawCost).getValues(), (element: xls.rouletteDrawCost) => { return element.type == this.ACTIVITY_ID && element.period == id; });
            let times: number = Math.min(this.times, array.length - 1);
            return array[times];
        }

        /** 检查是否折扣*/
        checkDiscount(): boolean {
            return this.discount > 0 && this.discount < 100;
        }

        checkReward(): boolean {
            for (let i: number = 1; i < 10; i++) {
                if (util.getBit(this.rewardIdx, i) == 0) return false;
            }
            return true;
        }

        checkPet(index: number): boolean {
            return util.getBit(this.petRewardIdx, index) == 1;
        }

        dispose(): void {
            if (this.buyTimes) {
                this.buyTimes.length = 0;
                this.buyTimes = null;
            }
        }
    }
}