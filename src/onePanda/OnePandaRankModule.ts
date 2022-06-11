namespace onePanda {
    const RANKID = 38;
    /**
     * 排行榜
     * 人手一只大熊猫
     * onePanda.OnePandaRankModule
     * 2021.9.26
     */


    export class OnePandaRankModule extends ui.onePanda.OnePandaRankModuleUI {
        private _rankList: clientCore.RankInfo[];
        private _twiceGet: boolean = false;
        private _rankCloseTime: number;
        private sex: number;
        private rewards: number[];
        private rankState:number = 0;
        private myRank:number;
        private tenRankList:clientCore.RankInfo[];

        init(d: any) {
            this.sex = clientCore.LocalInfo.sex;
            this.rewards = this.sex == 1 ? [1100138, 143703, 5000278] : [1100138, 143703, 5000278];
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(RANKID).then((data) => {
                this._rankList = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(RANKID, clientCore.LocalInfo.uid).then((data) => {
                if (this.labRank)
                    this.labRank.text = data?.msg?.ranking == 0 ? '默默无闻' : data?.msg?.ranking.toString();
                    //this.labScore.text = data?.msg?.score.toString();
                    this.myRank = data?.msg?.ranking;
            }));
            this.addPreLoad(xls.load(xls.rankInfo));
            this.addPreLoad(res.load(`atlas/onePanda/reward${this.sex}.atlas`, Laya.Loader.ATLAS));
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

        private onListRender(cell: ui.onePanda.renders.OnePandaItemUI, idx: number) {
            if (this._closed)
                return;
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            if (data && rank) {
                cell.txtRank.text = rank.ranking.toString();
                cell.txtNick.text = rank.userBase.nick;
                cell.txtScore.text = rank.score.toString();
                cell.txtfm.text = rank.userBase.familyName;
                if (rank.ranking <= 3) {
                    cell.imgTop.visible = true;
                    cell.txtRank.visible = false;
                    cell.imgTop.skin = `onePanda/top${rank.ranking}.png`;
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
            for (let i = 0; i < 3; i++) {
                this['imgTop_' + i].skin = idx == i ? 'onePanda/xuan_zhong_zhuang_tai.png' : 'onePanda/wei_xuan_zhong_zhuang_tai.png';
                this[`rankTxt` + i].color = idx==i ? `#ffffff`:`#6ab0ee`;
            }
            this.imgReward.skin = `onePanda/reward${this.sex}/${this.rewards[idx]}.png`;
            this.labRewardName.text = clientCore.ItemsInfo.getItemName(this.rewards[idx]);
            if(idx == 2){
                this.labRewardName.text = "加冕之礼背景秀 & 贴纸";
            }
        }

        private onTry() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: 1200043, condition: '前十名可获得{意境罗浮坐骑}', limit: '' });
            //clientCore.ModuleManager.open('rewardDetail.PreviewModule', 1200043);
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
            //this.changeBtn.skin = this.rankState == 0?"onePanda/checkTen.png":"onePanda/checkAll.png";
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
            //BC.addEvent(this, this.changeBtn, Laya.Event.CLICK, this, this.changeRankList);
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
            this.rewards = null;
            BC.removeEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this._rankList = null;
        }
    }
}