namespace recycleCoin {
    /**
     * 代币回收模块
     * 需要传参，参数为recycle表中唯一id
     */
    export class RecycleCoinModule1 extends ui.recycleCoin.RecycleCoinModule1UI {
        constructor() {
            super();
            this.sideClose = false;
        }

        init(id: number) {
            super.init(id);
            this.addPreLoad(xls.load(xls.recycle));
            this.bg.skin = "res/bigPic/bg1.png"
        }

        onPreloadOver() {
            const data: xls.recycle = xls.get(xls.recycle).get(this._data);
            this.num0.text = clientCore.ItemsInfo.getItemNum(data.oldItemId[0]).toString();
            this.recycleCoin();
        }

        private recycleCoin() {
            net.sendAndWait(new pb.cs_item_callback({ type: this._data })).then((msg: pb.sc_item_callback) => {
                if (msg.item.length > 0) {
                    this.num1.text = msg.item[0].cnt.toString();
                } else {
                    this.num1.text = "0";
                }
            }).catch(this.destroy);
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