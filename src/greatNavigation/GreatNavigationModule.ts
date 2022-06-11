namespace greatNavigation {
    const CAVEL_ID: number = 9900183;
    const SUIT_ID: number = 2110401;
    const RANK_ID = 24;
    const TOTAL_IDS = [[603760, 603761, 603762], [603763, 603764, 603765]];

    /**
     * 大航海时代
     * greatNavigation.GreatNavigationModule
     * 2021.6.18
     */
    export class GreatNavigationModule extends ui.greatNavigation.GreatNavigationModuleUI {
        private _bubbleArr: ui.greatNavigation.renders.NavigationItemRenderUI[];
        private _rankList: clientCore.RankInfo[] = [];
        private _selfRank: clientCore.RankInfo;
        private _timeInfo: pb.sc_cavel_dream_panel;
        private _buyPanel: NavigationBuyPanel;

        init(d: any) {
            super.init(d);
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(net.sendAndWait(new pb.cs_cavel_dream_panel()).then((data: pb.sc_cavel_dream_panel) => {
                this._timeInfo = data;
            }))
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(RANK_ID).then((data) => {
                this._rankList = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(RANK_ID, clientCore.LocalInfo.uid).then((data) => {
                this._selfRank = data;
            }));
            this.listRank.renderHandler = new Laya.Handler(this, this.listRender);
            this.listRank.mouseHandler = new Laya.Handler(this, this.listMouse);
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            this.initView()
            this.createBubble();
            this.updateView();
            clientCore.Logger.sendLog('2021年6月18日活动', '【付费】大航海时代', '打开大航海时代面板');
        }

        private initView() {
            this.imgCollect.skin = clientCore.LocalInfo.sex == 1 ? 'greatNavigation/nu_mei_tong.png' : 'greatNavigation/nan_mei_tong.png';
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.txtMyNick.text = clientCore.LocalInfo.userInfo.nick;
            this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
            this.listRank.visible = this._rankList.length > 0;
            this.listRank.array = this._rankList.slice(0, 3);
            this.txtMyRank.text = this._selfRank?.msg?.ranking == 0 ? '默默无闻' : this._selfRank?.msg?.ranking.toString();
        }

        private createBubble() {
            this._bubbleArr = [];
            let xlsArr = _.filter(xls.get(xls.commonAward).getValues(), o => o.type == 160);
            for (let i = 0; i < xlsArr.length; i++) {
                let xlsInfo = xlsArr[i];
                let bubble = this["item" + (i + 1)];
                bubble.dataSource = {
                    id: xlsInfo[clientCore.LocalInfo.sex == 1 ? 'femaleAward' : 'maleAward'][0].v1,
                    need: xlsInfo.num.v2
                };
                bubble.txtNum.text = bubble.dataSource.need;
                bubble.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(bubble.dataSource.id);
                BC.addEvent(this, bubble, Laya.Event.CLICK, this, this.onBubbleClick, [i + 1, xlsInfo.id, bubble.dataSource.id]);
                this._bubbleArr.push(bubble);
            }
        }

        private onBubbleClick(pos: number, idx: number) {
            let myDreamNum: number = clientCore.ItemsInfo.getItemNum(CAVEL_ID);
            let data: { id: number, need: number } = this._bubbleArr[pos - 1].dataSource;
            let haveCloth = clientCore.LocalInfo.checkHaveCloth(data.id);
            let canGet = myDreamNum >= data.need;
            if (!canGet || haveCloth) {
                clientCore.ToolTip.showTips(this._bubbleArr[pos - 1], { id: data.id });
            }
            else {
                net.sendAndWait(new pb.cs_cavel_dream_get_reward({ idx: idx, pos: pos })).then((data: pb.sc_cavel_dream_get_reward) => {
                    alert.showReward(data.item);
                    this.updateView();
                    util.RedPoint.reqRedPointRefresh(21401)
                })
            }
        }

        private updateView() {
            let myDreamNum: number = clientCore.ItemsInfo.getItemNum(CAVEL_ID);
            //道具
            this.txtCoin.text = myDreamNum.toString();

            //转盘UI
            for (let i = 0; i < this._bubbleArr.length; i++) {
                const bubble = this._bubbleArr[i];
                let data: { id: number, need: number } = bubble.dataSource;
                let haveCloth = clientCore.LocalInfo.checkHaveCloth(data.id);
                let canGet = myDreamNum >= data.need;
                bubble.imgGet.visible = haveCloth;
                bubble.imgClick.visible = canGet && !haveCloth;
                bubble.filters = (!bubble.imgGet.visible && !bubble.imgClick.visible) ? util.DisplayUtil.darkFilter : [];
            }
            let nextIdx = _.findIndex(this._bubbleArr, o => o.filters?.length);
            if (nextIdx > -1) {
                this._bubbleArr[nextIdx].filters = [];
            }
            //集齐奖励
            let totalNum = _.sumBy(this._bubbleArr, o => clientCore.LocalInfo.checkHaveCloth(o.dataSource.id) ? 1 : 0);
            totalNum = Math.min(totalNum, 12);
            let totalIdArr = TOTAL_IDS[clientCore.LocalInfo.sex - 1]
            let haveGetTotalRwd = _.sumBy(totalIdArr, id => clientCore.LocalInfo.checkHaveCloth(id) ? 1 : 0) == totalIdArr.length;
            this.txtCollect.text = totalNum + '/' + 12;
            this.btnGetAll.disabled = totalNum < 12;
            this.txtDes.text = totalNum >= 12 ? '领取奖励' : '集齐奖励';
            this.btnGetAll.visible = !haveGetTotalRwd;
        }

        private listRender(cell: ui.greatNavigation.renders.NavigationRankRenderUI, idx: number) {
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            cell.txtNick.text = rank.userBase.nick;
            cell.txtScore.text = rank.score.toString();
            cell.imgRank.skin = `greatNavigation/top${rank.ranking}.png`;
            cell.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(rank.userBase.headImage);
        }

        private listMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.UserInfoTip.showTips(this.listRank.getCell(idx), this.listRank.getItem(idx).msg.userBase);
            }
        }

        private onGetDream() {
            // clientCore.Logger.sendLog('2021年6月18日活动', '【付费】大航海之梦', '点击获取星锚按钮');
            this._buyPanel = this._buyPanel || new NavigationBuyPanel();
            this._buyPanel.show(this._timeInfo);
        }

        private onTry() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID);
        }

        private onGetAll() {
            net.sendAndWait(new pb.cs_cavel_dream_get_extra_reward()).then((data: pb.sc_cavel_dream_get_extra_reward) => {
                alert.showReward(data.item);
                this.updateView();
                util.RedPoint.reqRedPointRefresh(21402);
            })
        }

        private onDetail() {
            alert.showRuleByID(1187);
        }

        private onRank() {
            this.destroy();
            // clientCore.Logger.sendLog('2020年6月18日活动', '【付费】大航海之梦', '点击排行榜按钮');
            clientCore.ModuleManager.open('greatNavigation.NavigationRankModule', null, { openWhenClose: 'greatNavigation.GreatNavigationModule' });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnGetAll, Laya.Event.CLICK, this, this.onGetAll);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.onRank);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGetDream);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.updateView);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
            for (const bubble of this._bubbleArr) {
                bubble.destroy();
            }
            this._bubbleArr = [];
            this._buyPanel?.destroy();
        }
    }
}