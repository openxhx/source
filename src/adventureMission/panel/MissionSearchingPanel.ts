namespace adventureMission {
    import StringUtils = util.StringUtils;
    export class MissionSearchingPanel extends ui.adventureMission.SearchingPanelUI {
        private _teamIdx: number;
        private _teamInfo: clientCore.TeamInfo;
        private _exploreInfo: xls.exploreBase;
        private _log: pb.Iexplore_log[];
        private _logTimeArr: number[];//log时间数组（这里是消耗时间）
        constructor() {
            super();
            this.listLog.dataSource = [];
            this.listLog.vScrollBarSkin = null;
            this.listLog.renderHandler = new Laya.Handler(this, this.onListLogRender);
            this.mcRewardList.dataSource = [];
            this.mcRewardList.renderHandler = new Laya.Handler(this, this.onListRewardRender);
            BC.addEvent(this, this.btnGetReward, Laya.Event.CLICK, this, this.onGetReward);
            BC.addEvent(this, this.btnCompleteNow, Laya.Event.CLICK, this, this.onComplete);
            BC.addEvent(this, this.btnGiveUp, Laya.Event.CLICK, this, this.onGiveUp);
        }

        show(idx: number) {
            this._teamIdx = idx;
            this._teamInfo = clientCore.AdventureMissonManager.instance.teamsInfo[idx];
            this._exploreInfo = xls.get(xls.exploreBase).get(this._teamInfo.srvData.exploreId);
            this.txtMapName.text = this._exploreInfo.map;
            this.mcSearching.visible = this._teamInfo.state == clientCore.TEAM_STATE.WORKING;
            this.imgReward.visible = this._teamInfo.state == clientCore.TEAM_STATE.COMPLETE;
            this.txtRestTime.text = '';
            Laya.timer.clear(this, this.onTimer);
            if (this._teamInfo.state == clientCore.TEAM_STATE.WORKING) {
                this._log = this._teamInfo.srvData.logLists;
                this._logTimeArr = _.map(this._log, 'time');
                this.updateLog();
                Laya.timer.loop(400, this, this.onTimer);
            }
            if (this._teamInfo.state == clientCore.TEAM_STATE.COMPLETE) {
                this.setLog(this._teamInfo.srvData.logLists);
            }
        }

        private setLog(logs: pb.Iexplore_log[]) {
            this.listLog.dataSource = logs;
            this.listLog.scrollTo(logs.length);
            this.mcRewardList.dataSource = _.compact(_.map(logs, (log) => {
                return log.awardInfo;
            }));
            this.boxReward.visible = this.mcRewardList.length > 0;
        }

        private onTimer() {
            this.txtRestTime.text = util.StringUtils.getDateStr(this._teamInfo.restTime);
            this.txtLeafNum.text = 'x' + Math.ceil(this._teamInfo.restTime / 60);
        }

        private updateLog() {
            let nowTime = this._teamInfo.useTime;
            let logIdx = _.findIndex(this._logTimeArr, (logT) => {
                return nowTime < logT;
            });
            if (logIdx > -1) {
                let nextLogTime = this._logTimeArr[logIdx] - nowTime;
                if (nextLogTime > 0) {
                    this.setLog(this._log.slice(0, logIdx));
                    Laya.timer.once(nextLogTime * 1000, this, this.updateLog);
                }
            }
        }

        private onListLogRender(cell: Laya.Box, idx: number) {
            let txt = cell.getChildAt(0) as Laya.HTMLDivElement;
            txt.style.fontSize = 20;
            txt.style.wordWrap = false;
            let data = cell.dataSource as pb.Iexplore_log;
            let xlsLogInfo = xls.get(xls.teamLog).get(data.logId);//log表中对应数据
            //时间 黑色
            let start = new Date()
            start.setTime(this._teamInfo.srvData.startTime * 1000 + data.time * 1000);
            let time = start.getHours() * 3600 + start.getMinutes() * 60 + start.getSeconds();
            let txtTime = StringUtils.getColorText(`[${StringUtils.getDateStr(time)}]`, '#000000');
            //说话npc
            let npc = data.roleId > 0 ? StringUtils.getColorText(clientCore.RoleManager.instance.getRoleById(data.roleId).name + ':', '#ff5a00') : '';
            //主文本 系统和其他分两种颜色
            let mainColor = xlsLogInfo.dialogueType == 2 ? '#000000' : '#ff5a00';
            let monster = StringUtils.getColorText(data.monster == 0 ? '' : this._exploreInfo.monsterLog[data.monster - 1], '#ff0000');
            let place = StringUtils.getColorText(data.place == 0 ? '' : this._exploreInfo.placeLog[data.place - 1], '#0202f0');
            let map = StringUtils.getColorText(this._exploreInfo.map, '#0000ff');
            let rwdNum = data.awardInfo ? StringUtils.getColorText(data.awardInfo.itemCnt.toString(), '#ff0000') : '';
            let rwdName = data.awardInfo ? StringUtils.getColorText(clientCore.ItemsInfo.getItemInfo(data.awardInfo.itemId).name, '#ff0000') : '';
            let arr = xlsLogInfo.dialogueText.split('#');
            let str = txtTime + npc;
            for (const s of arr) {
                switch (s) {
                    case 'monster':
                        str += monster
                        break;
                    case 'place':
                        str += place
                        break;
                    case 'map':
                        str += map
                        break;
                    case 'num':
                        str += rwdNum
                        break;
                    case 'item':
                        str += rwdName;
                        break;
                    default:
                        str += StringUtils.getColorText(s, mainColor);
                        break;
                }
            }
            if (idx == window['testIdx'])
                console.log(str)
            txt.innerHTML = str;
        }

        private transLogArrToOneText(arr: Array<{ txt: string, color: string }>) {
            return _.reduce(arr, (prev: string, curr) => {
                return prev.concat(StringUtils.getColorText(curr.txt, curr.color))
            }, '');
        }

        private onListRewardRender(cell: ui.adventureMission.panel.SearchRewardPanelUI, idx: number) {
            let data = cell.dataSource as pb.IItemInfo;
            cell.mcRewardImg.skin = clientCore.ItemsInfo.getItemIconUrl(data.itemId);
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.itemId);
        }

        private onGetReward() {
            clientCore.AdventureMissonManager.instance.getExploreReward(this._teamIdx);
        }

        private onComplete() {
            let needLeafNum = Math.ceil(this._teamInfo.restTime / 60);
            if(clientCore.GlobalConfig.showUseLeafAlert && needLeafNum >= 100){
                alert.useLeafAlert(needLeafNum,this,()=>{
                    this.useLeafComplete();
                });
            }
            else{
                this.useLeafComplete();
            }
        }

        private useLeafComplete(){
            alert.useLeaf(Math.ceil(this._teamInfo.restTime / 60), Laya.Handler.create(this, () => {
                clientCore.AdventureMissonManager.instance.comleteExplore(this._teamIdx);
            }))
        }

        private onGiveUp() {
            clientCore.AdventureMissonManager.instance.giveUpExplore(this._teamIdx);
        }

        destroy() {
            Laya.timer.clear(this, this.onTimer);
            Laya.timer.clear(this, this.updateLog);
        }
    }
}