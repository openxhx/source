namespace impossibleTasks {
    /**
     * 2020.9.25
     * 不可能完成的任务
     * actingTrainee.ActingTraineeModule
     */
    export class ImpossibleTasksModule extends ui.impossibleTasks.ImpossibleTasksModuleUI {
        private readonly TOTAL_LEN: number = 1000;

        private _totalScore: number;
        private _selectIndex: number;

        private _itemList: ui.impossibleTasks.render.ExchangeRenderUI[];

        private _model: ImpossibleTasksModel;
        private _control: ImpossibleTasksControl;

        private _collectPanel: CollectPanel;
        private _expelPanel: ExpelPanel;
        private _buyPanel: BuyPanel;
        private _collectRulePanel: CollectRulePanel;
        private _rewardPanel: RewardPanel;

        init(data?: any) {
            super.init(data);

            this._itemList = [];

            this.sign = clientCore.CManager.regSign(new ImpossibleTasksModel(), new ImpossibleTasksControl());
            this._control = clientCore.CManager.getControl(this.sign) as ImpossibleTasksControl;
            this._model = clientCore.CManager.getModel(this.sign) as ImpossibleTasksModel;

            this._collectPanel = new CollectPanel(this.sign);
            this._expelPanel = new ExpelPanel(this.sign);
            this._buyPanel = new BuyPanel(this.sign);
            this._collectRulePanel = new CollectRulePanel(this.sign);

            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.commonBuy));

            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        async onPreloadOver() {
            await this._control.getInfo();

            this.box1.visible = true;
            this.box2.visible = false;
            this.box3.visible = false;

            //创建进度条
            this.imgProgressBg.width = this.TOTAL_LEN;
            let arr = this._model.getRewardArr();
            this._totalScore = _.last(_.map(arr, (o) => { return o.num.v2 }));
            for (let i = 0; i < arr.length; i++) {
                let o = arr[i];
                let itemUI = new ui.impossibleTasks.render.ExchangeRenderUI();
                itemUI.pos(o.num.v2 / this._totalScore * this.TOTAL_LEN, 0, true);
                itemUI.dataSource = o;
                itemUI.imgBiaoqing.skin = 'impossibleTasks/biaoqing_' + (i + 1) + '.png';
                let rwdId = clientCore.LocalInfo.sex == 1 ? o.femaleAward[0].v1 : o.maleAward[0].v1;
                itemUI.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(rwdId);
                this.boxProgressItem.addChild(itemUI);
                this._itemList.push(itemUI);
                BC.addEvent(this, itemUI, Laya.Event.CLICK, this, this.onGetScoreReward, [i]);
            }

            this.updateView();
            clientCore.Logger.sendLog('2020年9月25日活动', '【主活动】不可能完成的任务', '打开活动面板');
        }

        popupOver() {
            clientCore.AnimateMovieManager.showOnceAnimate(this._model.mc_Id, MedalConst.IMPOSSIBLE_TASKS_MC);
        }

        private updateView() {
            let tokenNum = this._model.tokenNum;
            let tokenNum2 = Math.min(this._model.tokenNum2, this._model.tokenNum2Max);
            this.labXinqing.text = tokenNum + '/' + this._model.tokenNumMax;
            this.imgLucky.height = Math.min(tokenNum, this._model.tokenNumMax) / this._model.tokenNumMax * 190;

            if (tokenNum2 < this._model.tokenNum2Max) {
                this.labYizi.text = "你找我有什么事";
            } else {
                this.labYizi.text = "真是令人头疼的请求，不过我会出演的";
            }

            //进度条
            this.imgProgress.width = Math.min(tokenNum2 / this._totalScore * this.TOTAL_LEN, this.TOTAL_LEN);
            this.boxProgressTxt.x = this.imgProgress.width + this.imgProgress.x;
            this.txtProgress.text = tokenNum2 + '%';

            for (let i = 0; i < this._itemList.length; i++) {
                let item = this._itemList[i];
                let data = item.dataSource as xls.commonAward;
                let rewardId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                let getRewarded = clientCore.ItemsInfo.getItemNum(rewardId) > 0;
                let canGetReward = tokenNum2 >= data.num.v2;
                item.imgGet.visible = getRewarded;
                item.imgHaveRwd.visible = canGetReward && !getRewarded;
            }
        }

        private onReward(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        private onRule(): void {
            alert.showRuleByID(this._model.ruleById);
        }

        private onReview(): void {
            clientCore.AnimateMovieManager.showAnimateMovie(this._model.mc_Id, null, null);
        }

        private onCollect(): void {
            if (this._model.tokenNum >= this._model.tokenNumMax) {
                alert.showFWords('快趁伊紫心情不错尝试劝说吧~');
                return;
            }
            this._collectPanel.init();
            clientCore.DialogMgr.ins.open(this._collectPanel);
            clientCore.Logger.sendLog('2020年9月25日活动', '【小游戏】收集花露', '点击小游戏入口');
        }

        private onExpel(): void {
            if (this._model.tokenNum >= this._model.tokenNumMax) {
                alert.showFWords('快趁伊紫心情不错尝试劝说吧~');
                return;
            }
            this._expelPanel.init();
            clientCore.DialogMgr.ins.open(this._expelPanel);
            clientCore.Logger.sendLog('2020年9月25日活动', '【战斗】驱逐捣乱怪', '点击战斗入口');
        }

        private onGive(): void {
            if (this._model.tokenNum2 >= this._model.tokenNum2Max) {
                alert.showFWords('伊紫已经同意出演，不需要再给伊紫赠送花环了~');
                return;
            }
            this._buyPanel.init();
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        private startPersuade(): void {
            if (this._model.tokenNum <= this._model.tokenNumMin) {
                alert.showFWords('在伊紫心情更好的时候再尝试劝说她吧~');
                return;
            }

            this._selectIndex = 0;
            this.labYizi.text = ".......";
            this.box1.visible = false;
            this.box2.visible = true;
            this.box3.visible = false;
            this.imgGou1.visible = false;
            this.imgGou2.visible = false;
            this.imgGou3.visible = false;
            this.btnDevelop.disabled = true;
        }

        private endPersuade(): void {
            this.box1.visible = true;
            this.box2.visible = false;
            this.box3.visible = false;
        }

        private onPersuade(): void {
            this._control.persuade(Laya.Handler.create(this, (msg: pb.sc_impossible_task_persuade) => {
                let tokenNum2 = this._model.tokenNum2;
                let Bapji = 0;
                if (tokenNum2 >= this._model.tokenNum2Max) {
                    Bapji = 3;
                } else {
                    if (msg.type == 2) {
                        Bapji = 1;
                    } else if (msg.type == 3) {
                        Bapji = 2;
                    } else if (msg.type == 100) {
                        Bapji = 3;
                    }
                }
                let arr = this._model.duihuaData[this._selectIndex];
                this.labDanan.text = arr[_.random(0, arr.length - 1)];
                this.box1.visible = false;
                this.box2.visible = false;
                this.box3.visible = true;
                this.imgDBiaoqing.visible = false;

                Laya.timer.once(2000, this, () => {
                    if (tokenNum2 < 50) {
                        arr = this._model.duihuaData2[1];
                    } else {
                        arr = this._model.duihuaData2[2];
                    }


                    this.labYizi.text = arr[Bapji];
                    this.imgDBiaoqing.skin = "impossibleTasks/biaoqing_1.png";
                    this.imgDBiaoqing.visible = true;
                });
                Laya.timer.once(4000, this, () => {
                    this.endPersuade();
                    this.updateView();
                    let num = 0;
                    if (msg.items.length > 0) {
                        num = msg.items[0].cnt;
                    }
                    alert.showFWords(this._model.duihuanTipsData[Bapji] + num + "%");
                });
            }))
        }

        private onDevelop(index: number): void {
            this._selectIndex = index;
            this.imgGou1.visible = false;
            this.imgGou2.visible = false;
            this.imgGou3.visible = false;
            this["imgGou" + index].visible = true;
            this.btnDevelop.disabled = false;
        }

        private onOpenCollectRule(): void {
            this._collectRulePanel.init();
            clientCore.DialogMgr.ins.open(this._collectRulePanel);
        }

        private onGetScoreReward(idx: number, e: Laya.Event) {
            let data = e.currentTarget['dataSource'] as xls.commonAward;
            let rewardId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
            let getRewarded = clientCore.ItemsInfo.getItemNum(rewardId) > 0;
            let canGetReward = this._model.tokenNum2 >= data.num.v2;
            if (canGetReward && !getRewarded) {
                this._control.exchange(data.id, idx + 1, Laya.Handler.create(this, (msg: pb.sc_impossible_task_exchange) => {
                    this.updateView();
                    alert.showReward(msg.items);
                }))
            } else {
                this._rewardPanel = this._rewardPanel || new RewardPanel();
                this._rewardPanel.setInfo(clientCore.LocalInfo.sex == 1 ? data.femaleAward : data.maleAward);
                clientCore.DialogMgr.ins.open(this._rewardPanel);
            }
        }

        private gameStart() {
            this.close();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("dragBlockGame2.DragBlockGameModule", { modelType: "activity", openType: "impossibleTasks", stageId: 60119, gameId: 3900001 }, { openWhenClose: "impossibleTasks.ImpossibleTasksModule" });
        }

        private onupdateToken(data: any): void {
            this.updateView();
        }

        private onupdateToken2(data: any): void {
            this.updateView();
            alert.showFWords("劝说进度提升" + data.cnt + "%");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnReview, Laya.Event.CLICK, this, this.onReview);
            BC.addEvent(this, this.btnCollect, Laya.Event.CLICK, this, this.onCollect);
            BC.addEvent(this, this.btnExpel, Laya.Event.CLICK, this, this.onExpel);
            BC.addEvent(this, this.btnGive, Laya.Event.CLICK, this, this.onGive);
            BC.addEvent(this, this.btnPersuade, Laya.Event.CLICK, this, this.startPersuade);
            BC.addEvent(this, this.btnDevelop, Laya.Event.CLICK, this, this.onPersuade);
            BC.addEvent(this, this.btnDevelop1, Laya.Event.CLICK, this, this.onDevelop, [1]);
            BC.addEvent(this, this.btnDevelop2, Laya.Event.CLICK, this, this.onDevelop, [2]);
            BC.addEvent(this, this.btnDevelop3, Laya.Event.CLICK, this, this.onDevelop, [3]);

            BC.addEvent(this, this._collectPanel, "ON_OPEN_COLLECTRULE", this, this.onOpenCollectRule);
            BC.addEvent(this, this._collectPanel, "ON_GAMESTART", this, this.gameStart);
            BC.addEvent(this, this._collectRulePanel, "ON_GAMESTART", this, this.gameStart);
            BC.addEvent(this, this._expelPanel, "ON_UPDATE_TOKEN", this, this.onupdateToken);
            BC.addEvent(this, this._buyPanel, "ON_UPDATE_TOKEN2", this, this.onupdateToken2);
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
            this._collectPanel?.destroy();
            this._collectPanel = null;
            this._expelPanel?.destroy();
            this._expelPanel = null;
            this._buyPanel?.destroy();
            this._buyPanel = null;
            this._collectRulePanel?.destroy();
            this._collectRulePanel = null;
            this._rewardPanel?.destroy();
            this._rewardPanel = null;
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}