namespace market {
    /**
     * 春花秋月
     */
    export class MoonPanel extends ui.market.panel.MoonPanelUI {
        private readonly CLOTH_1: number = 2100198;//萌兔彩蛋
        private readonly CLOTH_2: number = 2100197;//傀儡兔
        private readonly PRICE_1: number = 420;    //萌兔彩蛋价格
        private readonly PRICE_2: number = 390;    //傀儡兔价格

        private _control: MarketControl;
        private _status: number;
        private _handId: number;
        constructor(sign: number) {
            super();
            this.addEventListeners();
            this.sign = sign;
            let sex: number = clientCore.LocalInfo.sex;
            this._control = clientCore.CManager.getControl(sign) as MarketControl;
            this._handId = sex == 1 ? 115785 : 115795;
            for (let i: number = 1; i <= 2; i++) {
                let reward: ui.market.item.BuyItemUI = this['buy_' + i];
                let price: number = this['PRICE_' + i];
                reward.imgDiscont.skin = `market/price${price - 150}.png`;
                reward.imgPrice.skin = `market/price${price}.png`;
                reward.txtPrice.text = `原价：${price}`;
                this['cloth_1_' + i].visible = this['cloth_2_' + i].visible = sex == i;
            }
            this.imgHand.skin = clientCore.ItemsInfo.getItemIconUrl(this._handId);
        }

        async init(): Promise<void> {
            this._status = 0;
            this._status = util.setBit(this._status, 1, clientCore.SuitsInfo.getSuitInfo(this.CLOTH_1).allGet ? 1 : 0);
            this._status = util.setBit(this._status, 2, clientCore.SuitsInfo.getSuitInfo(this.CLOTH_2).allGet ? 1 : 0);
            this.updateStatus();
            clientCore.Logger.sendLog('2020年6月19日活动', '【付费】童话漫游物语', '打开第三期面板');
        }

        addEventListeners(): void {
            for (let i: number = 1; i <= 2; i++) {
                BC.addEvent(this, this['buy_' + i], Laya.Event.CLICK, this, this.onBuy, [i]);
                BC.addEvent(this, this['btnTry' + i], Laya.Event.CLICK, this, this.onTry, [i]);
            }
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onHand);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._control = null;
            super.destroy();
        }

        private onBuy(flag: number): void {
            let id: number = this['CLOTH_' + flag];
            let isBuy: boolean = util.getBit(this._status, flag == 1 ? 2 : 1) == 1;
            let price: number = this['PRICE_' + flag] - (isBuy ? 150 : 0);
            alert.showSmall(`是否花费${price}灵豆购买服装？`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (!clientCore.MoneyManager.checkSpirit(price)) return;
                        this._control.buyMoon(flag, new Laya.Handler(this, () => {
                            let info: { clothes: number[] } = clientCore.SuitsInfo.getSuitInfo(id);
                            let array: clientCore.GoodsInfo[] = [];
                            _.forEach(info.clothes, (ele) => { array.push(new clientCore.GoodsInfo(ele, 1)); });
                            alert.showReward(array);
                            //更新状态
                            this._status = util.setBit(this._status, flag, 1);
                            this.updateStatus();
                        }));
                    }]
                }
            })
        }

        /**
         * 试穿
         * @param flag 
         */
        private onTry(flag: number): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this['CLOTH_' + flag]);
        }

        /** 改变购买状态*/
        private updateStatus(): void {
            for (let i: number = 1; i < 3; i++) {
                let flag: number = i;
                let isBuy: boolean = util.getBit(this._status, flag) == 1;
                let reward: ui.market.item.BuyItemUI = this['buy_' + i];
                this['hasBuy_' + i].visible = isBuy;
                reward.visible = !isBuy;
                //另一套买了，显示打折
                let otherBuyed = util.getBit(this._status, 3 - flag) == 1;
                reward.boxDiscount.visible = reward.imgDiscont.visible = otherBuyed;
                reward.imgPrice.visible = !otherBuyed;
            }
            //更新领取按钮状态
            this.updateGet();
        }

        /** 领取手持*/
        private onHand(): void {
            let has: boolean = clientCore.ItemsInfo.getItemNum(this._handId) > 0;
            if (has) {
                alert.showFWords('已经领取了~');
                return;
            }
            if (util.getBit(this._status, 1) == 0 || util.getBit(this._status, 2) == 0) {
                alert.showFWords('需拥有两套服装后才可领取~');
                return;
            }
            this._control.getReward(new Laya.Handler(this, this.updateGet));
        }

        /** 更新领取状态*/
        private updateGet(): void {
            let has: boolean = clientCore.ItemsInfo.getItemNum(this._handId) > 0;
            let allBuy: boolean = util.getBit(this._status, 1) == 1 && util.getBit(this._status, 2) == 1;
            this.imgDesc.visible = !allBuy;
            this.btnGet.visible = allBuy;
            if (has) {
                this.btnGet.fontSkin = 'commonBtn/l_p_alr_get.png';
                this.btnGet.disabled = true;
                this.btnGet.fontX = 30;
            }
        }
    }
}