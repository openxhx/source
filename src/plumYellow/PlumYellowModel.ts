namespace plumYellow {
    export class PlumYellowModel {
        private static _model: PlumYellowModel;
        private constructor() { };
        public static get instance(): PlumYellowModel {
            if (!this._model) {
                this._model = new PlumYellowModel();
            }
            return this._model;
        }

        /**活动id */
        public activityId: number = 237;
        /**切换页签限制 */
        public canChangePanel: boolean = true;
        /**累计消耗代币数量 */
        public costAllCnt: number = 0;
        /**回馈奖励领取标记 */
        public feedbackRewardFlag: number;
        /**代币转换唯一id */
        public recycleCoinId: number;
        /**限量套装剩余数量 */
        public leftCntMap: util.HashMap<number>;

        /**获取套装剩余数量 */
        public getSuitLeftCnt() {
            if (!this.leftCntMap) this.leftCntMap = new util.HashMap();
            return net.sendAndWait(new pb.cs_common_recharge_panel({ activityId: PlumYellowModel.instance.activityId })).then((msg: pb.sc_common_recharge_panel) => {
                for (let i = 0; i < msg.leftNumArrs.length; i++) {
                    this.leftCntMap.add(msg.leftNumArrs[i].suitId, msg.leftNumArrs[i].leftNum);
                }
            });
        }

        /**
         * 代币消耗
         */
        public coinCost(cnt: number) {
            this.costAllCnt += cnt;
        }

        /**
         * 检查代币转换
         */
        public async checkCoinRecyle(type: number) {
            let config: xls.recycle[];
            config = _.filter(xls.get(xls.recycle).getValues(), (o) => { return o.type == type });
            let haveOld = false;
            for (let i = 0; i < config.length; i++) {
                for (let j = 0; j < config[i].oldItemId.length; j++) {
                    haveOld = haveOld || clientCore.ItemsInfo.checkHaveItem(config[i].oldItemId[j]);
                }
                if (haveOld) {
                    if (config[i].eventId != this.activityId) {
                        await net.sendAndWait(new pb.cs_item_callback({ type: config[i].id }));
                    } else {
                        if (type == 2) {
                            let mod = await clientCore.ModuleManager.open("recycleCoin.RecycleCoinModule", config[i].id);
                            mod.once(Laya.Event.CLOSE, this, () => {
                                this.checkCoinRecyle(type);
                            })
                        } else {
                            let mod = await clientCore.ModuleManager.open("recycleCoin.RecycleDrawCoinModule", config[i].id);
                            mod.once(Laya.Event.CLOSE, this, () => {
                                this.checkCoinRecyle(type);
                            })
                        }
                    }
                }
            }

        }

        /**打开代币礼包购买 */
        public openCoinGiftBuy() {
            clientCore.ModuleManager.open("rechargeCoin.RechargeCoinModule", [this.activityId, 3, 4, 10]);
        }

        /**获取直购活动配置 */
        public getSuitBuyCfg(phase: number): SuitBuyData {
            if (phase == 1) {//百舍重茧
                return new SuitBuyData(3209, 2110670, 1181, 9900334, [1000198], 5, "time_10_23", 1);
            }
            if (phase == 2) {//节气芒种
                return new SuitBuyData(3203, 2100370, 1134, 9900334, [2500082], 4, "time_2_16", 1);
            }
        }

        /**获取折扣抽取活动配置 */
        public getDisCountDrawCfg(phase: number): DiscountDrawData {
            if (phase == 1) {//沧海龙吟
                return new DiscountDrawData(1, 2110672, [1000199], 1048, 520 , 5 , "time_10_23");
            }
            if (phase == 2) {//节气小满
                return new DiscountDrawData(2, 2100368, [300446, 2500080], 1221, 420 , 1 , "time_20_2");
            }
        }

    }
}