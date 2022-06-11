namespace mermaidRank {
    const RANKID = 32;
    /**
     * 活动排行榜
     * mermaidRank.MermaidRankModule
     */
    export class MermaidRankModule extends ui.mermaidRank.MermaidRankModuleUI {
        private _rankList: clientCore.RankInfo[];
        private _twiceGet: boolean = false;
        private _rankCloseTime: number;
        private sex: number;
        private rewards: number[] = [100 , 500 , 1000];
        private nameStr:string[] = ["星运•双子头像框&气泡" , "星运•双子翅膀" , "海沫舞台&爱琴海之夜背景秀"];
        private rankState:number = 0;
        private myRank:number;
        private tenRankList:clientCore.RankInfo[];

        init(d: any) {
            this.sex = clientCore.LocalInfo.sex;
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(RANKID).then((data) => {
                this._rankList = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(RANKID, clientCore.LocalInfo.uid).then((data) => {
                if (this.labRank)
                    this.labRank.text = data?.msg?.ranking == 0 ? '默默无闻' : data?.msg?.ranking.toString();
                    this.labScore.text = data?.msg?.score.toString();
                    this.myRank = data?.msg?.ranking;
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
            this.onRankRwdChange(1);
        }

        private onListRender(cell: ui.mermaidRank.render.RankItemUI, idx: number) {
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
                    cell.imgRank.skin = `mermaidRank/top${rank.ranking}.png`;
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
            let per = (this.boxScroll.height - this.imgScroll.height);
            this.imgScroll.y = per * scroll.value / scroll.max;
            if (scroll.value > 0.9 && !this._twiceGet && this._rankList.length > 40 && this.rankState==0) {
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
            for (let i = 1; i <= 3; i++) {
                this['btn_' + i].skin = idx == i ? 'mermaidRank/xuanzhongzhuangtai.png' : 'mermaidRank/weixuanzhongzhuangtai.png';
            }
            this.imgReward.skin = `mermaidRank/reward${this.rewards[idx-1]}.png`;
            this.labRewardName.text = this.nameStr[idx-1];
        }

        private onTry() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: 1200031, condition: '前十名可获得双子•暗夜坐骑', limit: '' });
            //clientCore.ModuleManager.open('rewardDetail.PreviewModule', 144702);
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

        private changeRankList(){
            this.rankState = (this.rankState + 1)%2;
            if(this.rankState == 1){
                clientCore.Logger.sendLog('2021年1月14日活动', '【主活动】', '点击查看我的前10名');
            }
            this.changeBtn.skin = this.rankState == 0?"mermaidRank/checkTen.png":"mermaidRank/checkAll.png";
            this.rankState == 0? this.showAllRank():this.showTenRank();
        }

        private showAllRank(){
            this.listRank.dataSource = this._rankList;
        }

        private showTenRank(){
            if(this.myRank == 0){
                alert.showFWords("您还未上榜~");
                return;
            }
            if(this.tenRankList){
                this.listRank.dataSource = this.tenRankList;
                return;
            }
            if(this.myRank <= this._rankList.length){
                this.tenRankList = this._rankList.slice(Math.max(0,this.myRank-11) , this.myRank-1);
            }else{
                clientCore.RankManager.ins.getSrvRank(RANKID, Math.max(0,this.myRank-11), this.myRank-1).then((data) => {
                    this.tenRankList = data;
                    this.listRank.dataSource = this.tenRankList;
                })
                
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.changeBtn, Laya.Event.CLICK, this, this.changeRankList);
            for (let i = 1; i <= 3; i++) {
                BC.addEvent(this, this['btn_' + i], Laya.Event.CLICK, this, this.onRankRwdChange, [i]);
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
            this.rewards = null;
            BC.removeEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this._rankList = null;
        }
    }
}