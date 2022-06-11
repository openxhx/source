namespace clientCore {
    interface ICountInfo {
        passCnt: number;
        totalCnt: number;
        buyCnt: number;
        totalCanBuy: number
    }
    /**试炼（活动副本）管理器 */
    export class AdventureActManager {
        private static _instance: AdventureActManager;
        /** 活动副本信息 */
        private _actHash: util.HashMap<ChapterInfo>;
        /**活动次数信息 */
        private _actCountInfo: ICountInfo;

        /**金币副本次数信息 */
        private _moneyCountInfo: ICountInfo;

        static get instance(): AdventureActManager {
            if (!this._instance) {
                this._instance = new AdventureActManager();
                this._instance._actHash = new util.HashMap();
                this._instance._actCountInfo = { passCnt: 0, totalCnt: 0, buyCnt: 0, totalCanBuy: 0 };
                this._instance._moneyCountInfo = { passCnt: 0, totalCnt: 0, buyCnt: 0, totalCanBuy: 0 };
            }
            return this._instance;
        }

        async loadXml() {
            await xls.load(xls.goldStage);
        }

        /**
         * 获取活动副本信息
         */
        async reqAllActChatperInfo() {
            //活动信息 先不请求章节信息（点开具体章节时请求）
            await net.sendAndWait(new pb.cs_adventure_get_stage_counts_limit({ type: 1 })).then((data: pb.sc_adventure_get_stage_counts_limit) => {
                this._actCountInfo.passCnt = data.passCnt;
                this._actCountInfo.totalCnt = data.totalCnt;
                this._actCountInfo.buyCnt = data.buyCnt;
                this._actCountInfo.totalCanBuy = data.totalBuy;
            })
            //金币副本次数信息
            await net.sendAndWait(new pb.cs_adventure_get_stage_counts_limit({ type: 3 })).then((data: pb.sc_adventure_get_stage_counts_limit) => {
                this._moneyCountInfo.passCnt = data.passCnt;
                this._moneyCountInfo.totalCnt = data.totalCnt;
                this._moneyCountInfo.buyCnt = data.buyCnt;
                this._moneyCountInfo.totalCanBuy = data.totalBuy;
            })
            return Promise.resolve();
        }

        /** 请求一个活动章节的数据（如果有数据了不会重复请求 可以用） */
        reqOneActInfo(chapterId: number) {
            if (this._actHash.has(chapterId))
                return Promise.resolve();
            return net.sendAndWait(new pb.cs_get_adventure_chapter_by_id({ id: chapterId })).then((data: pb.sc_get_adventure_chapter_by_id) => {
                this._actHash.add(chapterId, new ChapterInfo(data.chapterInfo));
            })
        }

        /** 清空缓存的活动信息 */
        clearActInfos() {
            this._actHash.clear();
        }

        /**获取一个活动章节信息 */
        getOneActChapterInfo(id: number) {
            return this._actHash.get(id);
        }

        /**获取活动副本次数信息
         * @returns
         *  passCnt已使用次数
         *  totalCnt总可用次数 
         *  canBuyTime剩余购买次数
         *  buyPrice当前购买价格
         */
        getCntInfo() {
            let info = {
                passCnt: 0,
                totalCnt: 0,
                canBuyTime: 0,
                buyTime: 0,
                buyPrice: 0
            };
            info = {
                passCnt: this._actCountInfo.passCnt,
                totalCnt: this._actCountInfo.totalCnt,
                buyTime: this._actCountInfo.buyCnt,
                canBuyTime: this._actCountInfo.totalCanBuy,
                buyPrice: xls.get(xls.globaltest).get(1).buyChallengeCost
            }
            return info;
        }

        getMoneyCntInfo() {
            let info = {
                passCnt: 0,
                totalCnt: 0,
                canBuyTime: 0,
                buyTime: 0,
                buyPrice: 0
            };
            info = {
                passCnt: this._moneyCountInfo.passCnt,
                totalCnt: this._moneyCountInfo.totalCnt,
                buyTime: this._moneyCountInfo.buyCnt,
                canBuyTime: this._moneyCountInfo.totalCanBuy,
                buyPrice: xls.get(xls.globaltest).get(1).buyChallengeCost
            }
            return info;
        }

        /**
         * 购买活动次数
        */
        buyTimes() {
            return net.sendAndWait(new pb.cs_adventure_buy_stage_counts_limit({ type: 1 })).then((data: pb.sc_adventure_buy_stage_counts_limit) => {
                this._actCountInfo.passCnt = data.passCnt;
                this._actCountInfo.totalCnt = data.totalCnt;
                this._actCountInfo.buyCnt = data.buyCnt;
                this._actCountInfo.totalCanBuy = data.totalBuy;
                return Promise.resolve();
            })
        }

        /** 购买金币副本次数*/
        buyMoneyTimes() {
            return net.sendAndWait(new pb.cs_adventure_buy_stage_counts_limit({ type: 3 })).then((data: pb.sc_adventure_buy_stage_counts_limit) => {
                this._moneyCountInfo.passCnt = data.passCnt;
                this._moneyCountInfo.totalCnt = data.totalCnt;
                this._moneyCountInfo.buyCnt = data.buyCnt;
                this._moneyCountInfo.totalCanBuy = data.totalBuy;
                return Promise.resolve();
            })
        }

        gotoStage(stage: StageInfo) {
            this.gotoBattle(stage);
        }

        private async gotoBattle(stage: StageInfo) {
            await clientCore.SceneManager.ins.register();
            clientCore.ModuleManager.closeAllOpenModule();
            if (stage.id == 50101) {
                clientCore.SceneManager.ins.battleLayout(5, stage.id);
            }
            else {
                clientCore.SceneManager.ins.battleLayout(3, stage.id);
            }
        }

    }
}