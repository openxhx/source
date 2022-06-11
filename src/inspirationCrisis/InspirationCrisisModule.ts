namespace inspirationCrisis {
    /**
     * 灵感大作战
     */
    export class InspirationCrisisModule extends ui.inspirationCrisis.InspirationCrisisModuleUI {
        private _receiveIndex: number = -1;     //当先显示奖励index值
        private _canGet: boolean = false;       //是否可以领取奖励
        private _receiveItemId: number = 0;

        private _model: InspirationCrisisModel;
        private _control: InspirationCrisisControl;

        private _rewardExchangePanel: RewardExchangePanel;
        private _suitePanel: SuitePanel;
        private _supplyPanel: SupplyPanel;

        init(data?: any) {
            super.init(data);

            this.sign = clientCore.CManager.regSign(new InspirationCrisisModel(), new InspirationCrisisControl());
            this._control = clientCore.CManager.getControl(this.sign) as InspirationCrisisControl;
            this._model = clientCore.CManager.getModel(this.sign) as InspirationCrisisModel;

            this._rewardExchangePanel = new RewardExchangePanel(this.sign);
            this._suitePanel = new SuitePanel(this.sign);
            this._supplyPanel = new SupplyPanel(this.sign);

            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.commonBuy));
        }

        async onPreloadOver() {
            let msg = await this._control.getInfo();
            this._model.updateInfo(msg);

            this.imgRole.skin = clientCore.LocalInfo.sex == 1 ? "inspirationCrisis/girl.png" : "inspirationCrisis/boy.png";

            this.updateView();
            clientCore.Logger.sendLog('2020年9月11日活动', '【主活动】灵感大危机', '打开活动面板');
        }

        popupOver() {
            clientCore.AnimateMovieManager.showOnceAnimate(this._model.mc_Id, MedalConst.INSPIRATION_CRISIS_MC);
        }

        private updateView(): void {
            this.txtCoinNum.text = this._model.moodNum + "";

            this.imgProgress.width = Math.min((this._model.moodNum / this._model.moodMax), 1) * 175;
            this.txtGameTimes.text = '今日剩余：' + (this._model.gameTimesMax - this._model.gameTimes) + '/' + this._model.gameTimesMax;

            this.imgMoon0.visible = false;
            this.imgMoon1.visible = false;
            this.imgMoon2.visible = false;
            for (let i = 0; i < this._model.moonTxtList.length; i++) {
                let obj: any = this._model.moonTxtList[i];
                if (this._model.moodNum >= obj.min && this._model.moodNum < obj.max) {
                    this.labMoodDesc.text = obj.txt;
                    this["imgMoon" + i].visible = true;
                    this.imgState.skin = 'inspirationCrisis/txt_zhuang_tai_' + i + '.png';
                    break;
                }
            }

            let isAllGet: boolean = true;
            let rewardArr = this._model.getRewardArr();
            this._canGet = false;
            for (let i = 0; i < rewardArr.length; i++) {
                this._receiveIndex = i;
                let obj: xls.commonAward = rewardArr[i];
                this._receiveItemId = clientCore.LocalInfo.sex == 1 ? obj.femaleAward[0].v1 : obj.maleAward[0].v1;
                this.labReceiveNum.text = obj.num.v2 + "";
                if (!this._model.getHasItem(this._receiveItemId)) {
                    isAllGet = false;
                    if (this._model.moodNum >= obj.num.v2) {
                        this._canGet = true;
                    }
                    break;
                }
            }
            this.imgReceiveItem.skin = this._model.getItemSkin(this._receiveItemId);
            this.btnGet.visible = this._canGet;

            if (isAllGet) {
                this.boxReceiveTips.visible = false;
            }

            if (this._model.isCanBuy) {
                let cls: xls.commonBuy = this._model.getBuyInfo()[this._model.buyTimes];
                this.labSuiteNum.text = cls.itemCost.v2.toString();
                let reward = clientCore.LocalInfo.sex == 1 ? cls.femaleAward[0].v2 : cls.maleAward[0].v2;
                this.imgSuite.skin = clientCore.ItemsInfo.getItemIconUrl(cls.itemCost.v1);
                this.boxSuiteNum.visible = true;
            } else {
                this.boxSuiteNum.visible = false;
            }
        }

        private onSupplyPanelUpdate(data: any): void {
            alert.showReward(clientCore.GoodsInfo.createArray(data));
            this.updateView();
        }

        private onSuitePanelUpdate(data: any): void {
            this.btnSuite.visible = false;
            let aniBtnDati: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/inspirationCrisis/telephone.sk", 0, false, this.boxAni as Laya.Sprite);
            aniBtnDati.pos(100, 80);
            aniBtnDati.once(Laya.Event.COMPLETE, this, () => {
                this.btnSuite.visible = true;
                alert.showReward(clientCore.GoodsInfo.createArray(data));
            });
            this.updateView();
        }

        private onDetail() {
            alert.showRuleByID(this._model.ruleById);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        private onReview(): void {
            clientCore.AnimateMovieManager.showAnimateMovie(this._model.mc_Id, null, null);
        }

        private onReceiveTips(): void {
            clientCore.ToolTip.showTips(this.boxReceiveItem, { id: this._receiveItemId });
        }

        private onGet(): void {
            if (this._canGet) {
                let rewardArr = this._model.getRewardArr();
                let obj = rewardArr[this._receiveIndex];
                this._control.exchangeAward(obj.id, this._receiveIndex, Laya.Handler.create(this, (msg: pb.sc_inspire_crisis_exchange) => {
                    this.updateView();
                    alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
                }))
            }
        }

        private onReward(): void {
            this._rewardExchangePanel.init();
            clientCore.DialogMgr.ins.open(this._rewardExchangePanel);
        }

        private onGame(): void {
            this.destroy();

            if (!this._model.isCanGame) {
                alert.showFWords('今日游戏次数已达上限');
                return;
            }
            clientCore.ModuleManager.open("linkLinkGame3.LinkLinkGameModule", null, { openWhenClose: "inspirationCrisis.InspirationCrisisModule" });
        }

        private onSupply(): void {
            if (!this._model.isCanSupply) {
                alert.showFWords('今日兑换次数已达上限');
                return;
            }
            this._supplyPanel.init({ onCloseFun: this.onSupplyPanelUpdate.bind(this) });
            clientCore.DialogMgr.ins.open(this._supplyPanel);
            clientCore.Logger.sendLog('2020年9月11日活动', '【主活动】灵感大危机', '点击薇薇补给站面板');
        }

        private onSuite(): void {
            if (!this._model.isCanBuy) {
                alert.showFWords('今日购买次数已达上限');
                return;
            }
            this._suitePanel.init({ onCloseFun: this.onSuitePanelUpdate.bind(this) });
            clientCore.DialogMgr.ins.open(this._suitePanel);
            clientCore.Logger.sendLog('2020年9月11日活动', '【主活动】灵感大危机', '点击文豪体验套餐面板');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnReview, Laya.Event.CLICK, this, this.onReview);
            BC.addEvent(this, this.boxReceiveItem, Laya.Event.CLICK, this, this.onReceiveTips);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.onGame);
            BC.addEvent(this, this.btnSupply, Laya.Event.CLICK, this, this.onSupply);
            BC.addEvent(this, this.btnSuite, Laya.Event.CLICK, this, this.onSuite);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            this._rewardExchangePanel?.destroy();
            this._rewardExchangePanel = null;
            this._suitePanel?.destroy();
            this._suitePanel = null;
            this._supplyPanel?.destroy();
            this._supplyPanel = null;
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}