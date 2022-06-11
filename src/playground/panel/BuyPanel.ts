namespace playground {
    /**
     * 购买骰子
     */
    export class BuyPanel extends ui.playground.panel.BuyPanelUI {
        constructor() {
            super();
            let cls: xls.gardenCommonData = xls.get(xls.gardenCommonData).get(1);
            //普通骰子
            this.buy_1.imgCommodity.skin = 'playground/nomal.png';
            this.buy_1.numTxt.changeText('x' + cls.commonDicePrice.v1);
            this.buy_1.costTxt.changeText('' + cls.commonDicePrice.v3);
            this.buy_1.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(cls.commonDicePrice.v2);
            //遥控骰子
            this.buy_2.imgCommodity.skin = 'playground/special_dise.png';
            this.buy_2.costTxt.changeText('' + cls.specialDicePrice.v3);
            this.buy_2.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(cls.specialDicePrice.v2);
        }
        show(): void {
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.buy_1, Laya.Event.CLICK, this, this.onBuy, [1]);
            BC.addEvent(this, this.buy_2, Laya.Event.CLICK, this, this.onBuy, [2]);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            super.destroy();
        }
        private onBuy(type: number): void {
            alert.alertQuickBuy3([1540006, 1540007][type - 1], 1, new Laya.Handler(this, (id: number, cnt: number) => {
                if (id == clientCore.MoneyManager.LEAF_MONEY_ID) {
                    alert.alertQuickBuy3(id, cnt, new Laya.Handler(this, () => { alert.showFWords('当前灵豆数量不足，可点击右上角购买灵豆~'); }))
                }
                else if (id == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showFWords('当前灵豆数量不足，可点击右上角购买灵豆~');
                }
            }))
        }
    }
}