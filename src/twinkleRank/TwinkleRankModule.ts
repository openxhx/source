namespace twinkleRank {
    const RULEID = 1212;
    /**
     * 闪耀秀场排行榜
     * twinkleRank.TwinkleRankModule
     */
    export class TwinkleRankModule extends ui.twinkleRank.TwinkleRankModuleUI {
        private _rankList: clientCore.RankInfo[];
        private _twiceGet: boolean = false;
        private _rewardInfo: xls.rankReward[];

        private _rankId: number = 1001;
        init(d: any) {
            let cur = util.TimeUtil.floorWeekTime(clientCore.ServerManager.curServerTime);
            let start = util.TimeUtil.formatTimeStrToSec("2021-10-4 00:00:00");
            if (cur > start) {
                this._rankId += Math.round((cur - start) / (7 * util.TimeUtil.DAYTIME));
            }
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(this._rankId).then((data) => {
                this._rankList = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(this._rankId, clientCore.LocalInfo.uid).then((data) => {
                this.labRank.text = data?.msg?.ranking == 0 ? '未上榜' : data?.msg?.ranking.toString();
                this.imgRank.visible = data?.msg?.ranking <= 3 && data?.msg?.ranking > 0;
                this.labRank.visible = data?.msg?.ranking > 3;
                if (this.imgRank.visible) this.imgRank.skin = `twinkleRank/top${data?.msg?.ranking}.png`;
                if (data?.msg?.ranking == 0) {
                    this.labPoint.text = '0';
                    this.labStar.text = '0';
                } else {
                    let strScore = data?.msg?.score.toString();
                    this.labStar.text = strScore.slice(0, 2);
                    this.labPoint.text = strScore.slice(2);
                }
                this.labNickName.text = data?.userName;
            }));
            this.addPreLoad(xls.load(xls.rankInfo));
            this.addPreLoad(xls.load(xls.rankReward));
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        onPreloadOver() {
            this.list.dataSource = this._rankList;
            this.boxProgress.visible = this.list.length >= 5;
            this._rewardInfo = _.filter(xls.get(xls.rankReward).getValues(), (o) => { return o.rankId == this._rankId });
            // for (let i: number = 1; i <= 5; i++) {
            //     let reward = clientCore.LocalInfo.sex == 1 ? this._rewardInfo[i - 1].femaleReward : this._rewardInfo[i - 1].maleReward;
            //     let item = reward[reward.length - 1];
            //     if (i != 2) this["item" + i].skin = clientCore.ItemsInfo.getItemIconUrl(item.v1);
            //     // if (i == 5) this.labCnt.text = item.v2.toString();
            // }
        }

        private onListRender(cell: ui.twinkleRank.render.TwinkleRankItemUI, idx: number) {
            if (this._closed)
                return;
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            if (data && rank) {
                cell.rankTxt.text = rank.ranking.toString();
                cell.nameTxt.text = rank.userBase.nick;
                let strScore = rank.score.toString();
                cell.starTxt.text = strScore.slice(0, 2);
                cell.scoreTxt.text = strScore.slice(2);
                if (rank.ranking <= 3) {
                    cell.imgRank.visible = true;
                    cell.rankTxt.visible = false;
                    cell.imgRank.skin = `twinkleRank/top${rank.ranking}.png`;
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
                clientCore.UserInfoTip.showTips(this.list.getCell(idx), this.list.getItem(idx).msg.userBase);
            }
        }

        private onScroll() {
            if (!this._rankList) return;
            let scroll = this.list.scrollBar;
            let per = (this.boxProgress.height - this.imgProgress.height);
            this.imgProgress.y = per * scroll.value / scroll.max;
            if (scroll.value > 0.9 && !this._twiceGet && this._rankList.length > 40) {
                this._twiceGet = true;
                clientCore.RankManager.ins.getSrvRank(this._rankId, 50, 99).then((data) => {
                    if (this._rankList) {
                        this.list.dataSource = this._rankList.concat(data);
                        this.boxProgress.visible = this.list.length >= 5;
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

        private onDetail(): void {
            alert.showRuleByID(RULEID);
        }

        private checkSell(): number {
            let time :xls.rankInfo[];
            time = _.filter(xls.get(xls.rankInfo).getValues(), (o) => { return o.rankId == this._rankId });
            return util.TimeUtil.formatTimeStrToSec(time[0].closeTime) - clientCore.ServerManager.curServerTime;
        }

        private onTime() {
            this.timeTxt.changeText(`${util.StringUtils.getDateStr2(this.checkSell(), '{hour}:{min}:{sec}')}`);
        }

        addEventListeners() {
            Laya.timer.loop(1000, this, this.onTime);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            // for (let i: number = 1; i <= 4; i++) {
            //     BC.addEvent(this, this["item" + i], Laya.Event.CLICK, this, this.showTip, [i]);
            // }
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTime);
        }

        destroy() {
            super.destroy();
            for (const o of this._rankList) {
                o.dispose();
            }
            BC.removeEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this._rankList = null;
        }
    }
}