namespace lostDream {

    export class BuyPanel extends ui.lostDream.panel.BuyPanelUI {
        private _model: LostDreamModel;
        private _ids: number[];
        private _id: number;
        private _index: number;
        constructor() { super(); }

        async show(sign: number, index: number): Promise<void> {
            clientCore.DialogMgr.ins.open(this);
            this._ids = [34, 35, 36, 37];
            this._model = clientCore.CManager.getModel(sign) as LostDreamModel;
            this.updateView(index);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        destroy(): void {
            this._ids.length = 0;
            this._ids = this._model = null;
            super.destroy();
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private updateView(index: number): void {
            this._id = this._ids[index];
            this._index = index;
            if (!this._id) {
                this.hide();
                return;
            }
            let cls: xls.commonBuy = xls.get(xls.commonBuy).get(this._id);
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cls.femaleAward[0] : cls.maleAward[0];
            let cost: xls.pair = cls.itemCost;
            //应获得
            this.ico.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            this.getFnt.value = reward.v2 + '';
            //消耗
            this.costIco.skin = clientCore.ItemsInfo.getItemIconUrl(cost.v1);
            this.costFnt.value = cost.v2 + '';
        }
        private onBuy(): void {
            let cls: xls.commonBuy = xls.get(xls.commonBuy).get(this._id);
            let has: number = clientCore.ItemsInfo.getItemNum(cls.itemCost.v1);
            if (has < cls.itemCost.v2) {
                alert.showFWords('材料不足~');
                return;
            }

            alert.showSmall(`是否花费${cls.itemCost.v2}${clientCore.ItemsInfo.getItemName(cls.itemCost.v1)}兑换？`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        net.sendAndWait(new pb.cs_common_buy({ activityId: 27 })).then((msg: pb.sc_common_buy) => {
                            alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                            let index: number = this._index + 1;
                            clientCore.MedalManager.setMedal([{ id: MedalDailyConst['LOST_DREAM_COPY_' + index], value: 1 }]);
                            this._model.buys[this._index].value = 1;
                            this.updateView(index);
                            EventManager.event(globalEvent.UPDATE_LOST_DREAM);
                        })
                    }]
                }
            })
        }
    }
}