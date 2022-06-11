namespace adventure {
    import AdventureManager = clientCore.AdventureManager;
    import ChapterInfo = clientCore.ChapterInfo;
    import STAGE_STATU = clientCore.STAGE_STATU;
    export class AdvMainPanel implements IAdvBasePanel {
        private ui: ui.adventure.panel.AdvMainPanelUI;
        private _chapterIdx: number;
        private _chapterInfo: ChapterInfo;
        private _mapControl: MapControl;
        private _needOpenFight = false;
        constructor(ui: ui.adventure.panel.AdvMainPanelUI) {
            this.ui = ui;
            this._mapControl = new MapControl(ui.mapCon);
            this.ui.btnLeft.visible = this.ui.btnRight.visible = false;
            this.ui.panelPlot.vScrollBarSkin = '';
            this.ui.boxReward.visible = false;
            this.ui.listReward.renderHandler = new Laya.Handler(this, this.onRewardRender);
            this.addEvent();
        }

        /**
        * @param defaultChatperId 默认章节id(如果不传，打开最后一个章节)
        */
        init(defaultChatperId?: number, needOpenFight?: boolean) {
            let arr = AdventureManager.instance.getAllChapterInfos();
            if (defaultChatperId) {
                this._chapterIdx = _.findIndex(arr, { 'id': defaultChatperId });
            }
            else {
                this._chapterIdx = _.findLastIndex(arr, { 'isAllStageComplete': true });
                this._chapterIdx = _.clamp(this._chapterIdx + 1, 0, arr.length - 1);//防止越界
            }
            this._needOpenFight = needOpenFight;
        }

        async show() {
            if (_.isUndefined(this._chapterIdx)) {
                this.init();
            }
            await AdventureManager.instance.updateAllByType(0);
            this.showReward(false);
            if (this._chapterIdx == -1) {
                let arr = AdventureManager.instance.getAllChapterInfos();
                this._chapterIdx = _.findLastIndex(arr, { 'isAllStageComplete': true });
                this._chapterIdx = _.clamp(this._chapterIdx + 1, 0, arr.length - 1);//防止越界
            }
            this._chapterInfo = AdventureManager.instance.getAllChapterInfos()[this._chapterIdx];
            let isShowPlot = this._chapterInfo.getAllStageReward;//当前是否展示剧情
            this.ui.panelPlot.visible = isShowPlot;
            this.ui.imgBgLeft.visible = !isShowPlot;
            this.ui.btnEnter.visible = !isShowPlot;
            this.ui.boxChpRwd.visible = !isShowPlot;
            this.ui.boxBossRwd.visible = !isShowPlot;
            this.ui.imgBgRight.visible = !isShowPlot;
            this.ui.imgPlotBg.visible = isShowPlot;
            if (isShowPlot) {
                //展示剧情
                this._mapControl.clearMap();
                this.setupPlot();
                this.ui.imgPlotBg.skin = `res/adventure/plotBg/${this._chapterInfo.id}.png`;
            }
            else {
                this._mapControl.setMap(this._chapterInfo);
                this.ui.panelPlot.removeChildren();
            }

            if (this._needOpenFight) {
                EventManager.event(EV_OPEN_FIGHT_INFO_PANEL, this._chapterInfo.stageInfos[this._chapterInfo.nowStageIdx]);
                //取消标记
                this._needOpenFight = false;
            }
            //BOSS奖励相关
            this.ui.boxBossRwd.visible = this._chapterInfo.bossStageStatu != STAGE_STATU.NO_COMPLETE && !isShowPlot;
            this.ui.imgRewardDetail.visible = this._chapterInfo.bossStageStatu == STAGE_STATU.COMPLETE;
            this.ui.imgLight.visible = this._chapterInfo.bossStageStatu == STAGE_STATU.COMPLETE;
            this.ui.clipBossRwd.index = this._chapterInfo.bossStageStatu == STAGE_STATU.REWARDED ? 1 : 0;
            this.ui.boxBossRwd.gray = this._chapterInfo.bossStageStatu == STAGE_STATU.REWARDED;
            if (this._chapterInfo.bossStageStatu == STAGE_STATU.COMPLETE) {
                Laya.timer.loop(30, this, this.aniLight);
            }
            //章节奖励
            this.ui.imgFinalIcon.skin = clientCore.ItemsInfo.getItemIconUrl(this._chapterInfo.xlsData.disRwd)
            this.ui.txtFinalRwd.text = clientCore.ItemsInfo.getItemName(this._chapterInfo.xlsData.disRwd);
            //
            this.ui.txtTitle.text = `第${util.StringUtils.num2Chinese(this._chapterIdx + 1)}章`;
            this.ui.txtName.text = this._chapterInfo.xlsData.name;
            let totalStageNum = this._chapterInfo.stageInfos.length;//本章总关卡数
            this.ui.btnLeft.visible = this._chapterIdx > 0;
            this.ui.btnRight.visible = this._chapterIdx < AdventureManager.instance.getAllChapterInfos().length - 1;
            this.ui.btnEnter.disabled = this._chapterInfo.nowStageIdx != totalStageNum - 1;
            // this.ui.boxCost.visible = this._chapterInfo.nowStageIdx > -1;
            if (this._chapterInfo.nowStageIdx > -1)
                this.ui.txtNeed.text = '' + this._chapterInfo.stageInfos[this._chapterInfo.nowStageIdx].xlsData.vim;
            //tips 
            //倒数第二关显示：完成之后可以探索XX
            //倒数第一关不显示
            //其他显示：请先完成所有章节关卡
            let stageIdx = this._chapterInfo.nowStageIdx;
            this.ui.imgTips.visible = this.ui.txtTips.visible = stageIdx <= totalStageNum - 1 && stageIdx > -1;
            this.ui.txtTips.text = stageIdx == totalStageNum - 1 ? '完成之后可以探索' : '请先完成所有章节关卡';
            //bg
            this.ui.imgBgLeft.skin = `res/adventure/bgLeft/${this._chapterInfo.id}.png`;
            this.ui.imgBgRight.skin = `res/adventure/bgRight/${this._chapterInfo.id}.png`;
            this.ui.imgBoss.skin = `res/adventure/bossImg/${this._chapterInfo.bossId}.png`;
            //右边boss可以挑战了 就取消灰色
            let canChangeBoss = this._chapterInfo.nowStageIdx >= this._chapterInfo.stageInfos.length - 1;
            this.ui.imgBgRight.gray = !canChangeBoss;
            this.ui.imgBoss.gray = !canChangeBoss && !isShowPlot;
            //探索按钮只和第一章的通关状态有关
            this.ui.btnExplore.disabled = AdventureManager.instance.getAllChapterInfos()[0].bossStageStatu == STAGE_STATU.NO_COMPLETE;
            //reward
            this.ui.listReward.dataSource = _.last(this._chapterInfo.stageInfos).xlsData[clientCore.LocalInfo.sex == 1 ? 'firstpass' : 'firstpassMale'];
            this.ui.listReward.repeatX = this.ui.listReward.dataSource.length;

            Laya.timer.frameOnce(2, this, () => {
                if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "adventureModuleOpen") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                }
            });
        }

        private aniLight() {
            this.ui.imgLight.rotation += 2;
        }

        private onRewardRender(cell: Laya.Box, idx: number) {
            let data = cell.dataSource as xls.pair;
            (cell.getChildByName('box').getChildAt(0) as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
        }

        private async setupPlot() {
            let panel: Laya.Panel = this.ui.panelPlot;
            panel.destroyChildren();
            let h: number = 0;
            for (let plot of this._chapterInfo.plots) {
                let plotItem = new ui.adventure.render.AdvPlotItemUI();
                plotItem.txt.text = plot.xlsData.plot;
                let txtHeight = plotItem.txt.textHeight;
                plotItem.height = plotItem.imgBg.height = 2 * plotItem.txt.y + txtHeight;
                plotItem.imgIcon.y = plotItem.txt.y + txtHeight * 0.5;
                plotItem.y = h;
                h += plotItem.height + 5;
                panel.addChild(plotItem);
                BC.addEvent(this, plotItem, Laya.Event.CLICK, this, this.onOpenPlot, [plot.xlsData?.movie[0]]);
            }
        }

        private onOpenPlot(obj: xls.pair) {
            if (obj) {
                clientCore.AnimateMovieManager.showAnimateMovie(obj.v2.toString(), null, null);
            }
        }

        private onPageChange(diff: number) {
            let tmp = this._chapterIdx + diff;
            if (_.inRange(0, AdventureManager.instance.getAllChapterInfos().length - 1)) {
                this._chapterIdx = tmp;
                this.show();
            }
        }

        private onEnter() {
            EventManager.event(EV_CLICK_STAGE, _.last(this._chapterInfo.stageInfos));
        }

        private onBossRewardClick() {
            if (this._chapterInfo.bossStageStatu == STAGE_STATU.COMPLETE)
                EventManager.event(EV_CLICK_STAGE, _.last(this._chapterInfo.stageInfos));
            else {
                this.showReward(true);
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAdventureBossReward") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }

        private showReward(b: boolean) {
            this.ui.boxReward.visible = b;
            if (!b && clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitBollRewardClose") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }
        private onExplore() {
            EventManager.event(EV_CLOSE_ADV_MODULE);
            clientCore.ModuleManager.open('adventureMission.AdventureMissionModule');
        }

        public getMissionObj(missionId: number) {
            return this._mapControl.getStageObjByID(missionId);
        }
        public getBoxReward() {
            return this.ui.imgRewardDetail;
        }
        private addEvent() {
            BC.addEvent(this, this.ui.btnRight, Laya.Event.CLICK, this, this.onPageChange, [1]);
            BC.addEvent(this, this.ui.btnLeft, Laya.Event.CLICK, this, this.onPageChange, [-1]);
            BC.addEvent(this, this.ui.btnEnter, Laya.Event.CLICK, this, this.onEnter);
            BC.addEvent(this, this.ui.btnExplore, Laya.Event.CLICK, this, this.onExplore);
            BC.addEvent(this, this.ui.imgRewardDetail, Laya.Event.CLICK, this, this.onBossRewardClick);
            BC.addEvent(this, this.ui.spCloseReward, Laya.Event.CLICK, this, this.showReward, [false]);
            EventManager.on(globalEvent.ADVENTURE_STAGE_INFO_UPDATE, this, this.show);
        }

        destory() {
            this._mapControl.destroy();
            EventManager.off(globalEvent.ADVENTURE_STAGE_INFO_UPDATE, this, this.show);
            Laya.timer.clearAll(this);
            BC.removeEvent(this);
        }
    }
}