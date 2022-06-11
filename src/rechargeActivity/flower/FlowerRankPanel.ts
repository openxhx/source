namespace rechargeActivity {
    enum RANK_TYPE {
        /**获赠榜 */
        GET,
        /**赠送榜 */
        GIVE,
    }
    enum VIEW_TYPE {
        TOP,
        RANK
    }

    const GIVE_RANK_ID = 7;
    const GET_RANK_ID = 6;

    import RankInfo = clientCore.RankInfo;
    export class FlowerRankPanel extends ui.rechargeActivity.flowerPanel.RankPanelUI {
        private _rankType: RANK_TYPE = -1;
        private _viewType: VIEW_TYPE = VIEW_TYPE.RANK;
        private _rankList: RankInfo[] = [];
        private _myRankInfo: RankInfo;
        private _personArr: clientCore.Person[] = [];
        private _myFlowerCount: number[];

        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.list.selectEnable = true;
            this.drawCallOptimize = true;
            for (let i = 0; i < 3; i++) {
                this['rankShow_' + i].visible = false;
            }
        }

        init(rankType: number) {
            //0是获赠,1是赠花
            this._rankType = rankType;
            this.imgTitle.skin = rankType == RANK_TYPE.GIVE ? 'rechargeActivity/giveFlower/赠送鲜花.png' : 'rechargeActivity/giveFlower/获赠鲜花.png';
            let limitScore = xls.get(xls.rankInfo).get(this._rankType == RANK_TYPE.GIVE ? GIVE_RANK_ID : GET_RANK_ID).limitScore;
            this.txtDetail.text = `${rankType == RANK_TYPE.GIVE ? '赠送' : '获赠'}鲜花达到${limitScore}朵之后才可以上榜哦！`;
            this.txtNick.text = clientCore.LocalInfo.userInfo.nick;
            this.txtLv.text = clientCore.LocalInfo.userLv.toString();
            this.txtFamilyName.text = clientCore.LocalInfo.srvUserInfo.familyName ? clientCore.LocalInfo.srvUserInfo.familyName : '尚未加入家族';
            this.initViewByRankType();
            this.changeViewType();
            this.addEventListeners();
        }


        private async initViewByRankType() {
            //判断排行榜数据没有就要加载
            if (this._rankList.length == 0) {
                clientCore.LoadingManager.showSmall();
                let rankId = this._rankType == RANK_TYPE.GIVE ? GIVE_RANK_ID : GET_RANK_ID;
                await clientCore.RankManager.ins.getSrvRank(rankId).then((rankInfo) => {
                    this._rankList = rankInfo;
                });
                await clientCore.RankManager.ins.getUserRank(rankId, clientCore.LocalInfo.uid).then((v) => {
                    this._myRankInfo = v;
                })
                await net.sendAndWait(new pb.cs_get_player_give_flower_info()).then((data: pb.sc_get_player_give_flower_info) => {
                    this._myFlowerCount = [data.gotFlowerCnt, data.giveFlowerCnt];
                })
                clientCore.LoadingManager.hideSmall(true);
            }
            this.list.dataSource = this._rankList.slice(3);
            this.boxScroll.visible = this.list.length > 6;
            this.txtRank.text = this._myRankInfo.msg.ranking == 0 ? '未上榜' : this._myRankInfo.msg.ranking.toString();
            this.clipSex.index = clientCore.LocalInfo.sex - 1;
            this.txtScore.text = this._myFlowerCount[this._rankType].toString();
            //排行榜前三名
            let topArr = this._rankList.slice(0, 3);
            for (let i = 0; i < 3; i++) {
                let rankShow = this['rankShow_' + i] as ui.rechargeActivity.flowerRender.FamilyRankShowerUI;
                rankShow.visible = i < topArr.length;
                let rankInfo = topArr[i];
                let scale = 1 - i * 0.15;
                if (rankInfo) {
                    let rankUserInfo = (rankInfo.msg as pb.IRankInfo).userBase;
                    rankShow.txtNick.text = rankUserInfo?.nick;
                    rankShow.txtFamilyName.text = rankUserInfo?.familyName ? rankUserInfo?.familyName : '尚未加入家族';
                    rankShow.txtNum.text = rankInfo.msg.score.toString();
                    rankShow.imgState.skin = this._rankType == RANK_TYPE.GIVE ? 'rechargeActivity/giveFlower/已赠鲜花_badge.png' : 'rechargeActivity/giveFlower/获赠鲜花_badge.png';
                    rankShow.imgRank.skin = `rechargeActivity/giveFlower/rank_${i + 1}.png`;
                    let person = new clientCore.Person(rankUserInfo.sex, rankUserInfo.curClothes);
                    person.pos(rankShow.x, rankShow.y);
                    person.scale(0.35 * scale, 0.35 * scale);
                    // rankShow.scale(scale, scale);
                    rankShow.parent.addChildAt(person, 1);
                    rankShow.dataSource = rankInfo;
                    this._personArr.push(person);
                }
            }
        }

        private onListRender(cell: ui.rechargeActivity.flowerRender.FlowerRankRenderUI, idx: number) {
            let data = cell.dataSource as RankInfo;
            let rank = data.msg as pb.IRankInfo;
            if (rank) {
                cell.txtRank.text = rank.ranking.toString();
                cell.txtNick.text = rank.userBase?.nick;
                cell.clip_sex.index = rank.userBase?.sex - 1;
                cell.txtFamilyName.text = rank.userBase?.familyName ? rank.userBase?.familyName : '尚未加入家族';
                cell.txtScore.text = rank.score.toString();
                cell.txtLv.text = clientCore.LocalInfo.parseLvInfoByExp(rank.userBase.exp).lv.toString();
                cell.imgSelect.visible = idx == this.list.selectedIndex;
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.list.getItem(idx) as RankInfo;
                let rank = data.msg as pb.IRankInfo;
                if (e.target.name == 'btn') {
                    alert.showGiveFlowerPanel({ uid: rank.userBase.userid, nick: rank.userBase.nick });
                }
                else {
                    clientCore.UserInfoTip.showTips(e.currentTarget, rank.userBase);
                }
            }
        }

        private changeViewType() {
            this._viewType = this._viewType == VIEW_TYPE.TOP ? VIEW_TYPE.RANK : VIEW_TYPE.TOP;
            this.boxRank.visible = this._viewType == VIEW_TYPE.RANK;
            this.boxTop.visible = this._viewType == VIEW_TYPE.TOP;
            this.btn_Top.visible = this._viewType == VIEW_TYPE.RANK;
            this.btn_rank.visible = this._viewType == VIEW_TYPE.TOP;
        }

        private onScorllChange() {
            let scroll = this.list.scrollBar;
            this.imgBar.y = (this.imgBarBg.height - this.imgBar.height) * scroll.value / scroll.max;
        }

        private sendFlower(idx: number) {
            let info = this['rankShow_' + idx]['dataSource'] as RankInfo;
            if (info?.msg) {
                let rank = info.msg as pb.IRankInfo;
                alert.showGiveFlowerPanel({ uid: rank.userBase.userid, nick: rank.userBase.nick });
            }
        }

        private onTopRankClick(idx: number, e: Laya.Event) {
            if (e.target.name == 'btnGive') {
                this.sendFlower(idx);
            }
            else {
                let info = e.currentTarget['dataSource'] as RankInfo;
                if (info?.msg) {
                    let rank = info.msg as pb.IRankInfo;
                    clientCore.UserInfoTip.showTips(e.currentTarget, rank.userBase);
                }
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btn_Top, Laya.Event.CLICK, this, this.changeViewType);
            BC.addEvent(this, this.btn_rank, Laya.Event.CLICK, this, this.changeViewType);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScorllChange);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['rankShow_' + i], Laya.Event.CLICK, this, this.onTopRankClick, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            for (const p of this._personArr) {
                p?.destroy();
            }
            for (const p of this._rankList) {
                p?.dispose();
            }
            this._personArr = this._rankList = [];
        }
    }
}