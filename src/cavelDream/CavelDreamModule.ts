namespace cavelDream {
    const CAVEL_ID: number = 9900327;
    const SUIT_ID: number = 2110633;
    const RANK_ID = 37;
    const TOTAL_IDS = [[603325, 603326, 603327], [603328, 603329, 603330]];

    /**
     * 金牛座排行榜
     * cavelDream.CavelDreamModule
     * 2020.12.18
     */
    export class CavelDreamModule extends ui.cavelDream.CavelDreamModuleUI {
        private _bubbleArr: ui.cavelDream.renders.DreamItemRenderUI[];
        private _rankList: clientCore.RankInfo[] = [];
        private _selfRank: clientCore.RankInfo;
        private _timeInfo: pb.sc_get_mermaid_of_love_info;
        private _buyPanel: CavelDreamBuyPanel;

        init(d: any) {
            super.init(d);
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_mermaid_of_love_info()).then((data: pb.sc_get_mermaid_of_love_info) => {
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
            clientCore.Logger.sendLog('2022年4月8日活动', '【付费】牛角包的爱恋排行榜', '打开牛角包的爱恋面板');
        }

        private initView() {
            this.imgCollect.skin = clientCore.LocalInfo.sex == 1 ? 'cavelDream/nu_mei_tong.png' : 'cavelDream/nan_mei_tong.png';
            this.imgSuit.skin = clientCore.LocalInfo.sex == 1 ? 'unpack/cavelDream/girl.png' : 'unpack/cavelDream/boy.png';
            this.txtMyNick.text = clientCore.LocalInfo.userInfo.nick;
            this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
            this.listRank.visible = this._rankList.length > 0;
            this.listRank.array = this._rankList.slice(0, 3);
            this.txtMyRank.text = this._selfRank?.msg?.ranking == 0 ? '默默无闻' : this._selfRank?.msg?.ranking.toString();
        }

        private createBubble() {
            this._bubbleArr = [];
            let xlsArr = _.filter(xls.get(xls.commonAward).getValues(), o => o.type == 234);
            let num = this.boxContain.numChildren;
            for (let i = 0; i < num; i++) {
                let xlsInfo = xlsArr[i];
                let bubble = new ui.cavelDream.renders.DreamItemRenderUI();
                let ori = this.boxContain.getChildAt(i) as Laya.Sprite;
                ori.visible = false;
                bubble.pos(ori.x, ori.y);
                bubble.dataSource = {
                    id: xlsInfo[clientCore.LocalInfo.sex == 1 ? 'femaleAward' : 'maleAward'][0].v1,
                    need: xlsInfo.num.v2
                };
                bubble.txtNum.text = bubble.dataSource.need;
                bubble.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(bubble.dataSource.id);
                BC.addEvent(this, bubble, Laya.Event.CLICK, this, this.onBubbleClick, [i + 1, xlsInfo.id]);
                this.boxContain.addChild(bubble);
                this._bubbleArr.push(bubble);
            }
        }

        private onBubbleClick(pos: number, id: number) {
            let myDreamNum: number = clientCore.ItemsInfo.getItemNum(CAVEL_ID);
            let data: { id: number, need: number } = this._bubbleArr[pos - 1].dataSource;
            let haveCloth = clientCore.LocalInfo.checkHaveCloth(data.id);
            let canGet = myDreamNum >= data.need;
            if (!canGet || haveCloth) {
                clientCore.ToolTip.showTips(this._bubbleArr[pos - 1], { id: data.id });
            }
            else {
                net.sendAndWait(new pb.cs_get_mermaid_of_love_reward({ type: 1, id: id })).then((data: pb.sc_get_mermaid_of_love_reward) => {
                    alert.showReward(data.items);
                    this.updateView();
                    util.RedPoint.reqRedPointRefresh(21401);
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
            totalNum = Math.min(totalNum, 10);
            let totalIdArr = TOTAL_IDS[clientCore.LocalInfo.sex - 1]
            let haveGetTotalRwd = _.sumBy(totalIdArr, id => clientCore.LocalInfo.checkHaveCloth(id) ? 1 : 0) == totalIdArr.length;
            this.txtCollect.text = totalNum + '/' + 10;
            this.btnGetAll.disabled = totalNum < 10;
            this.btnGetAll.skin = totalNum >= 10 ? 'cavelDream/allgw1.png' : 'cavelDream/allgw2.png'
            this.btnGetAll.visible = !haveGetTotalRwd;
        }

        private listRender(cell: ui.cavelDream.renders.DreamRankRenderUI, idx: number) {
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            cell.txtNick.text = rank.userBase.nick;
            cell.txtScore.text = rank.score.toString();
            cell.imgRank.skin = `cavelDream/top${rank.ranking}.png`;
            cell.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(rank.userBase.headImage);
        }

        private listMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.UserInfoTip.showTips(this.listRank.getCell(idx), this.listRank.getItem(idx).msg.userBase);
            }
        }

        private onGetDream() {
            // clientCore.Logger.sendLog('2020年18月18日活动', '【付费】卷角之梦', '点击获取卷角按钮');
            this._buyPanel = this._buyPanel || new CavelDreamBuyPanel();
            this._buyPanel.initInfo(this._timeInfo);
            this._buyPanel.show();
        }

        private onTry() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID);
        }

        private onGetAll() {
            net.sendAndWait(new pb.cs_get_mermaid_of_love_reward({ type: 2 })).then((data: pb.sc_get_mermaid_of_love_reward) => {
                alert.showReward(data.items);
                this.updateView();
                util.RedPoint.reqRedPointRefresh(21402);
            })
        }

        private onDetail() {
            alert.showRuleByID(1045);
        }

        private onRank() {
            this.destroy();
            // clientCore.Logger.sendLog('2020年12月18日活动', '【付费】卷角之梦', '点击排行榜按钮');
            clientCore.ModuleManager.open('cavelDream.CavelDreamRankModule', null, { openWhenClose: 'cavelDream.CavelDreamModule' });
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