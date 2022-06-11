namespace timeAmbulatory {
    export class TimeGiftPanel extends ui.timeAmbulatory.panel.TimeGiftPanelUI {
        private _model: TimeAmbulatoryModel;
        private _control: TimeAmbulatoryControl;
        private reward: xls.commonAward[];

        private exchangePanel: TimeExchangePanel;
        private costPanel: TimeCostPanel;

        private _engryInfo: pb.sc_taobao_festival_get_energy_cnt;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as TimeAmbulatoryModel;
            this._control = clientCore.CManager.getControl(sign) as TimeAmbulatoryControl;
            this.costPanel = new TimeCostPanel(sign);
            this.exchangePanel = new TimeExchangePanel();
            this.addEventListeners();
            this.suit_1.visible = clientCore.LocalInfo.sex == 1;
            this.suit_2.visible = clientCore.LocalInfo.sex == 2;
            this.boxPanel.visible = false;
        }

        public onShow() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '打开光阴之礼面板');
            this.reward = _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == 112 });
            this.boxPanel.visible = false;
            this.setUI();
        }

        private async setUI() {
            this._engryInfo = await this._control.getEnergyInfo();
            this.reward = this.bubbleSort(this.reward);
            let target = _.find(this.reward, (o) => { return o.num.v2 > this._engryInfo.energyNum });
            if (!target) this.boxCost.visible = false;
            else {
                this.boxCost.visible = true;
                this.txtCnt.text = "" + (target.num.v2 - this._engryInfo.energyNum);
            }
        }

        private bubbleSort(arr: Array<xls.commonAward>) {
            let temp: xls.commonAward;
            let tag = true
            for (let j = 0; tag === true; j++) {
                tag = false;
                for (let i = 0; i < arr.length - 1; i++) {
                    if (util.getBit(this._model.costRewardStatus, arr[i].id - 236) > util.getBit(this._model.costRewardStatus, arr[i + 1].id - 236)) {
                        temp = arr[i]
                        arr[i] = arr[i + 1];
                        arr[i + 1] = temp;
                        tag = true;
                    }
                }
            }
            return arr;
        }

        public hide() {
            this.boxPanel.visible = false;
            this.costPanel.hide();
            this.exchangePanel.hide();
            this.boxPanel.removeChildren();
            this.boxMain.visible = true;
            this.visible = false;
        }

        /**打开兑换面板 */
        private openExchange() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '打开美丽秘籍面板');
            this.boxPanel.addChild(this.exchangePanel);
            this.exchangePanel.onShow();
            this.boxMain.visible = false;
            this.boxPanel.visible = true;
        }

        /**打开累消面板 */
        private openCostPanel() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '打开庆典赠礼面板');
            this.boxPanel.addChild(this.costPanel);
            this.costPanel.onShow();
            this.boxMain.visible = false;
            this.boxPanel.visible = true;
        }

        /**子面板关闭 */
        private closeChild() {
            this.boxPanel.visible = false;
            this.boxMain.visible = true;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.openCostPanel);
            BC.addEvent(this, this.btnMiji, Laya.Event.CLICK, this, this.openExchange);
            EventManager.on("TIME_GIFT_CLOSE_CHILD", this, this.closeChild);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("TIME_GIFT_CLOSE_CHILD", this, this.closeChild);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            this.costPanel?.destroy();
            this.exchangePanel?.destroy();
            this.costPanel = this.exchangePanel = this.reward = this._model = this._control = null;
        }
    }
}