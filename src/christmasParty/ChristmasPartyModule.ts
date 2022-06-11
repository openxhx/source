namespace christmasParty {
    /**
     * 2020.12.25
     * 暖心圣诞聚会界面
     * christmasParty.ChristmasPartyModule
     */
    export class ChristmasPartyModule extends ui.christmasParty.ChristmasPartyModuleUI {
        private _oriBgmUrl: string;

        private _model: ChristmasPartyModel;
        private _control: ChristmasPartyControl;

        private _exchangePanel: ExchangePanel;
        private _collectPanel: CollectPanel;
        private _kukuluPanel: KukuluPanel;
        private _andeluPanel: AndeluPanel;
        private _daiweiweiPanel: DaiweiweiPanel;
        private _luLuPanel: LuLuPanel;
        private _angesiPanel: AngesiPanel;

        init(data?: any) {
            super.init(data);

            this.sign = clientCore.CManager.regSign(new ChristmasPartyModel(), new ChristmasPartyControl());
            this._control = clientCore.CManager.getControl(this.sign) as ChristmasPartyControl;
            this._model = clientCore.CManager.getModel(this.sign) as ChristmasPartyModel;
            this._control.model = this._model;

            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.globaltest));
            this.addPreLoad(this.onUpdateInfp());

            this.showCoinBox();

            this._oriBgmUrl = core.SoundManager.instance.currBgm;
            core.SoundManager.instance.playBgm('res/music/bgm/huascars.mp3', true);
        }

        async onPreloadOver() {
            let ani1 = clientCore.BoneMgr.ins.play("res/animate/christmasParty/2kklfnle.sk", 0, true, this.boxNpc1);
            ani1.pos(185, 260);

            let ani2 = clientCore.BoneMgr.ins.play("res/animate/christmasParty/3adladw.sk", 0, true, this.boxNpc2);
            ani2.pos(130, 270);

            let ani3 = clientCore.BoneMgr.ins.play("res/animate/christmasParty/5lsdww.sk", 0, true, this.boxNpc3);
            ani3.pos(255, 260);

            let ani4 = clientCore.BoneMgr.ins.play("res/animate/christmasParty/4llln.sk", 0, true, this.boxNpc4);
            ani4.pos(150, 250);

            let ani5 = clientCore.BoneMgr.ins.play("res/animate/christmasParty/1agssme.sk", 0, true, this.boxNpc5);
            ani5.pos(150, 250);

            clientCore.Logger.sendLog('2020年12月25日活动', '【主活动】暖心圣诞聚会', '打开活动面板');
        }

        private async onUpdateInfp() {
            await this._control.getInfo();
            this.updateView();
        }

        private updateView() {
            let hot = this._model.hot - Math.max(Math.floor((clientCore.ServerManager.curServerTime - this._model.timeStamp) / 900), 0);
            hot = Math.max(hot, 0);

            this.labProgress.text = hot + "/100";
            this.imgProgress.width = (hot / 100) * 520;

            this.boxGift.visible = this._model.isGetGift == 0;
            this.boxHots.visible = this._model.isGetGift == 1;
            // 对应 璐璐 安格斯 库库鲁 黛薇薇 安德鲁
            this.boxNpc1.visible = this._model.isGetGift == 0 || this._model.roleInfo[2] == 1;
            this.imgNpc1.visible = this._model.isGetGift == 1 && this._model.roleInfo[2] == 0;
            this.boxNpc2.visible = this._model.isGetGift == 0 || this._model.roleInfo[4] == 1;
            this.imgNpc2.visible = this._model.isGetGift == 1 && this._model.roleInfo[4] == 0;
            this.boxNpc3.visible = this._model.isGetGift == 0 || this._model.roleInfo[3] == 1;
            this.imgNpc3.visible = this._model.isGetGift == 1 && this._model.roleInfo[3] == 0;
            this.boxNpc4.visible = this._model.isGetGift == 0 || this._model.roleInfo[0] == 1;
            this.imgNpc4.visible = this._model.isGetGift == 1 && this._model.roleInfo[0] == 0;
            this.boxNpc5.visible = this._model.isGetGift == 0 || this._model.roleInfo[1] == 1;
            this.imgNpc5.visible = this._model.isGetGift == 1 && this._model.roleInfo[1] == 0;
        }

        private showCoinBox(): void {
            clientCore.UIManager.setMoneyIds([this._model.tokenId, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private onDetail() {
            alert.showRuleByID(this._model.ruleById);
            clientCore.Logger.sendLog('2020年12月25日活动', '【主活动】暖心圣诞聚会', '打开查看规则');
        }

        private onExchange(): void {
            if (!this._exchangePanel) {
                this._exchangePanel = new ExchangePanel(this.sign);
                this._exchangePanel.updateHanlder = new Laya.Handler(this, this.updateView);
                BC.addEvent(this, this._exchangePanel, "ON_CLOSE", this, this.showCoinBox);
            }
            this._exchangePanel.init();
            clientCore.DialogMgr.ins.open(this._exchangePanel);
            clientCore.Logger.sendLog('2020年12月25日活动', '【主活动】暖心圣诞聚会', '打开奖励兑换界面');
        }

        private onCollect(): void {
            if (this._model.exchangeItemFlag > 0) {
                alert.showFWords('今天已经提交过了~~');
                return;
            }
            if (!this._collectPanel) {
                this._collectPanel = new CollectPanel(this.sign);
                this._collectPanel.updateHanlder = new Laya.Handler(this, this.updateView);
                BC.addEvent(this, this._collectPanel, "ON_CLOSE", this, this.showCoinBox);
            }
            this._collectPanel.init();
            clientCore.DialogMgr.ins.open(this._collectPanel);
            clientCore.Logger.sendLog('2020年12月25日活动', '【主活动】暖心圣诞聚会', '打开收集铃铛花界面');
        }

        private onGet(): void {
            this._control.getChristmasReward(Laya.Handler.create(this, (msg: pb.sc_christmas_party_get_christmas_reward) => {
                this.onUpdateInfp();
                alert.showReward(msg.items);
            }))
        }

        /**找回库库鲁**/
        private onZhaohuiKKL(): void {
            if (!this._kukuluPanel) {
                this._kukuluPanel = new KukuluPanel(this.sign);
                BC.addEvent(this, this._kukuluPanel, "ON_CLOSE", this, this.showCoinBox);
            }
            this._kukuluPanel.init();
            clientCore.DialogMgr.ins.open(this._kukuluPanel);
        }

        /**找回安德鲁**/
        private onZhaohuiADL(): void {
            if (!this._andeluPanel) {
                this._andeluPanel = new AndeluPanel(this.sign);
                this._andeluPanel.updateHanlder = new Laya.Handler(this, this.onUpdateInfp);
                BC.addEvent(this, this._andeluPanel, "ON_CLOSE", this, this.showCoinBox);
            }
            this._andeluPanel.init();
            clientCore.DialogMgr.ins.open(this._andeluPanel);
        }

        /**找回黛薇薇**/
        private onZhaohuiDWW(): void {
            if (!this._daiweiweiPanel) {
                this._daiweiweiPanel = new DaiweiweiPanel(this.sign);
                this._daiweiweiPanel.updateHanlder = new Laya.Handler(this, this.onUpdateInfp);
                BC.addEvent(this, this._daiweiweiPanel, "ON_CLOSE", this, this.showCoinBox);
            }
            this._daiweiweiPanel.init();
            clientCore.DialogMgr.ins.open(this._daiweiweiPanel);
        }

        /**找回露露**/
        private onZhaohuiLL(): void {
            if (!this._luLuPanel) {
                this._luLuPanel = new LuLuPanel(this.sign);
                this._luLuPanel.updateHanlder = new Laya.Handler(this, this.onUpdateInfp);
                BC.addEvent(this, this._luLuPanel, "ON_CLOSE", this, this.showCoinBox);
            }
            this._luLuPanel.init();
            clientCore.DialogMgr.ins.open(this._luLuPanel);
        }

        /**找回安格斯**/
        private onZhaohuiAGS(): void {
            if (!this._angesiPanel) {
                this._angesiPanel = new AngesiPanel(this.sign);
                BC.addEvent(this, this._angesiPanel, "ON_CLOSE", this, this.showCoinBox);
            }
            this._angesiPanel.init();
            clientCore.DialogMgr.ins.open(this._angesiPanel);
        }

        private onGo(): void {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("preludeToChristmas.PreludeToChristmasModule");
            clientCore.Logger.sendLog('2020年12月25日活动', '【主活动】暖心圣诞聚会', '打开收集铃铛花界面');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this.btnCollect, Laya.Event.CLICK, this, this.onCollect);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
            BC.addEvent(this, this.imgNpc1, Laya.Event.CLICK, this, this.onZhaohuiKKL);
            BC.addEvent(this, this.imgNpc2, Laya.Event.CLICK, this, this.onZhaohuiADL);
            BC.addEvent(this, this.imgNpc3, Laya.Event.CLICK, this, this.onZhaohuiDWW);
            BC.addEvent(this, this.imgNpc4, Laya.Event.CLICK, this, this.onZhaohuiLL);
            BC.addEvent(this, this.imgNpc5, Laya.Event.CLICK, this, this.onZhaohuiAGS);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGo);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            if (this._oriBgmUrl)
                core.SoundManager.instance.playBgm(this._oriBgmUrl);
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