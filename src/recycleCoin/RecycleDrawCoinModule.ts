namespace recycleCoin {
    /**
     * 代币回收模块
     * 需要传参，参数为recycle表中唯一id
     */
    export class RecycleDrawCoinModule extends ui.recycleCoin.RecycleDrawCoinModuleUI {
        constructor() {
            super();
            this.sideClose = false;
        }

        init(id: number) {
            super.init(id);
            this.addPreLoad(xls.load(xls.recycle));
            this.listOld.renderHandler = new Laya.Handler(this, this.itemRender);
            this.listOld.mouseHandler = new Laya.Handler(this, this.itemClick, ["old"]);
            this.listNew.renderHandler = new Laya.Handler(this, this.itemRender);
            this.listNew.mouseHandler = new Laya.Handler(this, this.itemClick, ["new"]);
        }

        onPreloadOver() {
            const data: xls.recycle = xls.get(xls.recycle).get(this._data);
            this.labTip.text = data.description;
            let old: pb.Item[] = [];
            for (let i = 0; i < data.oldItemId.length; i++) {
                old.push({ id: data.oldItemId[i], cnt: clientCore.ItemsInfo.getItemNum(data.oldItemId[i]) });
            }
            this.listOld.array = old;
            this.labRule.text = `${data.exchangeProportion.v1}个${clientCore.ItemsInfo.getItemName(data.oldItemId[0])}或${clientCore.ItemsInfo.getItemName(data.oldItemId[1])}=${data.exchangeProportion.v2}个${clientCore.ItemsInfo.getItemName(data.newItemId)}`;
            this.recycleCoin();
        }

        private recycleCoin() {
            net.sendAndWait(new pb.cs_item_callback({ type: this._data })).then((msg: pb.sc_item_callback) => {
                if (msg.item.length > 0) {
                    this.listNew.array = msg.item;
                } else {
                    const data: xls.recycle = xls.get(xls.recycle).get(this._data);
                    this.listNew.array = [{ id: data.newItemId, cnt: 0 }];
                }
            }).catch(this.destroy);
        }

        private itemRender(item: ui.commonUI.item.RewardItemUI) {
            let coin: pb.Item = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: coin.id, cnt: coin.cnt, showName: false });
            item.num.visible = true;
        }

        private itemClick(type: string, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let item: Laya.Sprite = type == "old" ? this.listOld.getCell(index) : this.listNew.getCell(index);
                let id: number = type == "old" ? this.listOld.getItem(index).id : this.listNew.getItem(index).id;
                clientCore.ToolTip.showTips(item, { id: id });
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}