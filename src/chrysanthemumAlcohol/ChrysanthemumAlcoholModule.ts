namespace chrysanthemumAlcohol {
    /**
     * 2020.10.23
     * 金菊酿酒香界面
     * chrysanthemumAlcohol.ChrysanthemumAlcoholModule
     */
    export class ChrysanthemumAlcoholModule extends ui.chrysanthemumAlcohol.ChrysanthemumAlcoholModuleUI {
        private readonly TOTAL_LEN: number = 1000;

        private _totalScore: number;

        private _itemList: ui.chrysanthemumAlcohol.render.ExchangeRenderUI[];

        private _model: ChrysanthemumAlcoholModel;
        private _control: ChrysanthemumAlcoholControl;

        private _buyPanel: BuyPanel;
        private _receivePanel: ReceivePanel;

        init(data?: any) {
            super.init(data);

            this._itemList = [];

            this.sign = clientCore.CManager.regSign(new ChrysanthemumAlcoholModel(), new ChrysanthemumAlcoholControl());
            this._control = clientCore.CManager.getControl(this.sign) as ChrysanthemumAlcoholControl;
            this._model = clientCore.CManager.getModel(this.sign) as ChrysanthemumAlcoholModel;
            this._control.model = this._model;

            this._buyPanel = new BuyPanel(this.sign);
            this._receivePanel = new ReceivePanel(this.sign);

            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.commonBuy));

            this.onUpdateCoin();
            clientCore.UIManager.showCoinBox();
        }

        async onPreloadOver() {
            let totalInfo = await clientCore.MedalManager.getMedal([MedalDailyConst.IMPOSSIBLE_TASKS_BUY]);
            this._model.buyTimes = totalInfo[0].value;
            await this._control.getInfo();

            this.imgGirl.visible = clientCore.LocalInfo.sex == 1;
            this.imgBoy.visible = clientCore.LocalInfo.sex != 1;

            //创建进度条
            this.imgProgressBg.width = this.TOTAL_LEN;
            let arr = this._model.getRewardArr();
            this._totalScore = _.last(_.map(arr, (o) => { return o.num.v2 }));
            for (let i = 0; i < arr.length; i++) {
                let o = arr[i];
                let itemUI = new ui.chrysanthemumAlcohol.render.ExchangeRenderUI();
                itemUI.pos(o.num.v2 / this._totalScore * this.TOTAL_LEN, 0, true);
                itemUI.dataSource = o;
                itemUI.imgBiaoqing.skin = 'chrysanthemumAlcohol/biaoqing_' + (i + 1) + '.png';
                let rwdId = clientCore.LocalInfo.sex == 1 ? o.femaleAward[0].v1 : o.maleAward[0].v1;
                itemUI.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(rwdId);
                this.boxProgressItem.addChild(itemUI);
                this._itemList.push(itemUI);
                BC.addEvent(this, itemUI, Laya.Event.CLICK, this, this.onGetScoreReward, [i]);
            }

            this.updateView();
            clientCore.Logger.sendLog('2020年10月23日活动', '【主活动】金菊酿酒香', '打开活动面板');
        }

        popupOver() {
            clientCore.AnimateMovieManager.showOnceAnimate(this._model.mc_Id, MedalConst.CHRYSANTHEMUM_ALCOHOL_MC);
        }

        private updateView() {
            let tokenNum = this._model.tokenNum;
            this.labManzu.text = tokenNum + '/' + this._totalScore;
            this.imgLucky.height = Math.min(tokenNum, this._totalScore) / this._totalScore * 200;

            let itemNum5 = this._model.itemNum5;
            this.labManzuNum.text = itemNum5 + "";
            this.btnDrink.disabled = itemNum5 == 0;

            //进度条
            this.imgProgress.width = Math.min(tokenNum / this._totalScore * this.TOTAL_LEN, this.TOTAL_LEN);
            this.boxProgressTxt.x = this.imgProgress.width + this.imgProgress.x;
            this.txtProgress.text = tokenNum + "";

            for (let i = 0; i < this._model.qipaoData.length; i++) {
                let obj = this._model.qipaoData[i];
                if (obj.num == -1 || this._model.tokenNum <= obj.num) {
                    this.labYizi.text = obj.desc;
                    break;
                }
            }

            for (let i = 0; i < this._itemList.length; i++) {
                let item = this._itemList[i];
                let data = item.dataSource as xls.commonAward;
                let rewardId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                let getRewarded = clientCore.ItemsInfo.getItemNum(rewardId) > 0;
                let canGetReward = tokenNum >= data.num.v2;
                item.imgGet.visible = getRewarded;
                item.imgHaveRwd.visible = canGetReward && !getRewarded;
            }
        }

        private onGetScoreReward(idx: number, e: Laya.Event) {
            let data = e.currentTarget['dataSource'] as xls.commonAward;
            let rewardId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
            let getRewarded = clientCore.ItemsInfo.getItemNum(rewardId) > 0;
            let canGetReward = this._model.tokenNum >= data.num.v2;
            if (canGetReward && !getRewarded) {
                this._control.exchange(idx + 1, Laya.Handler.create(this, (msg: pb.sc_gloden_chrysanthemum_exchange_award) => {
                    this.updateView();
                    alert.showReward(clientCore.GoodsInfo.createArray(msg.itms));
                }))
            } else {
                clientCore.ToolTip.showTips(e.currentTarget, { id: rewardId });
            }
        }

        private onDetail(): void {
            alert.showRuleByID(this._model.ruleById1);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        private onBuy(): void {
            if (!this._model.isCanBuy) {
                alert.showFWords('今日购买次数已达上限');
                return;
            }
            this._buyPanel.init();
            clientCore.DialogMgr.ins.open(this._buyPanel);
            clientCore.Logger.sendLog('2020年10月23日活动', '【主活动】金菊酿酒香', '点击赠送药材');
        }

        private onReceive(): void {
            if (this._model.freeFlag >= 1) {
                alert.showFWords('今日已领取过奖励');
                return;
            }

            this._receivePanel.init();
            clientCore.DialogMgr.ins.open(this._receivePanel);
            clientCore.Logger.sendLog('2020年10月23日活动', '【主活动】金菊酿酒香', '点击免费菊酒');
        }

        private onWorkshop(): void {
            this.destroy();
            clientCore.ModuleManager.open('chrysanthemumAlcohol.ChrysanthemumAlcoholWorkshopModule');
            clientCore.Logger.sendLog('2020年10月23日活动', '【主活动】金菊酿酒香', '点击酿酒工坊');
        }

        private onDrink(): void {
            this._control.getFree(2, Laya.Handler.create(this, (msg: pb.sc_gloden_chrysanthemum_get_free) => {
                this.updateView();
                if (msg.itms.length > 0) {
                    alert.showFWords("满意度提升" + msg.itms[0].cnt);
                }
            }));
        }

        private onUpdateBuy(data): void {
            this.updateView();
        }

        private onUpdateReceive(data): void {
            this.updateView();
        }

        private onUpdateCoin(): void {
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID, clientCore.MoneyManager.LEAF_MONEY_ID]);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnReceive, Laya.Event.CLICK, this, this.onReceive);
            BC.addEvent(this, this.btnWorkshop, Laya.Event.CLICK, this, this.onWorkshop);
            BC.addEvent(this, this.btnDrink, Laya.Event.CLICK, this, this.onDrink);
            BC.addEvent(this, this._buyPanel, "ON_UPDATE_BUY", this, this.onUpdateBuy);
            BC.addEvent(this, this._buyPanel, "ON_CLOSE_BUY", this, this.onUpdateCoin);
            BC.addEvent(this, this._receivePanel, "ON_UPDATE_RECEIVE", this, this.onUpdateReceive);
            BC.addEvent(this, this._receivePanel, "ON_CLOSE_RECEIVE", this, this.onUpdateCoin);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            this._buyPanel?.destroy();
            this._buyPanel = null;
            this._receivePanel?.destroy();
            this._receivePanel = null;
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            clientCore.UIManager.releaseEvent();
            super.destroy();
        }
    }
}