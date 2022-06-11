namespace moonStory {
    export class MoonYyzcBuyPanel extends ui.moonStory.panel.MoonYyzcBuyPanelUI {
        private _detailsPanel: BuyDetailsPanel;
        private readonly drawCoinId: number = 1511011;
        private type: number;
        constructor() {
            super();
            this._detailsPanel = new BuyDetailsPanel();
            this.type = clientCore.ServerManager.curServerTime > util.TimeUtil.formatTimeStrToSec('2020-10-9 00:00:00') ? 7 : 1;
            this.ad_nan.skin = this.type == 1 ? "unpack/moonStory/yyzc_ad_2.png" : "unpack/moonStory/yyzc_2_2.png";
            this.ad_nv.skin = this.type == 1 ? "unpack/moonStory/yyzc_ad_1.png" : "unpack/moonStory/yyzc_2_1.png";
            this.imgTime.skin = this.type == 1 ? "moonStory/ordertime.png" : "moonStory/ordertime1.png";
            this.ad_nv.visible = clientCore.LocalInfo.sex == 1;
            this.ad_nan.visible = clientCore.LocalInfo.sex == 2;
            this.addEventListeners();
            this.setUI();
        }

        public onShow() {
            clientCore.Logger.sendLog('2020年9月25日活动', '【付费】华彩月章', '打开盈月之池面板');
            clientCore.UIManager.setMoneyIds([this.drawCoinId]);
            clientCore.UIManager.showCoinBox();
        }

        private setUI() {
            let changeTime = this.type == 1 ? '2020-9-25 00:00:00' : '2020-10-9 00:00:00';
            if (clientCore.RechargeManager.checkBuyLimitInfo(29).lastTime < util.TimeUtil.formatTimeStrToSec(changeTime)) {
                this.btn_buy.visible = this.img_tip.visible = true;
            } else {
                this.btn_buy.visible = this.img_tip.visible = false;
            }
        }

        public hide() {
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1067);
        }

        /**奖励总览 */
        private async preReward() {
            clientCore.Logger.sendLog('2020年9月25日活动', '【付费】华彩月章', '点击奖励总览按钮');
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", this.type);
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([this.drawCoinId]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**礼包详情 */
        private showGiftDetails() {
            this._detailsPanel.showInfo(29);
            clientCore.DialogMgr.ins.open(this._detailsPanel);
        }

        /**预约礼包购买 */
        private buyOrderGift(id: number) {
            if (id != 29) return;
            clientCore.RechargeManager.pay(id).then((data) => {
                alert.showReward(data.items);
                this.btn_buy.visible = this.img_tip.visible = false;
            });
        }

        addEventListeners() {
            BC.addEvent(this, this.btn_reward, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.btn_buy, Laya.Event.CLICK, this, this.showGiftDetails);
            BC.addEvent(this, this.btn_help, Laya.Event.CLICK, this, this.showRule);
            EventManager.on("MOONSTORY_GIFT_BUY", this, this.buyOrderGift);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("MOONSTORY_GIFT_BUY", this, this.buyOrderGift);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            clientCore.UIManager.releaseCoinBox();
            this._detailsPanel?.destroy();
            this._detailsPanel = null;
        }
    }
}