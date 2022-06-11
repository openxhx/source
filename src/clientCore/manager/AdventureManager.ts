namespace clientCore {
    export class AdventureManager {
        private static _instance: AdventureManager;
        /**主线信息 */
        private _chapterHash: util.HashMap<ChapterInfo>;
        /**拉贝尔秘闻录信息 */
        private _mwlHash: util.HashMap<ChapterInfo>;
        /**秘闻录次数限制 */
        private _mwlCountInfo: { passCnt: number, totalCnt: number, buyCnt: number, totalCanBuy: number };

        static get instance(): AdventureManager {
            if (!this._instance) {
                this._instance = new AdventureManager();
                this._instance._chapterHash = new util.HashMap();
                this._instance._mwlHash = new util.HashMap();
                this._instance._mwlCountInfo = { passCnt: 0, totalCnt: 0, buyCnt: 0, totalCanBuy: 0 };
            }
            return this._instance;
        }

        async loadXml() {
            await Promise.all([
                xls.load(xls.chapterBase),
                xls.load(xls.stageBase),
                xls.load(xls.miniGameBase),
            ]);
        }

        /**
         * 获取所有可展示的章节信息
         * @param type 0:主线章节  2:秘闻录
         */
        async updateAllByType(type: 0 | 2) {
            if (type == 0) {
                //普通关卡
                await net.sendAndWait(new pb.cs_get_adventure_open_chapter({ type: type })).then((data: pb.sc_get_adventure_open_chapter) => {
                    _.each(data.chapterInfo, (info) => {
                        this._chapterHash.add(info.chapterId, new ChapterInfo(info));
                    });
                }).catch(() => { });
            }
            else if (type == 2) {
                //秘闻录，还需要请求一个挑战次数信息
                await net.sendAndWait(new pb.cs_get_adventure_open_chapter({ type: type })).then((data: pb.sc_get_adventure_open_chapter) => {
                    _.each(data.chapterInfo, (info) => {
                        this._mwlHash.add(info.chapterId, new ChapterInfo(info));
                    });
                }).catch(() => { });
                await net.sendAndWait(new pb.cs_adventure_get_stage_counts_limit({ type: 2 })).then((data: pb.sc_adventure_get_stage_counts_limit) => {
                    this._mwlCountInfo.passCnt = data.passCnt;
                    this._mwlCountInfo.totalCnt = data.totalCnt;
                    this._mwlCountInfo.buyCnt = data.buyCnt;
                    this._mwlCountInfo.totalCanBuy = data.totalBuy;
                })
            }
            return Promise.resolve();
        }

        /**获取某一个普通章节信息 */
        getOneChaperInfo(id: number) {
            return this._chapterHash.get(id);
        }

        /**获取某一个普通关卡信息 */
        getOneStageInfo(id: number): StageInfo {
            let chapterId = parseInt(id.toString().slice(0, 3));//前3位是章节id
            let chapterInfo = this.getOneChaperInfo(chapterId);
            if (chapterInfo) {
                return _.find(chapterInfo.stageInfos, (stage) => {
                    return stage.id == id;
                })
            }
            return undefined;
        }

        /**获取某一个秘闻录关卡信息 */
        getOneMwlStageInfo(id: number): StageInfo {
            let chapterId = parseInt(id.toString().slice(0, 3));//前3位是章节id
            let chapterInfo = this.getOneMwlChapterInfo(chapterId);
            if (chapterInfo) {
                return _.find(chapterInfo.stageInfos, (stage) => {
                    return stage.id == id;
                })
            }
            return undefined;
        }

        /**获取所有主线章节信息 */
        getAllChapterInfos() {
            return this._chapterHash.getValues();
        }

        /**获取一个秘闻录章节信息 */
        getOneMwlChapterInfo(id: number) {
            return this._mwlHash.get(id);
        }

        /**获取秘闻录次数购买信息
         * @param 2秘闻录
         * @returns
         *  passCnt已使用次数
         *  totalCnt总可用次数 
         *  canBuyTime剩余购买次数
         *  buyPrice当前购买价格
         */
        getMwlCntInfo() {
            let info = {
                passCnt: 0,
                totalCnt: 0,
                canBuyTime: 0,
                buyTime: 0,
                buyPrice: 0
            };
            info = {
                passCnt: this._mwlCountInfo.passCnt,
                totalCnt: this._mwlCountInfo.totalCnt,
                buyTime: this._mwlCountInfo.buyCnt,
                canBuyTime: this._mwlCountInfo.totalCanBuy,
                buyPrice: xls.get(xls.globaltest).get(1).buyChallengeCost
            }
            return info;
        }

        /**购买秘闻录挑战次数
         * @param type 秘闻录
        */
        buyMwlTimes() {
            return net.sendAndWait(new pb.cs_adventure_buy_stage_counts_limit({ type: 2 })).then((data: pb.sc_adventure_buy_stage_counts_limit) => {
                this._mwlCountInfo.passCnt = data.passCnt;
                this._mwlCountInfo.totalCnt = data.totalCnt;
                this._mwlCountInfo.buyCnt = data.buyCnt;
                this._mwlCountInfo.totalCanBuy = data.totalBuy;
                return Promise.resolve();
            })
        }

        /**判断是否为秘闻录关卡 */
        static checkIsMWLChapter(chapterId: number) {
            return _.inRange(chapterId, 199, 300);
        }

        /**判断是否为活动关卡 */
        static checkIsActChapter(chapterId: number) {
            return _.inRange(chapterId, 300, 400);
        }

        /**秘闻录扫荡 */
        sweepMwlStage(stageId: number, times: number): Promise<pb.IchallengeAward[] | void> {
            return net.sendAndWait(new pb.cs_adventure_challenge_stage({ stageId: stageId, counts: Math.min(times, 10) })).then((data: pb.sc_adventure_challenge_stage) => {
                this._mwlCountInfo.passCnt += times;//扫荡成功次数 passCnt增加
                return Promise.resolve(data.awardList);
            }).catch(() => { });
        }

        gotoStage(stage: StageInfo) {
            if (stage.type == STAGE_TYPE.NORMAL || stage.type == STAGE_TYPE.BOSS) {
                // 快速通关
                // net.sendAndWait(new pb.cs_adventure_fast_pass_stage({ sceneId: stage.id })).then((data: pb.sc_adventure_fast_pass_stage) => {
                //     this.updateOneStageInfo(data.stageInfo);
                // }).catch(() => { })
                // return;
                // 前往战斗
                this.gotoBattle(stage);
            }
            else if (stage.type == STAGE_TYPE.PLOT) {
                clientCore.AnimateMovieManager.showAnimateMovie("" + stage.xlsData.movie[0].v2, this, () => {
                    net.sendAndWait(new pb.cs_adventure_pass_story_stage({ stageId: stage.id })).then((data: pb.sc_adventure_pass_story_stage) => {
                        this.updateOneStageInfo(data.stageInfo);
                        if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "adventureAnimateMoviePlayOver") {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                    }).catch(() => { })
                });
            }
            else if (stage.type == STAGE_TYPE.GAME) {
                let gameId = xls.get(xls.stageBase).get(stage.id).miniGameId;
                let gameUrl = xls.get(xls.miniGameBase).get(gameId).gameUrl;
                ModuleManager.open(gameUrl, { modelType: "stageBase", openType: "adventure", stageId: stage.id, gameId: gameId, type: 0 }, { openWhenClose: "adventure.AdventureModule" }).then((mod) => {
                    mod.once(Laya.Event.CLOSE, this, () => {
                        EventManager.event(globalEvent.ADVENTURE_STAGE_INFO_UPDATE, stage.id);
                    })
                });
            }
        }


        private _tmpStage: StageInfo;
        private async gotoBattle(stage: StageInfo) {
            await clientCore.SceneManager.ins.register();
            this._tmpStage = stage;
            let aniBeforeBattle = _.find(stage.xlsData.movie, (ani) => { return ani.v1 == 1 });
            if (aniBeforeBattle) {
                ModuleManager.closeAllOpenModule();
                clientCore.AnimateMovieManager.showAnimateMovie(aniBeforeBattle.v2.toString(), this, this.enterBattleScene);
            }
            else {
                this.enterBattleScene();
            }
        }

        /**正式进入战斗， */
        private async enterBattleScene() {
            ModuleManager.closeAllOpenModule();
            let isMwl = AdventureManager.checkIsMWLChapter(this._tmpStage.chatperId);
            if (isMwl)
                clientCore.SceneManager.ins.battleLayout(2, this._tmpStage.id);
            else
                clientCore.SceneManager.ins.battleLayout(1, this._tmpStage.id);
        }

        getReward(stage: StageInfo) {
            net.sendAndWait(new pb.cs_get_adventure_award({ stageId: stage.id })).then((data: pb.sc_get_adventure_award) => {
                alert.showReward(GoodsInfo.createArray(data.awardInfo), '');
                this.updateOneStageInfo(data.stageInfo);
                EventManager.event(globalEvent.ADVENTURE_STAGE_INFO_UPDATE, stage.id);
            }).catch(() => { })
        }

        private updateOneStageInfo(data: pb.Istage_info) {
            let chapterId = xls.get(xls.stageBase).get(data.stageId).chapter;
            let chapter = this._chapterHash.get(chapterId);
            let targetStage = _.find(chapter.stageInfos, (s) => {
                return s.id == data.stageId
            });
            //更新关卡信息,如果是boss关，可能解锁新章节，所以需要刷新全部信息(目前只对非活动做处理)
            targetStage.updateSrvData(data);
            if (targetStage.type == STAGE_TYPE.BOSS)
                this.updateAllByType(0);
            else
                EventManager.event(globalEvent.ADVENTURE_STAGE_INFO_UPDATE, data.stageId);
        }

        /**解锁章节 */
        unlockChapter(id: number) {
            return net.sendAndWait(new pb.cs_unlock_adventure_chapter({ id: id })).then((data: pb.sc_unlock_adventure_chapter) => {
                if (data?.chapterInfo) {
                    let chpInfo = new ChapterInfo(data.chapterInfo);
                    this._chapterHash.add(data.chapterInfo.chapterId, chpInfo);
                    EventManager.event(globalEvent.ADVENTURE_STAGE_INFO_UPDATE, chpInfo.stageInfos[0].id);
                }
            })
        }
    }
}