namespace searchSnow {
    /**
     * 2020.12.11
     * 觅雪寻冬界面
     * searchSnow.SearchSnowModule
     */
    export class SearchSnowModule extends ui.searchSnow.SearchSnowModuleUI {
        private _model: SearchSnowModel;
        private _control: SearchSnowControl;

        private _exchangePanel: ExchangePanel;

        init(data?: any) {
            super.init(data);

            this.sign = clientCore.CManager.regSign(new SearchSnowModel(), new SearchSnowControl());
            this._control = clientCore.CManager.getControl(this.sign) as SearchSnowControl;
            this._model = clientCore.CManager.getModel(this.sign) as SearchSnowModel;
            this._control.model = this._model;

            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.eventExchange));

            this.imgGirl.visible = clientCore.LocalInfo.sex == 1;
            this.imgBoy.visible = clientCore.LocalInfo.sex != 1;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.imgNan.visible = clientCore.LocalInfo.sex != 1;
        }

        async onPreloadOver() {
            await this._control.getInfo();

            this.updateView();
            clientCore.Logger.sendLog('2020年12月11日活动', '【主活动】觅雪寻冬', '打开活动面板');
        }

        private updateView() {
            let suitInfo = clientCore.SuitsInfo.getSuitInfo(this._model.suitId);
            this.labTZNum.text = suitInfo.hasCnt + '/' + suitInfo.clothes.length;
            this.labCleanNum.text = this._model.cleanTimes + '/' + this._model.cleanTimesMax;
            this.labTokenNum.text = clientCore.ItemsInfo.getItemNum(this._model.tokenId) + '';
        }

        private onDetail() {
            clientCore.Logger.sendLog('2020年12月11日活动', '【主活动】觅雪寻冬', '打开规则面板');
            alert.showRuleByID(this._model.ruleById);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        private onExchange(): void {
            clientCore.Logger.sendLog('2020年12月11日活动', '【主活动】觅雪寻冬', '打开奖励兑换面板');
            if (!this._exchangePanel) {
                this._exchangePanel = new ExchangePanel(this.sign);
                this._exchangePanel.updateHanlder = new Laya.Handler(this, this.updateView);
            }
            this._exchangePanel.init();
            clientCore.DialogMgr.ins.open(this._exchangePanel);
        }

        private onGoClean(): void {
            clientCore.Logger.sendLog('2020年12月11日活动', '【主活动】觅雪寻冬', '点击前往按钮');
            if (this._model.cleanTimes >= this._model.cleanTimesMax) {
                alert.showFWords('小花仙辛苦啦~明天再来吧！');
                return;
            }
            clientCore.MapManager.enterWorldMap(13);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGoClean);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            this._exchangePanel?.destroy();
            this._exchangePanel = null;
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}