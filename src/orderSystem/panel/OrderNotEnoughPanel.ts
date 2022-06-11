namespace orderSystem {
    export class OrderNotEnoughPanel extends ui.orderSystem.panel.notEnoughPanelUI {
        public okHandler: laya.utils.Handler;

        private _count: number;

        constructor() {
            super();
            this.itemList.itemRender = OrderLackItemRender;
        }

        public set data(data: pb.IOrder) {
            let list: laya.ui.List = this.itemList;
            let count: number = 0;
            list.array = data.orderItemInfo.filter((v) => {
                return v.needItemTotalCnt > clientCore.ItemsInfo.getItemNum(v.needCollectItemId);
            });
            for (let i: number = 0; i < data.orderItemInfo.length; i++) {
                let haveNum = clientCore.ItemsInfo.getItemNum(data.orderItemInfo[i].needCollectItemId);
                if (data.orderItemInfo[i].needItemTotalCnt > haveNum) {
                    count += (data.orderItemInfo[i].needItemTotalCnt - haveNum) * xls.get(xls.materialBag).get(data.orderItemInfo[i].needCollectItemId).buy;
                }
            }
            this._count = count;
            this.num.text = "x" + count.toString();
            this.itemList.repeatX = list.array.length;
        }

        public onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        public onOk(e: Laya.Event) {
            alert.useLeaf(this._count, this.okHandler);
            this.onClose();
        }

        public addEventListeners() {
            this.btnClose.on(Laya.Event.CLICK, this, this.onClose);
            this.btnOk.on(Laya.Event.CLICK, this, this.onOk);
        }

        public removeEventListeners() {
            this.btnClose.offAll();
            this.btnOk.offAll();
        }

        public destory() {
            this.itemList.destroy();
        }
    }
}