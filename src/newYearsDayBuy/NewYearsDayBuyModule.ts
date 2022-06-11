namespace newYearsDayBuy {
    /**
     * 2021.8.13
     * 夏末6元购界面
     * newYearsDayBuy.NewYearsDayBuyModule
     */
    export class NewYearsDayBuyModule extends ui.newYearsDayBuy.NewYearsDayBuyModuleUI {
        private canBuy: boolean;

        private _model: NewYearsDayBuyModel;
        private _control: NewYearsDayBuyControl;

        init(data?: any) {
            super.init(data);

            this.sign = clientCore.CManager.regSign(new NewYearsDayBuyModel(), new NewYearsDayBuyControl());
            this._control = clientCore.CManager.getControl(this.sign) as NewYearsDayBuyControl;
            this._model = clientCore.CManager.getModel(this.sign) as NewYearsDayBuyModel;
            this._control.model = this._model;

            this.addPreLoad(xls.load(xls.dayAward));

            this.panel.hScrollBarSkin = "";

            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        async onPreloadOver() {
            let msg = await this._control.getInfo();
            this._model.updateInfo(msg);

            this.canBuy = this._model.canBuy;

            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;

            let arr = this._model.getRewardArr();
            for (let i: number = 1; i <= 7; i++) {
                let xlsData = arr[i - 1];
                let reward = clientCore.LocalInfo.sex == 1 ? xlsData.femaleAward : xlsData.maleAward;
                let item: ui.newYearsDayBuy.render.NewYearsDayBuyRenderUI = this["day" + i];
                item.imgDay.skin = "newYearsDayBuy/" + i + ".png";
                for (let j: number = 0; j < reward.length; j++) {
                    item["reward" + (j + 1)].skin = clientCore.ItemsInfo.getItemIconUrl(reward[j].v1);
                    item["lab" + (j + 1)].text = "x" + reward[j].v2;
                    BC.addEvent(this, item["reward" + (j + 1)], Laya.Event.CLICK, this, this.showReward, [item["reward" + (j + 1)], reward[j].v1])
                }
                BC.addEvent(this, this["btnGet" + i], Laya.Event.CLICK, this, this.getReward, [i]);
            }

            this.updateView();
            clientCore.Logger.sendLog('2021年8月13日活动', '【付费】夏末6元购', '打开夏末6元购活动面板');
        }

        private updateView() {
            this.btnBuy.visible = this.canBuy;
            for (let i: number = 1; i <= 7; i++) {
                let item: ui.newYearsDayBuy.render.NewYearsDayBuyRenderUI = this["day" + i];
                item.imgSuo.visible = i > this._model.loginDay;
                this["imgGot" + i].visible = util.getBit(this._model.rewardStatus, i) == 1;
                this["btnGet" + i].visible = !this["imgGot" + i].visible && i <= this._model.loginDay;
            }
        }

        private showReward(item: any, id: number) {
            clientCore.ToolTip.showTips(item, { id: id });
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this._model.ruleById);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        /**领取奖励 */
        private getReward(day: number) {
            this._control.getReward(day, Laya.Handler.create(this, (msg: pb.sc_buy_for_six_yuan_on_the_seventh_night_get_reward) => {
                this._model.rewardStatus = util.setBit(this._model.rewardStatus, day, 1);
                this.updateView();
                alert.showReward(msg.item);
            }))
        }

        /**购买6元购 */
        private buyGift() {
            this._control.buyGift(Laya.Handler.create(this, () => {
                this._model.loginDay = 1;
                this.canBuy = false;
                this.updateView();
            }))
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buyGift);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}