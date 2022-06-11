namespace bigCharge {

    const PRICE: number[] = [
        390,
        340,
        200
    ];
    const EXCHANGE_ID: number[] = [
        2748,
        2747,
        2749
    ];
    const CLOTHS: number[][] = [
        [2100297],
        [2110439],
        [1000132, 1100093]
    ]
    /**
     * 夏夜蛙语
     */
    export class BagOffBuyPanel extends ui.bigCharge.panel.BagOffBuyPanelUI {
        ruleId: number = 1184;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.labPrice.text = '0';
            for (let i: number = 1; i <= 3; i++) {
                this['labPrice' + i].text = '' + PRICE[i - 1];
                this['imgGot' + i].visible = clientCore.ItemsInfo.checkHaveItem(CLOTHS[i - 1][0]);
                this['imgGou' + i].alpha = this['imgGot' + i].visible ? 1 : 0;
            }
            this.addEvents();
        }

        show(): void {
            clientCore.Logger.sendLog('2021年7月23日活动', '【付费】夏日终曲第四期', '打开夏夜蛙语面板');
            clientCore.UIManager.setMoneyIds([BigChargeModel.instance.coinid]);
            clientCore.UIManager.showCoinBox();
        }

        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        private updataUI() {
            for (let i: number = 1; i <= 3; i++) {
                this['imgGot' + i].visible = clientCore.ItemsInfo.checkHaveItem(CLOTHS[i - 1][0]);
                this['imgGou' + i].alpha = this['imgGot' + i].visible ? 1 : 0;
            }
        }

        /**打开五菱起舞 */
        private openOther() {
            EventManager.event('BIG_CHARGE_SHOW_EVENT_PANEL', panelType.vipBagBuy);
        }

        /**打开云霄梦境 */
        private openOther1() {
            EventManager.event('BIG_CHARGE_SHOW_EVENT_PANEL', panelType.doubleVipBagBuy);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        destroy(): void {
            this.removeEvents();
        }
        private addEvents(): void {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry, [0]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTry, [1]);
            BC.addEvent(this, this.btnTryStage, Laya.Event.CLICK, this, this.onTry, [3]);
            BC.addEvent(this, this.btnTryBg, Laya.Event.CLICK, this, this.onTry, [2]);
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
            BC.addEvent(this, this.btnOther1, Laya.Event.CLICK, this, this.openOther1);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this['imgGou' + i], Laya.Event.CLICK, this, this.select, [i]);
            }
        }
        private removeEvents(): void {
            BC.removeEvent(this);
        }

        private select(idx: number) {
            if (this['imgGot' + idx].visible) return;
            this['imgGou' + idx].alpha = 1 - this['imgGou' + idx].alpha;
            this.calcuatePrice();
        }

        /** 计算价格*/
        private calcuatePrice(): void {
            let hasIds: number[] = [];
            let buyIds: number[] = [];
            for (let i: number = 1; i <= 3; i++) {
                if (this['imgGot' + i].visible) hasIds.push(i - 1);
                else if (this['imgGou' + i].alpha == 1) buyIds.push(i - 1);
            }
            let all: number = buyIds.length + hasIds.length;
            let disc: number = [1, 0.7, 0.65][all - 1];
            let hasDisc: number = [1, 0.7, 0.65][hasIds.length - 1];
            let buyPrice: number = 0;
            let hasPrice: number = 0;
            _.forEach(_.concat(buyIds, hasIds), (element: number) => { buyPrice += PRICE[element] * disc; });
            _.forEach(hasIds, (element: number) => { hasPrice += PRICE[element] * hasDisc; });
            this.labPrice.text = (`${Math.round(buyPrice - hasPrice)}`);
        }

        private onBuy(): void {
            let buyIds: number[] = [];
            for (let i: number = 1; i <= 3; i++) {
                if (this['imgGou' + i].alpha == 1 && !this['imgGot' + i].visible) buyIds.push(EXCHANGE_ID[i - 1]);
            }
            if (buyIds.length <= 0) return;
            let coin = BigChargeModel.instance.coinid;
            let price = parseInt(this.labPrice.text);
            let have = clientCore.ItemsInfo.getItemNum(coin);
            if (have < price) {
                if (coin == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(coin)}不足,是否前往补充?`, { callBack: { funArr: [BigChargeModel.instance.coinNotEnough], caller: this } });
                }
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(coin)}购买所选商品?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        net.sendAndWait(new pb.cs_summer_recharge_buy({ stage: 4, idxs: buyIds })).then((msg: pb.sc_summer_recharge_buy) => {
                            alert.showReward(msg.items);
                            this.updataUI();
                            this.labPrice.text = '0';
                            BigChargeModel.instance.coinCost(price);
                        });
                    }]
                }
            })
        }
        private onTry(idx: number): void {
            switch (idx) {
                case 0:
                case 1:
                    alert.showCloth(CLOTHS[idx][0]);
                    break;
                case 2:
                case 3:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: CLOTHS[2][idx - 2] });
                    break;
            }
        }
    }
}