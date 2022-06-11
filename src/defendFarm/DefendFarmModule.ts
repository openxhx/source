namespace defendFarm {
    /**
     * 2020.11.13
     * 保卫农场
     * defendFarm.DefendFarmModule
     */
    export class DefendFarmModule extends ui.defendFarm.DefendFarmModuleUI {

        private _model: DefendFarmModel;
        private _control: DefendFarmControl;

        private _buyPanel: BuyPanel;
        private _makePanel: MakePanel;
        private _exchangePanel: ExchangePanel;

        init(data?: any) {
            super.init(data);

            this.sign = clientCore.CManager.regSign(new DefendFarmModel(), new DefendFarmControl());
            this._control = clientCore.CManager.getControl(this.sign) as DefendFarmControl;
            this._model = clientCore.CManager.getModel(this.sign) as DefendFarmModel;
            this._control.model = this._model;

            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.commonBuy));

            this.showCoinBox();
            clientCore.UIManager.showCoinBox();
        }

        async onPreloadOver() {
            await this._control.getInfo();

            this.imgMan.visible = clientCore.LocalInfo.sex == 2;
            this.imgWoman.visible = clientCore.LocalInfo.sex == 1;

            this.updateView();
            clientCore.Logger.sendLog('2020年11月13日活动', '【主活动】保卫农场', '打开游戏面板');
        }

        popupOver() {
            clientCore.AnimateMovieManager.showOnceAnimate(this._model.mc_Id, MedalConst.DEFEND_FARM_MC);
        }

        private updateView(): void {
            if (clientCore.ItemsInfo.checkHaveItem(this._model.item_id1)) {
                this.imgPlace.visible = true;
                this.btnGame.visible = true;
                this.btnPlace.visible = false;
            } else {
                this.imgPlace.visible = false;
                this.btnGame.visible = false;
                this.btnPlace.visible = true;
            }

            this.labTimes.text = (this._model.gameTimesMax - this._model.gameTimes) + "/" + this._model.gameTimesMax;
        }

        private showCoinBox(): void {
            clientCore.UIManager.setMoneyIds([this._model.item_id2, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
        }

        private onDetail() {
            alert.showRuleByID(this._model.ruleById);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        private onGame(): void {
            if (!this._model.isCanGame) {
                alert.showFWords('今日游戏次数已达上限');
                return;
            }
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("defendFarmGame.DefendFarmGameModule", { modelType: "activity", openType: "defendFarm", stageId: 60127, gameId: 3207001 }, { openWhenClose: "defendFarm.DefendFarmModule" });
        }

        private onBuy(): void {
            if (!this._model.isCanBuy) {
                alert.showFWords('今日购买次数已达上限');
                return;
            }
            if (!this._buyPanel) {
                this._buyPanel = new BuyPanel(this.sign);
                BC.addEvent(this, this._buyPanel, this._buyPanel.EVENT_BUY, this, this.updateView);
                BC.addEvent(this, this._buyPanel, this._buyPanel.EVENT_SHOWCOINBOX, this, this.showCoinBox);
            }
            this._buyPanel.init();
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        private onMake(): void {
            if (!this._model.isCanGame) {
                alert.showFWords('今日游戏次数已达上限');
                return;
            }
            if (clientCore.ItemsInfo.checkHaveItem(this._model.item_id1)) {
                return;
            }
            if (!this._makePanel) {
                this._makePanel = new MakePanel(this.sign);
                BC.addEvent(this, this._makePanel, this._makePanel.EVENT_MAKECOOKE, this, this.updateView);
                BC.addEvent(this, this._makePanel, this._makePanel.EVENT_SHOWCOINBOX, this, this.showCoinBox);
            }
            this._makePanel.init();
            clientCore.DialogMgr.ins.open(this._makePanel);
        }

        private onExchange(): void {
            if (!this._exchangePanel) {
                this._exchangePanel = new ExchangePanel(this.sign);
                BC.addEvent(this, this._exchangePanel, this._exchangePanel.EVENT_SHOWCOINBOX, this, this.showCoinBox);
            }
            this._exchangePanel.init();
            clientCore.DialogMgr.ins.open(this._exchangePanel);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.onGame);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnPlace, Laya.Event.CLICK, this, this.onMake);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onExchange);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            this._buyPanel?.destroy();
            this._buyPanel = null;
            this._makePanel?.destroy();
            this._makePanel = null;
            this._exchangePanel?.destroy();
            this._exchangePanel = null;
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            clientCore.UIManager.releaseEvent();
            super.destroy();
        }
    }
}