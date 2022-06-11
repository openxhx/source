namespace anniversary {
    export class AnniversarySqzyPanel extends ui.anniversary.panel.AnniversarySqzyPanelUI {
        private readonly suitId: number = 2110032;
        private readonly giftId: number = 2174;
        private readonly coinId: number = 1511008;
        private _control: AnniversaryControl;
        private _model: AnniversaryModel;
        private _exchangePanel: ExchangeCodePanel;
        constructor(sign: number) {
            super();
            this.addEventListeners();
            this.boxFemale.visible = clientCore.LocalInfo.sex == 1;
            this.boxMale.visible = clientCore.LocalInfo.sex == 2;
            this._model = clientCore.CManager.getModel(sign) as AnniversaryModel;
            this._control = clientCore.CManager.getControl(sign) as AnniversaryControl;
            this._exchangePanel = new ExchangeCodePanel();
            this.listDetails.renderHandler = new Laya.Handler(this, this.detailsRender);
            let config = xls.get(xls.eventExchange).get(this.giftId);
            this.listDetails.array = clientCore.LocalInfo.sex == 1 ? config.femaleProperty : config.maleProperty;
        }
        public onShow() {
            clientCore.Logger.sendLog('2020年7月17日活动', '【付费】花恋流年', '打开神祈之佑面板');
            this.boxDetails.visible = false;
            clientCore.UIManager.setMoneyIds([this.coinId]);
            clientCore.UIManager.showCoinBox();
            this.setUI();
        }

        private setUI() {
            let have = clientCore.SuitsInfo.getSuitInfo(this.suitId).allGet;
            this.imgGot.visible = this.btnGo.visible = have;
            this.boxBuy.visible = !have;
            if (this._model.code) {
                this.imgGuaBg.skin = "anniversary/刮开后.png";
                this.labCode.text = this._model.code;
                this.imgCodeTip1.visible = false;
                this.imgCodeTip2.visible = this.btnUseRule.visible = true;
            } else {
                this.imgGuaBg.skin = "anniversary/未刮开.png";
                this.labCode.text = "";
                this.imgCodeTip1.visible = true;
                this.imgCodeTip2.visible = this.btnUseRule.visible = false;
            }
        }

        public hide() {
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        /**礼包详情 */
        private detailsRender(item: ui.commonUI.item.RewardItemUI) {
            let data: xls.pair = item.dataSource;
            if (data.v1 == this.suitId) {
                let clothId = clientCore.LocalInfo.sex == 1 ? 141574 : 141587;
                item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(clothId);
                item.ico.skin = clientCore.LocalInfo.sex == 1 ? "anniversary/1-1.png" : "anniversary/1-2.png";
                item.ico.scale(1.5, 1.5);
                item.txtName.text = "冰魄之椿套装";
                item.txtName.visible = true;
                item.num.visible = false;
            } else {
                clientCore.GlobalConfig.setRewardUI(item, { id: data.v1, cnt: data.v2, showName: true });
            }
        }

        /**购买套装 */
        private buySuit() {
            let config = xls.get(xls.eventExchange).get(this.giftId);
            let has = clientCore.ItemsInfo.getItemNum(config.cost[0].v1);
            if (has < config.cost[0].v2) {
                alert.alertQuickBuy(config.cost[0].v1, config.cost[0].v2 - has, true);
                return;
            }
            net.sendAndWait(new pb.cs_common_exchange({ activityId: 47, exchangeId: this.giftId })).then((data: pb.sc_common_exchange) => {
                let arr: pb.IItem[] = [];
                for (let j: number = 0; j < data.item.length; j++) {
                    if (data.item[j].id == this.suitId) {
                        let cloths = clientCore.SuitsInfo.getSuitInfo(this.suitId).clothes;
                        for (let i: number = 0; i < cloths.length; i++) {
                            let item = new pb.Item();
                            item.id = cloths[i];
                            item.cnt = 1;
                            arr.push(item);
                        }
                    } else {
                        arr.push(data.item[j]);
                    }
                }
                alert.showReward(arr);
                this._model.totalCost += xls.get(xls.eventExchange).get(this.giftId).cost[0].v2;
                // this.setUI();
            })
        }

        /**试穿套装 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
        }

        /**前往神祈 */
        private gotoShenQi() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("pray.PrayModule");
        }

        /**兑换密码 */
        private exchangeCode() {
            clientCore.Logger.sendLog('2020年7月17日活动', '【付费】花恋流年', '点击联动奖励兑换按钮');
            clientCore.DialogMgr.ins.open(this._exchangePanel);
        }

        /**展示密码 */
        private showCode(code: string) {
            this._model.code = code;
            this.imgGuaBg.skin = "anniversary/刮开后.png";
            this.labCode.text = this._model.code;
            this.setUI();
        }

        /**展示礼包详情 */
        private showGiftDetails(flag: boolean) {
            this.boxDetails.visible = flag;
        }

        /**使用说明 */
        private showRule() {
            alert.showRuleByID(1039);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTyr, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.gotoShenQi);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.exchangeCode);
            BC.addEvent(this, this.btnGift, Laya.Event.MOUSE_DOWN, this, this.showGiftDetails, [true]);
            BC.addEvent(this, this.btnGift, Laya.Event.MOUSE_OUT, this, this.showGiftDetails, [false]);
            BC.addEvent(this, this.btnGift, Laya.Event.MOUSE_UP, this, this.showGiftDetails, [false]);
            BC.addEvent(this, this.btnUseRule, Laya.Event.CLICK, this, this.showRule);
            EventManager.on("ANNIVERSARY_GET_CODE", this, this.showCode);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("ANNIVERSARY_GET_CODE", this, this.showCode);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            this._model = this._control = null;
        }
    }
}