namespace adventureMission {
    export class MiniMapRender extends ui.adventureMission.render.MiniMapRenderUI {
        private _exploreData: xls.exploreBase;
        public canCheck: boolean;
        constructor() {
            super();
            this.listAttr.renderHandler = new Laya.Handler(this, this.onListAttrRender);
            this.listRwd.renderHandler = new Laya.Handler(this, this.onListRwdRender);
        }

        set dataSource(d: any) {
            if (d) {
                this._dataSource = d;
                this._exploreData = d;
                this.listRwd.dataSource = this._exploreData.exploreReward.slice(0, 3);
                this.listAttr.dataSource = _.compact(this._exploreData.classRequire);
                let teamInfo = clientCore.AdventureMissonManager.instance.getTeamInfoByExploreId(this._exploreData.id);
                let stageInfo = clientCore.AdventureManager.instance.getOneStageInfo(this._exploreData.stageRequire);
                this.txtMapName.text = this._exploreData.map;
                this.txtLockInfo.text = `通关第${util.StringUtils.num2Chinese(parseInt(this._exploreData.stageRequire.toString().slice(1, 3)))}章开启`;
                let unlocked: boolean = false;
                if (stageInfo) {
                    unlocked = stageInfo.state != clientCore.STAGE_STATU.NO_COMPLETE;//关卡完成（不需要领奖）就算解锁
                }
                this.mcMapImg.skin = pathConfig.getMissonSmallMap(this._dataSource.id);
                this.mcLock.visible = !unlocked;
                let haveTeam = teamInfo != undefined;
                //没有打完一章是没有下一章信息的所以stageInfo不一定有
                this.mcSearch.visible = haveTeam;
                if (haveTeam) {
                    this.txtTeam.text = teamInfo.teamName;
                }
                this.canCheck = unlocked && !haveTeam;//解锁才可以察看
                this.boxUI.filters = this.canCheck ? [] : util.DisplayUtil.darkFilter;
            }
        }

        private onListAttrRender(cell: Laya.Image, idx: number) {
            cell.skin = pathConfig.getRoleAttrIco(cell.dataSource);
        }

        private onListRwdRender(cell: ui.adventureMission.panel.MapRewardUI, idx: number) {
            cell.mcReward.skin = clientCore.ItemsInfo.getItemIconUrl(cell.dataSource.v1);
        }
    }
}