namespace clientCore {
    /**章节信息 */
    export class ChapterInfo {
        readonly xlsData: xls.chapterBase;
        readonly srvData: pb.Ichapter_info;
        private _id: number;
        private _stageInfos: StageInfo[];

        constructor(data: pb.Ichapter_info) {
            this._id = data.chapterId;
            this._stageInfos = [];
            this.srvData = data;
            this.xlsData = xls.get(xls.chapterBase).get(this._id);
            this.handleStageInfos();
        }

        private handleStageInfos() {
            for (const info of this.srvData.stageInfo) {
                this._stageInfos.push(new StageInfo(info));
            }
        }

        /**本章节boss id */
        get bossId() {
            let bossStage = _.find(this._stageInfos, (stage) => {
                return stage.type == STAGE_TYPE.BOSS;
            });
            if (!bossStage) {
                console.warn('章节' + this.id + '没有配boss关卡');
                return 1;
            }
            return bossStage.xlsData.display;
        }

        get id() {
            return this._id;
        }

        get stageInfos(): StageInfo[] {
            return this._stageInfos;
        }

        /**
         * 本章奖励是否全部领取
         */
        get getAllStageReward() {
            return _.findIndex(this.stageInfos, (stage) => {
                return stage.state != STAGE_STATU.REWARDED;
            }) == -1;
        }

        get isAllStageComplete() {
            return _.findIndex(this.stageInfos, (stage) => {
                return stage.state == STAGE_STATU.NO_COMPLETE;
            }) == -1;
        }

        /** boss关状态 */
        get bossStageStatu(): STAGE_STATU {
            let bossStage = _.find(this._stageInfos, (stage) => {
                return stage.type == STAGE_TYPE.BOSS;
            });
            if (!bossStage) {
                console.warn('章节' + this.id + '没有配boss关卡');
                return 0;
            }
            return bossStage.state;
        }

        /**返回当前章节推进进度 全部完成返回-1 */
        get nowStageIdx() {
            return _.findIndex(this.stageInfos, (stage) => {
                return stage.state == STAGE_STATU.NO_COMPLETE;
            });
        }

        /** 获取剧情列表  */
        get plots() {
            return _.filter(this._stageInfos, (stage) => {
                return stage.xlsData.plot.length > 0;
            })
        }
    }
}