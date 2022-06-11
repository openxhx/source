namespace miniGameRank {
    const RANKID = 23;
    /**
     * 游乐园小游戏排行榜
     * miniGameRank.MiniGameRankModule
     */
    export class MiniGameRankModule extends ui.miniGameRank.MiniGameRankModuleUI {
        private _rankList: clientCore.RankInfo[];
        private _twiceGet: boolean = false;
        private _rewardInfo: xls.rankReward[];

        init(d: any) {
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(RANKID).then((data) => {
                this._rankList = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(RANKID, clientCore.LocalInfo.uid).then((data) => {
                this.labRank.text = data?.msg?.ranking == 0 ? '未上榜' : data?.msg?.ranking.toString();
                this.labScore.text = data?.msg?.score.toString();
                this.labName.text = data?.userName;
            }));
            this.addPreLoad(xls.load(xls.rankInfo));
            this.addPreLoad(xls.load(xls.rankReward));
            this.listRank.vScrollBarSkin = null;
            this.listRank.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listRank.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        onPreloadOver() {
            this.listRank.dataSource = this._rankList;
            this.boxProgress.visible = this.listRank.length >= 5;
            this._rewardInfo = _.filter(xls.get(xls.rankReward).getValues(), (o) => { return o.rankId == RANKID });
            for (let i: number = 1; i <= 5; i++) {
                let reward = clientCore.LocalInfo.sex == 1 ? this._rewardInfo[i - 1].femaleReward : this._rewardInfo[i - 1].maleReward;
                let item = reward[reward.length - 1];
                if (i != 2) this["item" + i].skin = clientCore.ItemsInfo.getItemIconUrl(item.v1);
                if (i == 5) this.labCnt.text = item.v2.toString();
            }
        }

        private onListRender(cell: ui.miniGameRank.render.RankItemUI, idx: number) {
            if (this._closed)
                return;
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            if (data && rank) {
                cell.rankTxt.text = rank.ranking.toString();
                cell.nameTxt.text = rank.userBase.nick;
                cell.scoreTxt.text = rank.score.toString();
                if (rank.ranking <= 3) {
                    cell.imgRank.visible = true;
                    cell.rankTxt.visible = false;
                    cell.imgRank.skin = `miniGameRank/top${rank.ranking}.png`;
                }
                else {
                    cell.imgRank.visible = false;
                    cell.rankTxt.visible = true;
                }
                cell.imgSelect.visible = rank.userBase.userid == clientCore.LocalInfo.uid;
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.UserInfoTip.showTips(this.listRank.getCell(idx), this.listRank.getItem(idx).msg.userBase);
            }
        }

        private onScroll() {
            if (!this._rankList) return;
            let scroll = this.listRank.scrollBar;
            let per = (this.boxProgress.height - this.imgProgress.height);
            this.imgProgress.y = per * scroll.value / scroll.max;
            if (scroll.value > 0.9 && !this._twiceGet && this._rankList.length > 40) {
                this._twiceGet = true;
                clientCore.RankManager.ins.getSrvRank(RANKID, 50, 99).then((data) => {
                    if (this._rankList) {
                        this.listRank.dataSource = this._rankList.concat(data);
                        this.boxProgress.visible = this.listRank.length >= 5;
                        this.onScroll();
                    }
                })
            }
        }

        private showTip(idx: number) {
            let reward = clientCore.LocalInfo.sex == 1 ? this._rewardInfo[idx - 1].femaleReward : this._rewardInfo[idx - 1].maleReward;
            if (idx != 2) {
                let item = reward[reward.length - 1];
                clientCore.ToolTip.showTips(this["item" + idx], { id: item.v1 });
            } else {
                let item1 = reward[reward.length - 1];
                let item2 = reward[reward.length - 2];
                clientCore.ToolTip.showContentTips(this["item" + idx], 0, [item1, item2]);
            }
        }

        private goPark() {
            this.needOpenMod = null;
            clientCore.ToolTip.gotoMod(176);
        }

        private onDetail(): void {
            alert.showRuleByID(1183);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goPark);
            BC.addEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            for (let i: number = 1; i <= 4; i++) {
                BC.addEvent(this, this["item" + i], Laya.Event.CLICK, this, this.showTip, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
            // Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            super.destroy();
            for (const o of this._rankList) {
                o.dispose();
            }
            BC.removeEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this._rankList = null;
        }
    }
}