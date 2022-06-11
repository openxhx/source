namespace cavelDream {
    const RANKID = 37;
    /**
     * 卷角之梦排行榜
     * cavelDream.CavelDreamRankModule
     */
    export class CavelDreamRankModule extends ui.cavelDream.CavelDreamRankModuleUI {
        private _rankList: clientCore.RankInfo[];
        private _twiceGet: boolean = false;
        private _rankCloseTime: number;

        init(d: any) {
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(RANKID).then((data) => {
                this._rankList = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(RANKID, clientCore.LocalInfo.uid).then((data) => {
                if (this.txtRank)
                    this.txtRank.text = data?.msg?.ranking == 0 ? '默默无闻' : data?.msg?.ranking.toString();
            }));
            this.addPreLoad(xls.load(xls.rankInfo));
            this.listRank.vScrollBarSkin = null;
            this.listRank.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listRank.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        onPreloadOver() {
            this.listRank.dataSource = this._rankList;
            this.boxScroll.visible = this.listRank.length >= 7;
            this._rankCloseTime = util.TimeUtil.formatTimeStrToSec(xls.get(xls.rankInfo).get(RANKID).closeTime);
            Laya.timer.loop(1000, this, this.onTimer);
            this.onTimer();
            this.onRankRwdChange(0);
        }

        private onListRender(cell: ui.cavelDream.renders.DreamRankItemUI, idx: number) {
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
                    cell.imgTop.skin = `cavelDream/top${rank.ranking}.png`;
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

        private onRankRwdChange(idx: number) {
            for (let i = 0; i < 3; i++) {
                this['imgTop_' + i].skin = idx == i ? 'cavelDream/xuan_zhong_zhuang_tai.png' : 'cavelDream/wei_xuan_zhong_zhuang_tai.png';
            }
            this.imgReward.skin = `cavelDream/reward${[100, 500, 1000][idx]}.png`;
            this.labRwardName.text = ["星运·金牛头像框+气泡", "星运·金牛翅膀", "流云金阁背景秀"][idx];
        }

        private onTry() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: 1200036, condition: '', limit: '' });
        }

        private onTimer() {
            let now = clientCore.ServerManager.curServerTime;
            let dis = Math.max(0, this._rankCloseTime - now);
            this.txtTime.text = util.StringUtils.getDateStr2(dis);
            if (now > this._rankCloseTime) {
                this.txtTime.text = '已截止';
                Laya.timer.clear(this, this.onTimer);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['imgTop_' + i], Laya.Event.CLICK, this, this.onRankRwdChange, [i]);
            }
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
            BC.removeEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this._rankList = null;
        }
    }
}