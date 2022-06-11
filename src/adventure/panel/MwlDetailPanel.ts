namespace adventure {
    export class MwlDetailPanel extends ui.adventure.panel.DetailPanelUI {
        private _chapterInfo: clientCore.ChapterInfo;
        private _timePanel: BuyTimePanel;
        constructor() {
            super();
            this.sideClose = true;
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onOpenTimePanel);
        }

        show(chapter: clientCore.ChapterInfo) {
            this.list.dataSource = chapter.stageInfos;
            this._chapterInfo = chapter;
            this.imgRole.skin = pathConfig.getAdventureAct(chapter.id).role;
            this.boxTime.visible = chapter.xlsData.activity == 1;
            this.updateView();
        }

        updateView() {
            let timesInfo = clientCore.AdventureManager.instance.getMwlCntInfo();
            this.txtUseTimes.text = (timesInfo.totalCnt - timesInfo.passCnt).toString();
            this.txtTimes.text = '/' + timesInfo.totalCnt;
        }

        private onOpenTimePanel() {
            this._timePanel = this._timePanel || new BuyTimePanel();
            this._timePanel.show(1);
            clientCore.DialogMgr.ins.open(this._timePanel);
            this._timePanel.once(Laya.Event.CLOSE, this, this.updateView);
            BC.addEvent(this, this._timePanel, Laya.Event.CHANGED, this, this.updateView);
        }

        private onListRender(cell: ui.adventure.render.MwlDetailItemUI, idx: number) {
            let info = cell.dataSource as clientCore.StageInfo;
            cell.txtTitle.text = info.xlsData.name;
            cell.txtDes.text = info.xlsData.desc;
            let rwd = clientCore.LocalInfo.sex == 1 ? info.xlsData.stageReward : info.xlsData.stageRewardMale;
            let rwdIdArr = _.uniq(_.map(rwd, (o) => { return o.v1 }));
            cell.listRwd.repeatX = rwdIdArr.length;
            cell.listRwd.dataSource = _.map(rwdIdArr, (id) => {
                return {
                    ico: { skin: clientCore.ItemsInfo.getItemIconUrl(id) }
                }
            });
            cell.listRwd.x = 317 + (3 - cell.listRwd.length) * 62;
            cell.boxLock.visible = !this.checkStageOpen(info);
            cell.imgGet.visible = info.state == clientCore.STAGE_STATU.REWARDED;
            if (cell.boxLock.visible) {
                if (xls.get(xls.stageBase).get(info.xlsData.require))
                    cell.txtUnlock.text = `（完成关卡${xls.get(xls.stageBase).get(info.xlsData.require).stageTitle}解锁）`;
                else
                    cell.txtUnlock.text = '';
            }
        }

        private checkStageOpen(info: clientCore.StageInfo) {
            //秘闻录关卡 需要判断
            let reqStageId = info.xlsData.require;
            //没有解锁条件 认为解锁了
            if (reqStageId == 0)
                return true;
            let reqStage1 = clientCore.AdventureManager.instance.getOneStageInfo(reqStageId);//普通
            let reqStage = _.find(this._chapterInfo.stageInfos, (o) => { return o.id == reqStageId });//活动
            if (reqStage)
                return reqStage.state != clientCore.STAGE_STATU.NO_COMPLETE;
            if (reqStage1)
                return reqStage1.state != clientCore.STAGE_STATU.NO_COMPLETE;
            //查不到关卡信息 认为没解锁
            return false;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                //解锁了
                if (!this.list.getCell(idx)['boxLock'].visible) {
                    EventManager.event(EV_OPEN_FIGHT_INFO_PANEL, this._chapterInfo.stageInfos[idx]);
                }
            }
        }

        destroy() {
            if (this._timePanel) {
                clientCore.DialogMgr.ins.close(this._timePanel, false);
                this._timePanel = null
            }
            BC.removeEvent(this);
            super.destroy()
        }
    }
}