
namespace library {
    /**
     * 神秘商人
     */
    export class ShopPanel extends ui.library.panel.ShopUI implements IPanel {

        private _rewards: number[];

        constructor() {
            super();

            this._rewards = xls.get(xls.rebuild).get(1).purchase;

            for (let i: number = 1; i <= 3; i++) {
                let data: xls.eventPurchase = xls.get(xls.eventPurchase).get(this._rewards[i - 1]);
                this["cost_" + i].skin = clientCore.ItemsInfo.getItemIconUrl(data.cost.v1);
                this["cost_num_" + i].changeText(data.cost.v2 + "");
                this.setLimit(i, data);
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
                this["item_" + i].skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
                this["item_num_" + i].changeText("x" + reward.v2);
                BC.addEvent(this, this["buy_" + i], Laya.Event.CLICK, this, this.onBuy, [i]);
            }
        }

        show(): void {

        }

        dispose(): void {
            this._rewards = null;
            BC.removeEvent(this);
        }

        private onBuy(index: number): void {
            let data: xls.eventPurchase = xls.get(xls.eventPurchase).get(this._rewards[index - 1]);
            let finishTime: number = LibraryModel.ins.giftTimes(index);
            if (data.limit.v1 != 0 && finishTime >= data.limit.v2) {
                alert.showFWords("购买次数已达上限~");
                return;
            }
            LibrarySCommand.ins.buyGift(data.id, Laya.Handler.create(this, () => {
                let reward: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleProperty : data.maleProperty;
                alert.showReward(clientCore.GoodsInfo.createArray(reward));
                if (data.limit.v1 != 0) {
                    LibraryModel.ins.setGiftTimes(index);
                    this.updateLimit(index, data);
                }
            }));
        }

        private updateLimit(index: number, data: xls.eventPurchase): void {
            let limit: ui.library.render.LimitItemUI = this["limit_" + index];
            let finishTime: number = LibraryModel.ins.giftTimes(index);
            let isOver: boolean = data.limit.v2 <= finishTime;
            // limit.txLimit.color = isOver ? "#FF0000" : "#734b25";
            limit.txLimit.changeText((data.limit.v2 - finishTime) + "");
            this["buy_" + index].disabled = isOver;
        }

        private setLimit(index: number, data: xls.eventPurchase): void {
            let limit: ui.library.render.LimitItemUI = this["limit_" + index];
            limit.visible = data.limit.v1 != 0; //0=无限购
            limit.visible && this.updateLimit(index, data);
        }

        public updateShop(): void {
            for (let i: number = 1; i <= 3; i++) {
                let data: xls.eventPurchase = xls.get(xls.eventPurchase).get(this._rewards[i - 1]);
                this.setLimit(i, data);
            }
        }
    }
}