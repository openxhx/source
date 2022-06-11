namespace jumpGame {
    enum TAB {
        ALL,
        FRIEND
    }

    /**
     * 跳跳小游戏入口
     * jumpGame.JumpGameEnterModule
     */
    export class JumpGameEnterModule extends ui.jumpGame.JumpGameEnterModuleUI {
        private _tab: TAB;
        private _allRankInfo: clientCore.RankInfo[];
        private _friendRankInfo: clientCore.RankInfo[];
        private _tmpSex: number;
        private _person: clientCore.Person;
        private _historyHightScore: number;
        init(d: any) {
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.btnGet.visible = false;
        }

        async seqPreLoad() {
            await clientCore.RankManager.ins.getSrvRank(5).then((rankInfos) => {
                rankInfos = rankInfos.slice(0, 10);
                this._friendRankInfo = _.sortBy(rankInfos, (o) => { return o.msg.score }).reverse();
                return Promise.resolve();
            })
            await clientCore.RankManager.ins.getSrvRank(4).then((rankInfos) => {

                this._allRankInfo = rankInfos.slice(0, 10);
                return Promise.resolve();
            });
            await net.sendAndWait(new pb.cs_jump_game_get_info({})).then((data: pb.sc_jump_game_get_info) => {
                this.txtScore.text = '历史最高分：' + data.historyHighScore.toString();
                this._historyHightScore = data.historyHighScore;
                this.txtTime.text = data.residueTimes + '/3';
            })
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2020年4月3日活动', '【游戏】花仙大逃亡', '打开游戏面板');
            this.onTab(TAB.ALL);
            this.refreshTitle();
        }

        private refreshTitle() {
            let haveTitle = clientCore.TitleManager.ins.get(3500006) && !clientCore.TitleManager.ins.get(3500006).checkEnd();
            this.btnGet.visible = !haveTitle && this._historyHightScore >= 200;
        }

        private onTab(t) {
            if (this._tab != t) {
                this._tab = t;
                this.clipAll.index = this.clip_txtAll.index = this._tab == TAB.ALL ? 0 : 1;
                this.clipFriend.index = this.clip_txtFriend.index = this._tab == TAB.FRIEND ? 0 : 1;
                let arr = this._tab == TAB.ALL ? this._allRankInfo : this._friendRankInfo;
                //设置面板
                this.list.dataSource = arr.slice(1);
                this.firstRank.dataSource = arr[0];
                this.onListRender(this.firstRank, -1);
                this.setPersonCloth(arr[0]);
                this.txtNoRank.visible = arr.length == 0;
            }
        }

        private setPersonCloth(first: clientCore.RankInfo) {
            if (first && first.msg && first.msg instanceof pb.RankInfo) {
                let userBase = first.msg.userBase;
                //没有人模或者性别与当前不一致
                if (!this._person || this._tmpSex != userBase.sex) {
                    this._tmpSex = userBase.sex;
                    this._person?.destroy();
                    this._person = new clientCore.Person(userBase.sex);
                    this._person.scale(-0.4, 0.4, true);
                    this.boxContain.addChild(this._person);
                    let sp = new Laya.Sprite();
                    let w = 850;
                    let h = 750;
                    sp.graphics.drawRect(-w / 2, -h / 2, w, h, '#ffffff');
                    this._person.mask = sp;
                }
                this._person.visible = true;
                this._person.upByIdArr(userBase.curClothes);
            }
            else {
                if (this._person)
                    this._person.visible = false;
            }
        }

        private _rulePanel: JumpRulePanel;
        private onDetail() {
            clientCore.Logger.sendLog('2020年4月3日活动', '【游戏】花仙大逃亡', '点击规则说明');
            this._rulePanel = this._rulePanel || new JumpRulePanel();
            clientCore.DialogMgr.ins.open(this._rulePanel);
        }

        private onListRender(cell: ui.jumpGame.item.JumpRankItemUI, idx: number) {
            let data = cell.dataSource as clientCore.RankInfo;
            if (data && data.msg) {
                //这里如果是好友榜，ranking字段可能不对，所以用idx来判断
                let rank = idx + 2;//第一格特殊处理了 所以idx是从-1开始算 这里加2
                cell.visible = true;
                cell.clipIcon.visible = rank <= 3;
                cell.clipIcon.index = 3 - rank;
                cell.txtRank.visible = rank > 3;
                cell.txtRank.text = rank.toString();
                cell.txtName.text = (data.msg as pb.IRankInfo)?.userBase.nick ?? '';
                cell.txtScore.text = data.msg.score.toString();
            }
            else {
                cell.visible = false;
            }
        }

        private onStart() {
            let resttimes = parseInt(this.txtTime.text);
            if (resttimes > 0) {
                clientCore.Logger.sendLog('2020年4月3日活动', '【游戏】花仙大逃亡', '进入游戏');
                this.destroy();
                clientCore.ModuleManager.open('jumpGame.JumpGameModule', { modelType: "activity", openType: "jumpGame", friendArr: this._friendRankInfo, historyHighScore: this._historyHightScore, isTry: false });
            }
            else {
                alert.showFWords('剩余次数不足')
            }
        }

        private onTry() {
            clientCore.Logger.sendLog('2020年4月3日活动', '【游戏】花仙大逃亡', '点击试玩按钮');
            this.destroy();
            clientCore.ModuleManager.open('jumpGame.JumpGameModule', { modelType: "activity", openType: "jumpGame", friendArr: this._friendRankInfo, historyHighScore: this._historyHightScore, isTry: true });
        }

        private onGetTitle() {
            net.sendAndWait(new pb.cs_jump_game_get_title({})).then((data) => {
                alert.showSmall('称号领取成功！\n可在个人信息-称号中更换', { btnType: alert.Btn_Type.ONLY_SURE });
                this.refreshTitle();
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.clipAll, Laya.Event.CLICK, this, this.onTab, [TAB.ALL]);
            BC.addEvent(this, this.clipFriend, Laya.Event.CLICK, this, this.onTab, [TAB.FRIEND]);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.onStart);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGetTitle);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._person?.destroy();
            this._rulePanel?.destroy();
            super.destroy();
        }
    }
}