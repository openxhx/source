
namespace adventure {
    import AdventureManager = clientCore.AdventureManager;
    export class AdvMwlPanel implements IAdvBasePanel {
        private ui: ui.adventure.panel.AdvMwlPanelUI;
        private _detailPanel: MwlDetailPanel;
        private _timePanel: BuyTimePanel;
        private _stageInfo: clientCore.StageInfo;
        private _needOpenFight = false;
        constructor(ui: ui.adventure.panel.AdvMwlPanelUI) {
            this.ui = ui;
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.addEvent();
        }

        async show() {
            await AdventureManager.instance.updateAllByType(0);
            await AdventureManager.instance.updateAllByType(2);
            this.ui.list.dataSource = _.filter(xls.get(xls.chapterBase).getValues(), (o) => { return AdventureManager.checkIsMWLChapter(o.chapter_id) });
            this.onPageChange(0);
            this.updateView();
            if (this._stageInfo) {
                let idx = _.findIndex(this.ui.list.dataSource, (v: xls.chapterBase) => { return v.chapter_id == this._stageInfo.chatperId });
                this.ui.list.scrollTo(idx);
                if (this._needOpenFight) {
                    this.openDetailPanel(this._stageInfo.chatperId);
                    EventManager.event(EV_OPEN_FIGHT_INFO_PANEL, this._stageInfo);
                    //取消标记
                    this._stageInfo = null;
                    this._needOpenFight = false;
                }
            }
        }

        /**标记当前要打开哪个章节 */
        async init(stageInfo?: clientCore.StageInfo, needOpenFight?: boolean) {
            if (stageInfo)
                this._stageInfo = stageInfo;
            this._needOpenFight = needOpenFight;
        }

        updateView() {
            let timesInfo = AdventureManager.instance.getMwlCntInfo();
            this.ui.txtUseTimes.text = Math.max(0, (timesInfo.totalCnt - timesInfo.passCnt)) + "";
            this.ui.txtTimes.text = '/' + timesInfo.totalCnt;
        }

        private onListRender(cell: ui.adventure.render.ActItemUI, idx: number) {
            let xlsInfo = cell.dataSource as xls.chapterBase;
            let imgInfo = pathConfig.getAdventureAct(xlsInfo.chapter_id);
            cell.imgRole.skin = imgInfo.role;
            cell.imgTitle.skin = imgInfo.title;
            let info = AdventureManager.instance.getOneMwlChapterInfo(xlsInfo.chapter_id)
            cell.boxMain.filters = info ? [] : util.DisplayUtil.darkFilter;
            cell.boxLock.visible = info ? false : true;
            //没有解锁 显示需求信息
            if (!info) {
                let require = xlsInfo.require[0];
                if (require.v1 == 1) {
                    //关卡需求
                    cell.txtUnlock.text = `完成关卡\n${xls.get(xls.stageBase).get(require.v2).stageTitle}解锁`;
                }
                else {
                    //等级需求
                    cell.txtUnlock.text = `等级达到\n${require.v2}解锁`;
                }
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                //解锁了
                if (!this.ui.list.getCell(idx)['boxLock'].visible) {
                    let xlsInfo = this.ui.list.getItem(idx) as xls.chapterBase;
                    this.openDetailPanel(xlsInfo.chapter_id);
                }
            }
        }

        private openDetailPanel(chapter_id: number) {
            this._detailPanel = this._detailPanel || new MwlDetailPanel();
            this._detailPanel.show(AdventureManager.instance.getOneMwlChapterInfo(chapter_id));
            clientCore.DialogMgr.ins.open(this._detailPanel);
        }

        onPageChange(diff: number) {
            let tmp = _.clamp(this.ui.list.page + diff, 0, this.ui.list.totalPage);
            this.ui.list.page = tmp;
            this.ui.btnLeft.visible = tmp > 0;
            this.ui.btnRight.visible = tmp < this.ui.list.totalPage;
        }

        private onOpenTimePanel() {
            this._timePanel = this._timePanel || new BuyTimePanel();
            this._timePanel.show(2);
            clientCore.DialogMgr.ins.open(this._timePanel);
            this._timePanel.once(Laya.Event.CLOSE, this, this.updateView);
            BC.addEvent(this, this._timePanel, Laya.Event.CHANGED, this, this.updateView);
        }

        addEvent() {
            BC.addEvent(this, this.ui.btnLeft, Laya.Event.CLICK, this, this.onPageChange, [-1]);
            BC.addEvent(this, this.ui.btnRight, Laya.Event.CLICK, this, this.onPageChange, [1]);
            BC.addEvent(this, this.ui.btnAdd, Laya.Event.CLICK, this, this.onOpenTimePanel);
        }

        destory() {
            BC.removeEvent(this);
            if (this._timePanel)
                this._timePanel = null
            if (this._detailPanel) {
                clientCore.DialogMgr.ins.close(this._detailPanel, false)
                this._detailPanel = null;
            }
        }
    }
}