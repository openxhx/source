namespace adventureAct {
    export class ActDetailPanel extends ui.adventureAct.panel.ActDetailPanelUI {
        private _chapterInfo: clientCore.ChapterInfo;
        private _timePanel: BuyTimePanel;
        constructor() {
            super();
            this.sideClose = true;
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show(chapter: clientCore.ChapterInfo) {
            this.list.dataSource = chapter.stageInfos;
            this._chapterInfo = chapter;
            this.imgRole.skin = pathConfig.getAdventureAct(chapter.id).role;
            this.boxTime.visible = chapter.xlsData.activity == 1;
            this.updateView();
        }

        updateView() {
            let timesInfo = clientCore.AdventureActManager.instance.getCntInfo();
            this.txtUseTimes.text = (timesInfo.totalCnt - timesInfo.passCnt).toString();
            this.txtTimes.text = '/' + timesInfo.totalCnt;
        }

        private onOpenTimePanel() {
            this._timePanel = this._timePanel || new BuyTimePanel();
            this._timePanel.show();
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
                    cell.txtUnlock.text = `???????????????${xls.get(xls.stageBase).get(info.xlsData.require).stageTitle}?????????`;
                else
                    cell.txtUnlock.text = '';
            }
        }

        private checkStageOpen(info: clientCore.StageInfo) {
            //??????????????? ????????????
            let reqStageId = info.xlsData.require;
            //?????????????????? ???????????????
            if (reqStageId == 0)
                return true;
            let reqStage1 = clientCore.AdventureManager.instance.getOneStageInfo(reqStageId);//??????
            let reqStage = _.find(this._chapterInfo.stageInfos, (o) => { return o.id == reqStageId });//??????
            if (reqStage)
                return reqStage.state != clientCore.STAGE_STATU.NO_COMPLETE;
            if (reqStage1)
                return reqStage1.state != clientCore.STAGE_STATU.NO_COMPLETE;
            //????????????????????? ???????????????
            return false;
        }

        private async onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                //?????????
                if (!this.list.getCell(idx)['boxLock'].visible) {
                    let stage = this._chapterInfo.stageInfos[idx];
                    let mod = await clientCore.ModuleManager.open("fightInfo.FightInfoModule", stage);
                    BC.addEvent(this, mod, Laya.Event.CHANGED, this, this.updateView);
                    BC.addEvent(this, mod, Laya.Event.ENTER, this, this.onEnterFight, [stage]);
                }
            }
        }

        private onEnterFight(stage: clientCore.StageInfo) {
            clientCore.AdventureActManager.instance.gotoStage(stage);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onOpenTimePanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            if (this._timePanel) {
                clientCore.DialogMgr.ins.close(this._timePanel, false);
                this._timePanel = null
            }
            super.destroy()
        }
    }
}