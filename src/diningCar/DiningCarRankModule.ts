namespace diningCar {
    const RANKID = 18;
    /**
     * 花仙早餐车排行榜
     * diningCar.DiningCarRankModule
     */
    export class DiningCarRankModule extends ui.diningCar.DiningCarRankModuleUI {
        private _rankList: clientCore.RankInfo[];
        private _twiceGet: boolean = false;

        init(d: any) {
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(RANKID).then((data) => {
                this._rankList = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(RANKID, clientCore.LocalInfo.uid).then((data) => {
                this.labRank.text = data?.msg?.ranking == 0 ? '默默无闻' : data?.msg?.ranking.toString();
                this.labName.text = data?.userName;
                this.labScore.text = "" + data?.msg?.score;
            }));
            this.addPreLoad(xls.load(xls.rankInfo));
            this.listRank.vScrollBarSkin = null;
            this.listRank.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listRank.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年1月22日活动', '【主活动】花仙餐车', '打开排行榜弹窗');
            this.listRank.dataSource = this._rankList;
            this.boxScroll.visible = this.listRank.length > 5;
        }

        private onListRender(cell: ui.diningCar.render.DiningCarRankItemUI, idx: number) {
            if (this._closed)
                return;
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            if (data && rank) {
                cell.txtRank.text = rank.ranking.toString();
                cell.txtNick.text = rank.userBase.nick;
                cell.txtScore.text = rank.score.toString();
                if (rank.ranking <= 3) {
                    cell.imgTop.visible = true;
                    cell.txtRank.visible = false;
                    cell.imgTop.skin = `diningCar/top${rank.ranking}.png`;
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
                clientCore.UserInfoTip.showTips(this.listRank.getCell(idx), this.listRank.getItem(idx).msg.userBase);
            }
        }

        private onScroll() {
            if (!this._rankList) return;
            let scroll = this.listRank.scrollBar;
            let per = (this.boxScroll.height - this.imgScroll.height);
            this.imgScroll.y = per * scroll.value / scroll.max;
            if (scroll.value > 0.9 && !this._twiceGet && this._rankList.length > 40) {
                this._twiceGet = true;
                clientCore.RankManager.ins.getSrvRank(RANKID, 50, 99).then((data) => {
                    if (this._rankList) {
                        this.listRank.dataSource = this._rankList.concat(data);
                        this.boxScroll.visible = this.listRank.length >= 7;
                        this.onScroll();
                    }
                })
            }
        }

        private showTips(idx: number, e: Laya.Event) {
            let femaleReward = [3500030, 126440, 118513, 3800053];
            let maleReward = [3500030, 126441, 118522, 3800053];
            let reward = clientCore.LocalInfo.sex == 1 ? femaleReward[idx] : maleReward[idx];
            clientCore.ToolTip.showTips(e.currentTarget, { id: reward });
        }

        addEventListeners() {
            for (let i: number = 0; i <= 3; i++) {
                BC.addEvent(this, this["imgItem" + i], Laya.Event.CLICK, this, this.showTips, [i]);
            }
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
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