namespace actingTrainee {
    /**
     * 2020.9.14
     * 演剧练习生
     * actingTrainee.ActingTraineeModule
     */
    export class ActingTraineeModule extends ui.actingTrainee.ActingTraineeModuleUI {
        private readonly TOTAL_LEN: number = 2000;

        private _totalScore: number;

        private _itemList: ui.actingTrainee.render.ExchangeRenderUI[];

        private _model: ActingTraineeModel;
        private _control: ActingTraineeControl;

        private _gamePanel: GamePanel;
        private _buyPanel: BuyPanel;
        private _scriptPanel: ScriptPanel;

        init(data?: any) {
            super.init(data);

            this._itemList = [];

            this.panelPro.hScrollBarSkin = null;

            this.sign = clientCore.CManager.regSign(new ActingTraineeModel(), new ActingTraineeControl());
            this._control = clientCore.CManager.getControl(this.sign) as ActingTraineeControl;
            this._model = clientCore.CManager.getModel(this.sign) as ActingTraineeModel;

            this._gamePanel = new GamePanel(this.sign);
            this._buyPanel = new BuyPanel(this.sign);
            this._scriptPanel = new ScriptPanel(this.sign);

            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.commonBuy));

            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        async onPreloadOver() {
            await this._control.getInfo();

            this.imgGirl.visible = clientCore.LocalInfo.sex == 1;
            this.imgBoy.visible = clientCore.LocalInfo.sex != 1;

            //创建进度条
            this.imgProgressBg.width = this.TOTAL_LEN;
            let arr = this._model.getRewardArr();
            this._totalScore = _.last(_.map(arr, (o) => { return o.num.v2 }));
            for (let i = 0; i < arr.length; i++) {
                let o = arr[i];
                let itemUI = new ui.actingTrainee.render.ExchangeRenderUI();
                itemUI.pos(o.num.v2 / this._totalScore * this.TOTAL_LEN, 0, true);
                itemUI.dataSource = o;
                itemUI.labNum.value = o.num.v2.toString();
                let rwdId = clientCore.LocalInfo.sex == 1 ? o.femaleAward[0].v1 : o.maleAward[0].v1;
                itemUI.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(rwdId);
                this.boxProgressItem.addChild(itemUI);
                this._itemList.push(itemUI);
                BC.addEvent(this, itemUI, Laya.Event.CLICK, this, this.onGetScoreReward, [i]);
            }

            this.updateView();
            clientCore.Logger.sendLog('2020年9月11日活动', '【主活动】演剧练习生', '打开活动面板');
        }

        popupOver() {
            clientCore.AnimateMovieManager.showOnceAnimate(this._model.mc_Id, MedalConst.ACTING_TRAINEE_MC);
        }

        private updateView() {
            //进度条
            this.imgProgress.width = Math.min(this._model.tokenNum / this._totalScore * this.TOTAL_LEN, this.TOTAL_LEN);
            this.boxProgressTxt.x = this.imgProgress.width + this.imgProgress.x;
            this.txtToken.text = this.txtProgress.text = this._model.tokenNum + '';

            for (let i = 0; i < this._itemList.length; i++) {
                let item = this._itemList[i];
                let data = item.dataSource as xls.commonAward;
                let rewardId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                let getRewarded = clientCore.ItemsInfo.getItemNum(rewardId) > 0;
                let canGetReward = this._model.tokenNum >= data.num.v2;
                item.imgGet.visible = getRewarded;
                item.imgHaveRwd.visible = canGetReward && !getRewarded;
            }

            this.updateRank();
        }

        async updateRank() {
            let myInfo: clientCore.RankInfo = await clientCore.RankManager.ins.getUserRank(this._model.rank_Id, clientCore.LocalInfo.uid);
            this.txtRank.text = myInfo.msg.ranking > 0 ? myInfo.msg.ranking + '' : "默默无闻";
        }

        private onDetail() {
            alert.showRuleByID(this._model.ruleById);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        private onReview(): void {
            clientCore.AnimateMovieManager.showAnimateMovie(this._model.mc_Id, null, null);
            clientCore.Logger.sendLog('2020年9月14日活动', '【游戏】演剧练习生', '点击剧情回顾按钮');
        }

        private onTili(): void {
            this._gamePanel.init({});
            clientCore.DialogMgr.ins.open(this._gamePanel);
            clientCore.Logger.sendLog('2020年9月14日活动', '【游戏】演剧练习生', '点击体力大考验按钮');
        }

        private onRank(): void {
            this.destroy();
            clientCore.ModuleManager.open("actingTrainee.RankModule");
            clientCore.Logger.sendLog('2020年9月14日活动', '【游戏】演剧练习生', '点击演剧排行榜按钮');
        }

        private onJinxiu(): void {
            this._buyPanel.init({});
            clientCore.DialogMgr.ins.open(this._buyPanel);
            clientCore.Logger.sendLog('2020年9月14日活动', '【游戏】演剧练习生', '点击演剧进修班按钮');
        }

        private onJuben(): void {
            if (!this._model.isCanAnswer) {
                alert.showFWords('今日答题次数已达上限');
                return;
            }
            this._scriptPanel.init({});
            clientCore.DialogMgr.ins.open(this._scriptPanel);
            clientCore.Logger.sendLog('2020年9月14日活动', '【游戏】演剧练习生', '点击剧本大考验按钮');
        }

        private onGetScoreReward(idx: number, e: Laya.Event) {
            let data = e.currentTarget['dataSource'] as xls.commonAward;
            let rewardId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
            let getRewarded = clientCore.ItemsInfo.getItemNum(rewardId) > 0;
            let canGetReward = this._model.tokenNum >= data.num.v2;
            if (canGetReward && !getRewarded) {
                this._control.exchange(data.id, idx + 1, Laya.Handler.create(this, (msg: pb.sc_teachers_day_exchange) => {
                    this.updateView();
                    alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
                }))
            } else {
                clientCore.ToolTip.showTips(e.currentTarget, { id: rewardId });
            }
        }

        private onOpenAnswermodule(): void {
            this.destroy();
            clientCore.ModuleManager.open("actingTrainee.AnswerModule");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnReview, Laya.Event.CLICK, this, this.onReview);
            BC.addEvent(this, this.boxTili, Laya.Event.CLICK, this, this.onTili);
            BC.addEvent(this, this.boxRank, Laya.Event.CLICK, this, this.onRank);
            BC.addEvent(this, this.boxJinxiu, Laya.Event.CLICK, this, this.onJinxiu);
            BC.addEvent(this, this.boxJuben, Laya.Event.CLICK, this, this.onJuben);
            BC.addEvent(this, this._buyPanel, "ON_UPDATE_TOKEN", this, this.updateView);
            BC.addEvent(this, this._scriptPanel, "ON_OPEN_ANSWERMODULE", this, this.onOpenAnswermodule);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            for (const o of this._itemList) {
                o.destroy();
            }
            this._itemList = [];
            this._gamePanel?.destroy();
            this._gamePanel = null;
            this._buyPanel?.destroy();
            this._buyPanel = null;
            this._scriptPanel?.destroy();
            this._scriptPanel = null;
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}