namespace countdownBlessing {
    const RANKID = 17;
    /**
     * 倒数计时的祝福排行榜
     * countdownBlessing.CountdownBlessingRankModule
     */
    export class CountdownBlessingRankModule extends ui.countdownBlessing.BlessingRankModuleUI {
        private _rankList: clientCore.RankInfo[];
        private _twiceGet: boolean = false;
        private _rankCloseTime: number;

        init(d: any) {
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(RANKID).then((data) => {
                this._rankList = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(RANKID, clientCore.LocalInfo.uid).then((data) => {
                if (this.labRank)
                    this.labRank.text = data?.msg?.ranking == 0 ? '默默无闻' : data?.msg?.ranking.toString();
                if(this.labScore)
                    this.labScore.text = ""+data?.msg?.score;
            }));
            this.addPreLoad(xls.load(xls.rankInfo));
            this.imgToushi.skin = clientCore.ItemsInfo.getItemIconUrl(this.toushi);
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        onPreloadOver() {
            this.list.dataSource = this._rankList;
            this.boxScroll.visible = this.list.length >= 7;
            this._rankCloseTime = util.TimeUtil.formatTimeStrToSec(xls.get(xls.rankInfo).get(RANKID).closeTime);
            Laya.timer.loop(1000, this, this.onTimer);
            this.onTimer();
        }

        private get toushi(): number {
            return clientCore.LocalInfo.sex == 1 ? 132558 : 132559;
        }

        private onListRender(cell: ui.countdownBlessing.render.BlessingRankItemUI, idx: number) {
            if (this._closed)
                return;
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            if (data && rank) {
                cell.txtRank.text = rank.ranking.toString();
                cell.txtNick.text = rank.userBase.nick;
                cell.txtScore.text = rank.score.toString();
                cell.txtFname.text = rank.userBase.familyName;
                if (rank.ranking <= 3) {
                    cell.imgTop.visible = true;
                    cell.txtRank.visible = false;
                    cell.imgTop.skin = `countdownBlessing/top${rank.ranking}.png`;
                }
                else {
                    cell.imgTop.visible = false;
                    cell.txtRank.visible = true;
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
            let scroll = this.list.scrollBar;
            let per = (this.boxScroll.height - this.imgScroll.height);
            this.imgScroll.y = per * scroll.value / scroll.max;
            if (scroll.value > 0.9 && !this._twiceGet && this._rankList.length > 40) {
                this._twiceGet = true;
                clientCore.RankManager.ins.getSrvRank(RANKID, 50, 99).then((data) => {
                    if (this._rankList) {
                        this.list.dataSource = this._rankList.concat(data);
                        this.boxScroll.visible = this.list.length >= 7;
                        this.onScroll();
                    }
                })
            }
        }

        private onTimer() {
            let now = clientCore.ServerManager.curServerTime;
            let dis = Math.max(0, this._rankCloseTime - now);
            this.labTime.text = util.StringUtils.getDateStr2(dis);
            if (now > this._rankCloseTime) {
                this.labTime.text = '已截止';
                Laya.timer.clear(this, this.onTimer);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            super.destroy();
            for (const o of this._rankList) {
                o.dispose();
            }
            this._rankList = null;
        }
    }
}