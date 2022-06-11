namespace springOverture {
    export class SpringOvertureModel {
        private static _model: SpringOvertureModel;
        private constructor() { };
        public static get instance(): SpringOvertureModel {
            if (!this._model) {
                this._model = new SpringOvertureModel();
            }
            return this._model;
        }

        /**活动id */
        public activityId: number = 219;
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
            return net.sendAndWait(new pb.cs_common_recharge_panel({ activityId: SpringOvertureModel.instance.activityId })).then((msg: pb.sc_common_recharge_panel) => {
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
        public checkCoinRecyle(type: number , index:number =0) {
            let config: xls.recycle[];
            if(index == 0){
                config = _.filter(xls.get(xls.recycle).getValues(), (o) => { return o.type == type });
            }else{
                config = _.filter(xls.get(xls.recycle).getValues(), (o) => { return o.id == index });
            }
            if (config.length == 0) return;
            let medals: number[] = config.map((o) => { return o.exchangeCard });
            net.sendAndWait(new pb.cs_get_server_common_data({ commonList: medals })).then(async (msg: pb.sc_get_server_common_data) => {
                for (let i = 0; i < msg.times.length; i++) {
                    if (msg.times[i] == 0) {
                        if (config[i].eventId != this.activityId) {
                            await net.sendAndWait(new pb.cs_item_callback({ type: config[i].id }))
                        } else {
                            if (type == 2) {
                                clientCore.ModuleManager.open("recycleCoin.RecycleCoinModule", config[i].id);
                            } else {
                                clientCore.ModuleManager.open("recycleCoin.RecycleDrawCoinModule", config[i].id);
                            }
                        }
                    }
                }
            })
        }

        /**打开代币礼包购买 */
        public openCoinGiftBuy() {
            clientCore.ModuleManager.open("rechargeCoin.RechargeCoinModule", [this.activityId, 1, 2, 3]);
        }

        /**获取神祈复出活动配置 */
        public getRebackFaeryCfg(phase: number): RebackFaeryData {
            if (phase == 1) {//夜昙绮梦
                return;// new RebackFaeryData(1, 1156, 2100285, 2100005, 10, 39, 9900293, 2500038, MedalConst.FAERY_BACK_FIRST_HALF, [8, 9], "time_14_27");
            } else if (phase == 2) {//冰魄之椿
                return new RebackFaeryData(2, 1156, 2110032, 2110009, 1, 40, 9900294, 1200030, MedalConst.FAERY_BACK_FIRST_HALF1, [6, 7], "time_21_3");
            }
        }

        /**获取本周主打活动配置 */
        public getMainSellCfg(phase: number): MainSellData {
            if (phase == 1) {//伊紫·吾爱永恒
                return new MainSellData(1, 1156, [2100300, 2110590, 2110437, 2110592], 10, 42, 9900300, 2500067, [3, 1], MedalConst.MAIN_SELL_FIRST_HALF, [8, 9], "time_28_10");
            } else if (phase == 2) {//光阴靡丽
                return new MainSellData(2, 1192, [2100112, 2110593, 2110594, 2110595], 11, 43, 9900302, 2300040, [4, 1], MedalConst.MAIN_SELL_FIRST_HALF1, [12, 13], "time_4_17");
            }
        }
    }
}