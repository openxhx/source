namespace preludeToChristmas {
    /**
     * 2020.9.14
     * 圣诞前奏曲界面
     * preludeToChristmas.PreludeToChristmasModule
     */
    export class PreludeToChristmasModule extends ui.preludeToChristmas.PreludeToChristmasModuleUI {
        private _oriBgmUrl: string;

        private _model: PreludeToChristmasModel;
        private _control: PreludeToChristmasControl;

        private _buyPanel: BuyPanel;
        private _gamePanel: GamePanel;
        private _exchangePanel: ExchangePanel;

        init(data?: any) {
            super.init(data);

            this.sign = clientCore.CManager.regSign(new PreludeToChristmasModel(), new PreludeToChristmasControl());
            this._control = clientCore.CManager.getControl(this.sign) as PreludeToChristmasControl;
            this._model = clientCore.CManager.getModel(this.sign) as PreludeToChristmasModel;
            this._control.model = this._model;

            this.imgGirl.visible = clientCore.LocalInfo.sex == 1;
            this.imgBoy.visible = clientCore.LocalInfo.sex != 1;

            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(xls.load(xls.globaltest));

            this.showCoinBox();

            this._oriBgmUrl = core.SoundManager.instance.currBgm;
            core.SoundManager.instance.playBgm('res/music/bgm/christMas.mp3', true);
        }

        async onPreloadOver() {
            let msg = await this._control.getInfo();

            let ani1 = clientCore.BoneMgr.ins.play("res/animate/preludeToChristmas/candle.sk", 0, true, this.mcAni);
            ani1.pos(0, 700);

            let ani2 = clientCore.BoneMgr.ins.play("res/animate/preludeToChristmas/candle.sk", 0, true, this.mcAni);
            ani2.pos(1350, 700);

            let ani3 = clientCore.BoneMgr.ins.play("res/animate/preludeToChristmas/bilufire.sk", 0, true, this.mcAni);
            ani3.pos(1065, 495);

            for (let i = 0; i < 8; i++) {
                let ani = clientCore.BoneMgr.ins.play("res/animate/preludeToChristmas/candle_light.sk", 0, true, this["imgG" + i]);
                ani.pos(-5, 75);
            }

            this.updateView();
            clientCore.Logger.sendLog('2020年12月18日活动', '【主活动】圣诞前奏曲', '打开活动面板');
        }

        private updateView() {
            let rewardArr = this._model.getRewardArr();
            for (let i = 0; i < rewardArr.length; i++) {
                let rewardInfo = rewardArr[i];
                let reward = clientCore.LocalInfo.sex == 1 ? rewardInfo.femaleProperty[0] : rewardInfo.maleProperty[0];
                this["imgG" + i].visible = false;
                this["imgT" + i].visible = false;
                if (clientCore.ItemsInfo.getItemNum(reward.v1) > 0) {
                    this["imgT" + i].visible = true;
                } else {
                    if (clientCore.ItemsInfo.getItemNum(rewardInfo.cost[0].v1) >= rewardInfo.cost[0].v2) {
                        this["imgG" + i].visible = true;
                    }
                }
            }

            let now = clientCore.ServerManager.curServerTime;
            let date = util.TimeUtil.formatSecToDate(util.TimeUtil.formatTimeStrToSec("2020/12/25 00:00:00"));
            if (now >= (date.getTime() / 1000)) {
                this.btnGet.visible = true;
                this.boxGiftTxt.visible = false;
            } else {
                this.imgGift.visible = this.btnGet.visible = false;
            }
        }

        private showCoinBox(): void {
            clientCore.UIManager.setMoneyIds([this._model.tokenId, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private onDetail() {
            alert.showRuleByID(this._model.ruleById);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        private onGet(): void {
            this.destroy();
            clientCore.ModuleManager.open("christmasParty.ChristmasPartyModule");
        }

        private onGame(): void {
            clientCore.Logger.sendLog('2020年12月18日活动', '【主活动】圣诞前奏曲', '点击打花花按钮');
            if (!this._model.isCanGame) {
                alert.showFWords('今日游戏次数已达上限');
                return;
            }
            if (!this._gamePanel) {
                this._gamePanel = new GamePanel(this.sign);
            }
            this._gamePanel.init();
            clientCore.DialogMgr.ins.open(this._gamePanel);
        }

        private onBuy(): void {
            clientCore.Logger.sendLog('2020年12月18日活动', '【主活动】圣诞前奏曲', '点击采购按钮');
            if (!this._model.isCanBuy) {
                alert.showFWords('今日购买次数已达上限');
                return;
            }
            if (!this._buyPanel) {
                this._buyPanel = new BuyPanel(this.sign);
                BC.addEvent(this, this._buyPanel, "ON_UPDATE", this, this.updateView);
                BC.addEvent(this, this._buyPanel, "ON_CLOSE", this, this.showCoinBox);
            }
            this._buyPanel.init();
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        private onGetEquip(index: number): void {
            if (!this._exchangePanel) {
                this._exchangePanel = new ExchangePanel(this.sign);
                BC.addEvent(this, this._exchangePanel, "ON_UPDATE", this, this.updateView);
            }
            this._exchangePanel.init(index);
            clientCore.DialogMgr.ins.open(this._exchangePanel);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.onGame);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            for (let i = 0; i < 8; i++) {
                BC.addEvent(this, this["imgY" + i], Laya.Event.CLICK, this, this.onGetEquip, [i]);
            }
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            if (this._oriBgmUrl)
                core.SoundManager.instance.playBgm(this._oriBgmUrl);
            this._buyPanel?.destroy();
            this._buyPanel = null;
            this._gamePanel?.destroy();
            this._gamePanel = null;
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