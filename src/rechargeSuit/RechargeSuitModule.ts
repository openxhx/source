namespace rechargeSuit {
    const SUIT_ID = 2110289;
    const GOODS_ID = 32;
    /**
     * 智慧之鹰   2021.2.26
     * rechargeSuit.RechargeSuitModule
     * moduleID:237
     */
    export class RechargeSuitModule extends ui.rechargeSuit.RechargeSuitModuleUI {

        init(d: any) {
            this.imgSuit1.visible = this.imgItem1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = this.imgItem2.visible = clientCore.LocalInfo.sex == 2;
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年2月26日活动', '【付费】智慧之鹰', '打开活动面板');
            this.btnBuy.visible = !clientCore.ItemsInfo.checkHaveItem(SUIT_ID);
        }

        private onBuy() {
            if (clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet) {
                this.btnBuy.visible = false;
                return;
            }
            alert.showSmall(`确定要花费30元来购买吗？`, { callBack: { caller: this, funArr: [this.sureBuy] } });
        }

        private sureBuy() {
            clientCore.RechargeManager.pay(GOODS_ID).then((data) => {
                alert.showReward(data.items);
                this.btnBuy.visible = false;
            });
        }

        private onSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID)
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onSuit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            clientCore.UIManager.releaseCoinBox();
        }
    }
}