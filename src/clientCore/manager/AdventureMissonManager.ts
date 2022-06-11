namespace clientCore {
    export class AdventureMissonManager {
        public static UNLOCK_STRING = ['', '完成探索者成就后开启', '成为奇妙花宝后开启', '成为至尊花宝后开启'];
        private static _instance: AdventureMissonManager;
        private _xlsLoaded: boolean = false;
        private _teamArr: TeamInfo[];
        static get instance(): AdventureMissonManager {
            if (!this._instance) {
                this._instance = new AdventureMissonManager();
            }
            return this._instance;
        }

        get teamsInfo() {
            return this._teamArr;
        }

        async initXlsAndSrvData() {
            if (!this._xlsLoaded) {
                await xls.load(xls.chapterBase);
                await xls.load(xls.exploreBase);
                await xls.load(xls.stageBase);
                await xls.load(xls.teamLog);
                this._xlsLoaded = false;
            }
            return net.sendAndWait(new pb.cs_get_all_explore_team()).then((data: pb.sc_get_all_explore_team) => {
                this._teamArr = _.map(data.teamInfo, (d, idx) => {
                    return new TeamInfo(d, idx);
                });
                Laya.timer.loop(1000, this, this.onTimer);
            })
        }

        cancleTimer() {
            Laya.timer.clearAll(this);
        }

        private onTimer() {
            let haveComplete = false;
            for (const team of this._teamArr) {
                if (team.restTime > 0) {
                    team.restTime--;
                    if (team.restTime == 0)
                        haveComplete = true;
                }
            }
            if (haveComplete)
                EventManager.event(globalEvent.ADVMISSION_TEAM_UPDATE);
        }

        /** 通过exploreBase表中id查找对应的队伍（没有返回undefined） */
        getTeamInfoByExploreId(id: number) {
            return _.find(this._teamArr, (t) => {
                return t.srvData.exploreId == id;
            })
        }

        beginExplore(data: pb.Ics_begin_explore_chapter) {
            net.sendAndWait(new pb.cs_begin_explore_chapter(data)).then((d: pb.sc_begin_explore_chapter) => {
                this._teamArr[data.team].setSrvData(d.teamInfo);
                EventManager.event(globalEvent.ADVMISSION_TEAM_UPDATE);
            })
        }

        giveUpExplore(teamIdx: number) {
            net.sendAndWait(new pb.cs_explore_chapter_opt({ type: 0, team: teamIdx })).then((d: pb.sc_explore_chapter_opt) => {
                this._teamArr[teamIdx].setSrvData(d.teamInfo);
                EventManager.event(globalEvent.ADVMISSION_TEAM_UPDATE);
            })
        }

        comleteExplore(teamIdx: number) {
            net.sendAndWait(new pb.cs_explore_chapter_opt({ type: 1, team: teamIdx })).then((d: pb.sc_explore_chapter_opt) => {
                this._teamArr[teamIdx].setSrvData(d.teamInfo);
                EventManager.event(globalEvent.ADVMISSION_TEAM_UPDATE);
            })
        }

        getExploreReward(teamIdx: number) {
            net.sendAndWait(new pb.cs_get_explore_award({ team: teamIdx })).then((d: pb.sc_get_explore_award) => {
                this._teamArr[teamIdx].setSrvData(d.teamInfo);
                alert.showReward(GoodsInfo.createArray(d.awardInfo), '获得奖励！');
                EventManager.event(globalEvent.ADVMISSION_TEAM_UPDATE);
                util.RedPoint.reqRedPointRefresh(301);
            })
        }
    }
}
