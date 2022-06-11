namespace eventRank {
    const RANKID = [35, 36];
    /**
     * 活动排行榜
     * eventRank.EventRankModule
     */
    export class EventRankModule extends ui.eventRank.EventRankModuleUI {
        private _rankList0: clientCore.RankInfo[];
        private _rankList1;
        private _rankList2: clientCore.RankInfo[];
        private _twiceGet: boolean[] = [false, false];
        private _rankCloseTime: number;
        private sex: number;
        private rewards0: number[];
        private rewards1: number[];
        private rewards2: number[];
        private rankState: number = 0;
        private myRank: number;
        private tenRankList0: clientCore.RankInfo[];
        private tenRankList1: clientCore.RankInfo[];
        private tenRankList2: clientCore.RankInfo[];
        private curTab: number = 0;
        private myRankData0;
        private myRankData1;
        private myRankData2;
        private rewardArr: number[][] = [[151099, 151101], [300116, 300115]];

        init(d: any) {
            this.sex = clientCore.LocalInfo.sex;
            this.rewards0 = this.sex == 1 ? [127269, 3800077, 3800078] : [127270, 3800077, 3800078];
            this.rewards1 = this.sex == 1 ? [300118, 300117, 300119] : [300118, 300117, 300119];
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(RANKID[0]).then((data) => {
                this._rankList0 = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(RANKID[0], clientCore.LocalInfo.uid).then((data) => {
                this.myRankData0 = data;
            }));
            // if (clientCore.ServerManager.curServerTime > util.TimeUtil.formatTimeStrToSec("2022-2-28 00:00:00")) {
            //     this.addPreLoad(net.sendAndWait(new pb.cs_double_rank_info({ rankId: RANKID[1], start: 0, end: 49, flag: 1 }))
            //         .then((msg: pb.sc_double_rank_info) => {
            //             this._rankList1 = msg.rankInfo;
            //         }));
            //     this.addPreLoad(net.sendAndWait(new pb.cs_get_user_double_ranking_info({ rankId: RANKID[1], uid: clientCore.LocalInfo.uid, flag: 1 }))
            //         .then((msg) => {
            //             this.myRankData1 = msg;
            //         }));
            // }
            this.addPreLoad(xls.load(xls.rankInfo));
            this.addPreLoad(res.load(`atlas/eventRank/reward${this.sex}.atlas`, Laya.Loader.ATLAS));
            this.listRank.vScrollBarSkin = null;
            this.listRank.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listRank.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.btnTry.visible = false;
        }

        onPreloadOver() {
            this.changeTab(0);
            this._rankCloseTime = util.TimeUtil.formatTimeStrToSec(xls.get(xls.rankInfo).get(RANKID[0]).closeTime);
            Laya.timer.loop(1000, this, this.onTimer);
            this.onTimer();
            this.onRankRwdChange(0);
        }

        private getDoubleRank() {
            net.sendAndWait(new pb.cs_double_rank_info({ rankId: RANKID[1], start: 0, end: 49, flag: 1 })).then((msg: pb.sc_double_rank_info) => {
                this._rankList1 = msg.rankInfo;
            })
            net.sendAndWait(new pb.cs_get_user_double_ranking_info({ rankId: RANKID[1], uid: clientCore.LocalInfo.uid, flag: 1 }))
                .then((msg: pb.sc_double_rank_info) => {
                    this.myRankData1 = msg;
                })
        }

        private getFamilyRank() {
            clientCore.RankManager.ins.getSrvRank(RANKID[1]).then((data) => {
                this._rankList1 = data;
            });
            clientCore.RankManager.ins.getUserRank(RANKID[1], clientCore.LocalInfo.uid).then((data) => {
                this.myRankData1 = data;
            });
        }

        private onListRender(cell: ui.eventRank.render.EventRankItemUI, idx: number) {
            if (this._closed)
                return;
            let data;
            let rank;
            if (this.curTab == 0) {
                data = cell.dataSource as clientCore.RankInfo;
                rank = data.msg as pb.IRankInfo;
            } else {
                data = cell.dataSource as clientCore.RankInfo;
                rank = data.msg as pb.IFamilyRankInfo;
            }
            // else if (this.curTab == 1) {
            //     rank = cell.dataSource as pb.IDoubleRankInfo;
            // }
            if (rank) {
                cell.txtRank.text = rank.ranking.toString();
                if (this.curTab == 0) {
                    cell.txtNick.text = rank.userBase.nick;
                    cell.imgSelect.visible = rank.userBase.userid == clientCore.LocalInfo.uid;
                }else{
                    cell.txtNick.text = rank.familyName;
                    cell.imgSelect.visible = rank.ranking == this.myRankData1?.rankInfo?.ranking;
                }
                // else if(this.curTab == 1){
                //     cell.txtNick.text = rank.userBaseA.nick + "&" + rank.userBaseB.nick;
                //     cell.imgSelect.visible = rank.userBaseA.userid == clientCore.LocalInfo.uid || rank.userBaseB.userid == clientCore.LocalInfo.uid;
                // }
                cell.txtScore.text = rank.score.toString();
                if (rank.ranking <= 3) {
                    cell.imgTop.visible = true;
                    cell.txtRank.visible = false;
                    cell.imgTop.skin = `eventRank/top${rank.ranking}.png`;
                }
                else {
                    cell.imgTop.visible = false;
                    cell.txtRank.visible = true;
                }
            }
        }

        private async changeTab(i: number) {
            this.curTab = i;
            this.tabImg0.skin = `eventRank/yeqian${this.curTab == 0 ? 1 : 0}.png`;
            this.tabImg1.skin = `eventRank/yeqian${this.curTab == 1 ? 1 : 0}.png`;
            if (this.curTab == 0) {
                this.preTip.visible = false;
                this.listRank.visible = true;
                this.listRank.dataSource = this._rankList0;
                this.boxScroll.visible = this.listRank.length >= 7;
                this.labRank.text = this.myRankData0?.msg?.ranking == 0 ? '默默无闻' : this.myRankData0?.msg?.ranking.toString();
                this.labScore.text = this.myRankData0?.msg?.score.toString();
                this.myRank = this.myRankData0?.msg?.ranking;
            } else if(clientCore.ServerManager.curServerTime > util.TimeUtil.formatTimeStrToSec("2022-3-7 00:00:00")){
                if (!this._rankList1 || !this.myRankData1) {
                    await clientCore.RankManager.ins.getSrvRank(RANKID[1]).then((data) => {
                        this._rankList1 = data;
                    });
                    await clientCore.RankManager.ins.getUserRank(RANKID[1], clientCore.LocalInfo.uid).then((data) => {
                        this.myRankData1 = data;
                    });
                }
                this.listRank.dataSource = this["_rankList" + this.curTab];
                this.boxScroll.visible = this.listRank.length >= 7;
                if(this.myRankData1?.msg){
                    this.labRank.text = this.myRankData1?.msg?.ranking == 0 ? '默默无闻' : this.myRankData1?.msg?.ranking.toString();
                    this.labScore.text = this.myRankData1?.msg?.score.toString();
                    this.myRank = this.myRankData1?.msg?.ranking;
                }else{
                    this.labRank.text = '默默无闻' ;
                    this.labScore.text = "0";
                    this.myRank = 0;
                }
                // if(this.curTab == 1){
                //     if (!this._rankList1 || !this.myRankData1) {
                //         this.getDoubleRank();
                //     }
                //     this.labRank.text = this.myRankData1?.rankInfo?.ranking == 0 ? '默默无闻' : this.myRankData1?.rankInfo?.ranking.toString();
                //     this.labScore.text = this.myRankData1?.rankInfo?.score.toString();
                //     this.myRank = this.myRankData1?.rankInfo?.ranking;
                // }else{
                //     if (!this._rankList2 || !this.myRankData2) {
                //         this.getFamilyRank();
                //     }
                //     this.labRank.text = this.myRankData2?.msg?.ranking == 0 ? '默默无闻' : this.myRankData2?.msg?.ranking.toString();
                //     this.labScore.text = this.myRankData2?.msg?.score.toString();
                //     this.myRank = this.myRankData2?.msg?.ranking;
                // }
                this.preTip.visible = false;
                this.listRank.visible = true;
            }else{
                this.preTip.visible = true;
                this.listRank.visible = false;
            }
            this.scoreTxt.text = `超过${this.curTab == 0? 10:100}分`;
            this.changeRewardShow();
            this.onRankRwdChange(0);
        }

        changeRewardShow() {
            for (let i = 0; i < 2; i++) {
                this["reward" + i].skin = "eventRank/" + this.rewardArr[this.curTab][i] + ".png";
                this["name" + i].text = clientCore.ItemsInfo.getItemName(this.rewardArr[this.curTab][i]);
            }
            for(let i=0 ; i<5 ; i++){
                this["rank" + i].skin = `eventRank/top${i}_${this.curTab}.png`;
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && this.curTab == 0) {
                clientCore.UserInfoTip.showTips(this.listRank.getCell(idx), this.listRank.getItem(idx).msg.userBase);
            }
        }

        private onScroll() {
            if (!this["_rankList" + this.curTab]) return;
            let scroll = this.listRank.scrollBar;
            let per = (this.boxScroll.height - this.imgScroll.height);
            this.imgScroll.y = per * scroll.value / scroll.max;
            if (scroll.value > 0.9 && !this._twiceGet[this.curTab] && this["_rankList" + this.curTab].length > 40 && this.rankState == 0) {
                this._twiceGet[this.curTab] = true;
                if (this.curTab == 0 || this.curTab == 1) {
                    clientCore.RankManager.ins.getSrvRank(RANKID[this.curTab], 50, 99).then((data) => {
                        if (this["_rankList" + this.curTab]) {
                            this.listRank.dataSource = this["_rankList" + this.curTab].concat(data);
                            this.boxScroll.visible = this.listRank.length >= 7;
                            this.onScroll();
                        }
                    });
                } 
                // else {
                //     net.sendAndWait(new pb.cs_double_rank_info({ rankId: RANKID[1], start: 50, end: 99, flag: 1 })).then((msg: pb.sc_double_rank_info) => {
                //         if (this["_rankList" + this.curTab]) {
                //             this.listRank.dataSource = this["_rankList" + this.curTab].concat(msg.rankInfo);
                //             this.boxScroll.visible = this.listRank.length >= 7;
                //             this.onScroll();
                //         }
                //     })
                // }
            }
        }

        private onRankRwdChange(idx: number) {
            for (let i = 0; i < 3; i++) {
                this['imgTop' + i].skin = idx == i ? 'eventRank/xuan_zhong_zhuang_tai.png' : 'eventRank/wei_xuan_zhong_zhuang_tai.png';
            }
            this.imgReward.skin = `eventRank/reward${this.sex}/${this["rewards" + this.curTab][idx]}.png`;
            this.labRewardName.text = clientCore.ItemsInfo.getItemName(this["rewards" + this.curTab][idx]);
        }

        private onTry() {
            // clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: 1200008, condition: '前十名可获得{蝶之梦坐骑}', limit: '' });
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.rewardArr[this.curTab][1]);
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

        private changeRankList() {
            this.rankState = (this.rankState + 1) % 2;
            if (this.rankState == 1) {
                clientCore.Logger.sendLog('2021年1月14日活动', '【主活动】', '点击查看我的前10名');
            }
            this.changeBtn.skin = this.rankState == 0 ? "eventRank/checkTen.png" : "eventRank/checkAll.png";
            this.rankState == 0 ? this.showAllRank() : this.showTenRank();
        }

        private showAllRank() {
            if (this.listRank.visible == false) {
                return;
            }
            this.listRank.dataSource = this["_rankList" + this.curTab];
        }

        private showTenRank() {
            if (this.listRank.visible == false) {
                return;
            }
            if (this.myRank == 0) {
                alert.showFWords("您还未上榜~");
                return;
            }
            if (this["tenRankList" + this.curTab]) {
                this.listRank.dataSource = this["tenRankList" + this.curTab];
                return;
            }
            if (this.myRank <= this["_rankList" + this.curTab].length) {
                this["tenRankList" + this.curTab] = this["_rankList" + this.curTab].slice(Math.max(0, this.myRank - 11), this.myRank - 1);
                this.listRank.dataSource = this["tenRankList" + this.curTab];
            } else {
                if (this.curTab == 0 || this.curTab == 1) {
                    clientCore.RankManager.ins.getSrvRank(RANKID[this.curTab], Math.max(0, this.myRank - 11), this.myRank - 1).then((data) => {
                        this["tenRankList" + this.curTab] = data;
                        this.listRank.dataSource = this["tenRankList" + this.curTab];
                    })
                } 
                // else {
                //     net.sendAndWait(new pb.cs_double_rank_info({ rankId: RANKID[1], start: Math.max(0, this.myRank - 11), end: this.myRank - 1, flag: 1 }))
                //         .then((msg: pb.sc_double_rank_info) => {
                //             this["tenRankList" + this.curTab] = msg.rankInfo;
                //             this.listRank.dataSource = this["tenRankList" + this.curTab];
                //         });
                // }
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.changeBtn, Laya.Event.CLICK, this, this.changeRankList);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['imgTop' + i], Laya.Event.CLICK, this, this.onRankRwdChange, [i]);
            }
            BC.addEvent(this, this.tab0, Laya.Event.CLICK, this, this.changeTab, [0]);
            BC.addEvent(this, this.tab1, Laya.Event.CLICK, this, this.changeTab, [1]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            super.destroy();
            if (this._rankList0) {
                for (const o of this._rankList0) {
                    o.dispose();
                }
            }
            if (this._rankList2) {
                for (const o of this._rankList0) {
                    o.dispose();
                }
            }
            if (this._rankList1) {
                for (let i of this._rankList1) {
                    i = null;;
                }
            }
            this.rewards0 = null;
            this.rewards1 = null;
            this.rewards2 = null;
            BC.removeEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            this._rankList0 = null;
            this._rankList1 = null;
            this._rankList2 = null;
            clientCore.ModuleManager.open("springFaerie.SpringFaerieModule");
        }
    }
}