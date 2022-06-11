namespace bigCharge {
    export class ShopCarPanel extends ui.bigCharge.panel.ShopCartPanelUI {
        private selectId: number[];
        constructor() {
            super();
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListClick);
        }

        public show() {
            this.list.dataSource = BigChargeModel.instance.buyCarInfo;
            if (!this.selectId || this.selectId.length == 0) {
                this.selectId = BigChargeModel.instance.buyCarInfo.slice();
            }
            clientCore.DialogMgr.ins.open(this);
            this.refreshView();
        }

        private onListRender(cell: ui.bigCharge.render.ShopCarItemUI, idx: number) {
            let id = cell.dataSource as number;
            let config = xls.get(xls.eventExchange).get(id);
            let item: number = clientCore.LocalInfo.sex == 1 ? config.femaleProperty[0].v1 : config.maleProperty[0].v1;
            let price: number = config.cost[0].v2;
            cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(item);
            cell.txtName.text = clientCore.ClothData.getCloth(item)?.name;
            cell.imgSelect.visible = this.selectId.indexOf(id) > -1;
            cell.labPrice.text = price.toString();
        }

        private onListClick(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == "btnSelect") {
                let id = this.list.getItem(idx);
                if (this.selectId.indexOf(id) == -1)
                    this.selectId.push(id);
                else
                    _.pull(this.selectId, id);
                this.list.startIndex = this.list.startIndex;
                this.refreshView();
            }
        }

        private refreshView() {
            this.imgAll.visible = this.selectId.length == BigChargeModel.instance.buyCarInfo.length && this.selectId.length != 0;
            this.setPrice();
        }

        /**计算购物车价格 */
        private setPrice() {
            let price = 0;
            for (let i: number = 0; i < this.selectId.length; i++) {
                price += xls.get(xls.eventExchange).get(this.selectId[i]).cost[0].v2;
            }
            this.labPrice.text = price.toString();
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onAll() {
            if (this.imgAll.visible)
                this.selectId = [];
            else
                this.selectId = BigChargeModel.instance.buyCarInfo.slice();
            this.list.refresh();
            this.refreshView();
        }
        private waiting: boolean = false;
        private async onBuy() {
            if (this.waiting) return;
            let has: number = clientCore.ItemsInfo.getItemNum(BigChargeModel.instance.coinid);
            let diff: number = Number(this.labPrice.text) - has;
            if (diff > 0) {
                alert.showFWords(clientCore.ItemsInfo.getItemName(BigChargeModel.instance.coinid)+"不足~");
                return;
            }
            if (BigChargeModel.instance.buyCarInfo.length > this.selectId.length) {
                alert.showSmall("购物车中有未选中商品，是否确认结算？", {
                    callBack: {
                        caller: this, funArr: [this.judgeBuy]
                    }
                })
            } else {
                this.judgeBuy();
            }
        }

        private async judgeBuy() {
            if (this.selectId.length > 0) {
                this.waiting = true;
                let buyOk = await this.buy();
                if (!buyOk) {
                    this.waiting = false;
                    return;
                }
            }
            BigChargeModel.instance.coinCost(Number(this.labPrice.text));
            _.pullAll(BigChargeModel.instance.buyCarInfo, this.selectId);
            this.selectId = [];
            this.list.refresh();
            this.refreshView();
            this.waiting = false;
        }

        private buy() {
            return net.sendAndWait(new pb.cs_summer_recharge_pack_buy({ stage:1, idList: this.selectId })).then((data: pb.sc_summer_recharge_pack_buy) => {
                alert.showReward(data.items);
                return Promise.resolve(true);
            })
        }

        private onClearAll() {
            BigChargeModel.instance.buyCarInfo = this.selectId = [];
            this.list.dataSource = []
            this.refreshView();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnBuyAll, Laya.Event.CLICK, this, this.onAll);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnRemoveAll, Laya.Event.CLICK, this, this.onClearAll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}