namespace flowerMass {
    export class FlowerMassModel {
        private static _model: FlowerMassModel;
        private constructor() { };
        public static get instance(): FlowerMassModel {
            if (!this._model) {
                this._model = new FlowerMassModel();
            }
            return this._model;
        }

        /**活动id */
        public activityId: number = 231;
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
            return net.sendAndWait(new pb.cs_common_recharge_panel({ activityId: FlowerMassModel.instance.activityId })).then((msg: pb.sc_common_recharge_panel) => {
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
                            let mod = await clientCore.ModuleManager.open("recycleCoin.RecycleCoinModule1", config[i].id);
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
            clientCore.ModuleManager.open("rechargeCoin.RechargeCoinModule1", [this.activityId, 7, 8, 9]);
        }

        /**获取本周主打活动配置 */
        public getMainSellCfg(phase: number): MainSellData {
            if (phase == 1) {//伊紫·吾爱永恒
                return new MainSellData(1, 1156, [2100348, 2110434, 2110637, 2110638], 10, 47, 9900328, 3500125, [2, 1], MedalConst.FLOWER_MASS_FIRST_HALF, [1, 2], "time_8_21");
            }
        }

        /**获取直购活动配置 */
        public getSuitBuyCfg(phase: number): SuitBuyData {
            if (phase == 1) {//画廊邂逅
                return new SuitBuyData(3187, 2110642, 1145, 9900316, [1000188], 1, "time_22_5", 4);
            } else if (phase == 2) {
                return new SuitBuyData(3189, 2110643, 1166, 9900316, [1000190], 2, "time_29_12", 6);
            } else {
                return new SuitBuyData(3191, 2100360, 1149, 9900316, [2500077], 3, "time_6_19", 7);
            }
        }

    }
}