namespace giftBag {
    /**
     * 18元充值礼包
     * giftBag.GiftBagModule
     */
    export class GiftBagModule extends ui.giftBag.GiftBagModuleUI {

        private readonly SUIT_ID: number = 2110452;
        private _waiting: boolean;

        init(): void {
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.updateView();
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onClick);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onClick(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnBuy:
                    if (this._waiting) return;
                    this._waiting = true;
                    clientCore.RechargeManager.pay(52)
                        .then((data) => {
                            alert.showReward(data.items);
                            this.updateView();
                        }).catch(() => {
                            this._waiting = false;
                        });
                    break;
                case this.btnClose:
                    this.destroy();
                    break;
                case this.btnTry:
                    alert.showCloth(this.SUIT_ID);
                    break;
            }
        }

        private updateView(): void {
            let has: boolean = clientCore.SuitsInfo.checkHaveSuits(this.SUIT_ID);
            this.btnBuy.visible = !has;
            this.imgBuy.visible = has;
        }
    }
}