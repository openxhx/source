namespace summerMemory {
    /**
     * 初夏的记忆
     * summerMemory.SummerMemoryModule
     */
    export class SummerMemoryModule extends ui.summerMemory.SummerMemoryModuleUI {
        private _model: SummerMemoryModel;
        private _control: SummerMemoryControl;

        private _exchangePanel: ExchangePanel;
        private _marketPanel: BuyPanel;
        private _gamePanel: GamePanel;

        private _itemList: ui.summerMemory.render.ProgressRenderUI[];
        constructor() {
            super();
        }

        init(data: any) {
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.sign = clientCore.CManager.regSign(new SummerMemoryModel(), new SummerMemoryControl());
            this._control = clientCore.CManager.getControl(this.sign) as SummerMemoryControl;
            this._model = clientCore.CManager.getModel(this.sign) as SummerMemoryModel;
            this._itemList = [];
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(this._control.getInfo().then((msg: pb.sc_summer_memory_panel) => {
                this._model.setCurData(msg);
            }))
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2021年5月21日活动', '【主活动】初夏的记忆', '打开主活动面板');
            this._model.getRewardArr();
            let step = 1155 / this._model.maxCost;
            for (let i = 0; i < this._model.rewardArr.length; i++) {
                let o = this._model.rewardArr[i];
                let itemUI = new ui.summerMemory.render.ProgressRenderUI();
                itemUI.pos(o.num.v2 * step, 100, true);
                itemUI.dataSource = o;
                itemUI.txtScore.value = o.num.v2.toString();
                let rwdId = clientCore.LocalInfo.sex == 1 ? o.femaleAward[0].v1 : o.maleAward[0].v1;
                itemUI.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(rwdId);
                this.boxItem.addChild(itemUI);
                this._itemList.push(itemUI);
                BC.addEvent(this, itemUI, Laya.Event.CLICK, this, this.onGetScoreReward, [i]);
            }
            this.setUI();
        }

        /**点击进度奖励 */
        private onGetScoreReward(index: number) {
            let data = this._model.rewardArr[index];
            let rwdId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
            let getRewarded = clientCore.LocalInfo.checkHaveCloth(rwdId);
            let has = clientCore.ItemsInfo.getItemNum(this._model.TARGET_ITEM_ID);
            if (data.num.v2 <= has && !getRewarded) {
                this._control.getReward(index + 1, data.id);
            } else {
                clientCore.ToolTip.showContentTips(this._itemList[index], 0, [{ v1: rwdId, v2: 1 }]);
            }
        }

        private setUI() {
            let model = this._model;
            let has = clientCore.ItemsInfo.getItemNum(model.TARGET_ITEM_ID);
            has = _.clamp(has, 0, model.maxCost);
            this.labValue.text = has.toString();
            this.imgMark.x = has + 14;
            this.imgMask.width = has / model.maxCost * 1156;
            this.imgMark.x = this.imgMask.width + 14;
            this.updateItem();
        }

        private updateItem() {
            let has = clientCore.ItemsInfo.getItemNum(this._model.TARGET_ITEM_ID);
            for (let i = 0; i < this._itemList.length; i++) {
                let item = this._itemList[i];
                let data = item.dataSource as xls.commonAward;
                let rwdId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                let getRewarded = clientCore.LocalInfo.checkHaveCloth(rwdId);
                let canGetReward = has >= data.num.v2;
                item.imgGot.visible = getRewarded;
                item.imgHaveRwd.visible = canGetReward && !getRewarded;
            }
        }

        private showEatPanel() {
            if (this._model._exchangeTimes >= this._model.MAX_EXCHANGE_COUNT) {
                alert.showFWords("今天已兑换~");
                return;
            }
            clientCore.Logger.sendLog('2021年5月21日活动', '【主活动】初夏的记忆', '点击换毛季节按钮');
            this._exchangePanel = this._exchangePanel || new ExchangePanel();
            this._exchangePanel.setInfo(this.sign);
            clientCore.DialogMgr.ins.open(this._exchangePanel);
        }

        private showTeaPanel() {
            if (this._model._curBuyIndex >= this._model._buyIdArr.length) {
                alert.showFWords("今天已购买~");
                return;
            }
            clientCore.Logger.sendLog('2021年5月21日活动', '【主活动】初夏的记忆', '点击水产市场按钮');
            this._marketPanel = this._marketPanel || new BuyPanel();
            this._marketPanel.setInfo(this.sign);
            clientCore.DialogMgr.ins.open(this._marketPanel);
        }

        private showGamePanel() {
            clientCore.Logger.sendLog('2021年5月21日活动', '【主活动】初夏的记忆', '点击捞金鱼按钮');
            this._gamePanel = this._gamePanel || new GamePanel();
            this._gamePanel.setInfo(this.sign);
            clientCore.DialogMgr.ins.open(this._gamePanel);
        }

        private previewSuit() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.SUIT_ID);
        }

        private showHelp() {
            alert.showRuleByID(1165);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.showEatPanel);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.showGamePanel);
            BC.addEvent(this, this.btnMarket, Laya.Event.CLICK, this, this.showTeaPanel);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showHelp);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewSuit);
            EventManager.on("MOKA_REWARD_BACK", this, this.updateItem);
            EventManager.on("MOKA_COIN_CHANGE", this, this.setUI);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("MOKA_REWARD_BACK", this, this.updateItem);
            EventManager.off("MOKA_COIN_CHANGE", this, this.setUI);
        }

        destroy() {
            super.destroy();
            this._exchangePanel?.destroy();
            this._marketPanel?.destroy();
            this._gamePanel?.destroy();
            for (let i = 0; i < this._itemList.length; i++) {
                this._itemList[i].destroy();
            }
            this._itemList = null;
            clientCore.CManager.unRegSign(this.sign);
            clientCore.UIManager.releaseCoinBox();
        }
    }
}