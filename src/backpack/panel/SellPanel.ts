namespace backpack.panel {
    /**
     * 售出面板
     */
    export class SellPanel extends ui.backpack.SellPanelUI {

        private _id: number;
        private _count: number;
        private _diffNum: number = 0;
        private _info: clientCore.MaterialBagInfo;

        constructor() { super() }

        onEnable(): void {
            this.scale(1, 1);
            Laya.Tween.from(this, { scaleX: 0, scaleY: 0 }, 300, Laya.Ease.backOut);
            this.addEventListeners();
            this.anchorX = 0.5;
        }

        onDisable(): void {
            this._info = null;
            this.removeEventListeners();
            Laya.Tween.clearAll(this);
        }

        setData(data?: clientCore.MaterialBagInfo): void {
            if (data) {
                this._info = data;
                this._id = data.goodsInfo.itemID;
                this.txName.changeText(data.xlsInfo.name);
                this.txDesc.changeText(data.xlsInfo.captions);
                this.goodsIco.skin = clientCore.ItemsInfo.getItemIconUrl(this._id);
                this._diffNum = 0;
                this._count = Math.ceil(data.goodsInfo.itemNum / 2);
                this.updatePrice();
            } else {
                this._id = 0;
            }
        }

        get id(): number {
            return this._id;
        }

        public hide(): void {
            this._id = 0;
            this.removeSelf();
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnAdd, Laya.Event.MOUSE_DOWN, this, this.onChange, ["add"]);
            BC.addEvent(this, this.btnReduce, Laya.Event.MOUSE_DOWN, this, this.onChange, ["reduce"]);
            BC.addEvent(this, this.btnAdd, Laya.Event.MOUSE_OUT, this, this.cancleAdd);
            BC.addEvent(this, this.btnReduce, Laya.Event.MOUSE_OUT, this, this.cancleAdd);
            BC.addEvent(this, Laya.stage, Laya.Event.MOUSE_UP, this, this.cancleAdd);
            BC.addEvent(this, this.btnSell, Laya.Event.CLICK, this, this.onSell);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
            Laya.timer.clearAll(this);
        }

        private onChange(type: string): void {
            this._diffNum = type == "add" ? 1 : - 1;
            this.updatePrice();
            Laya.timer.loop(100, this, this.updatePrice);
        }

        private cancleAdd() {
            Laya.timer.clearAll(this);
        }

        private updatePrice(): void {
            this._count += this._diffNum;
            this._count = _.clamp(this._count, 1, this._info.goodsInfo.itemNum)
            this.btnAdd.disabled = this._count >= this._info.goodsInfo.itemNum;
            this.btnReduce.disabled = this._count <= 1;
            this.txNum.changeText("x" + this._count);

            let allSheepUp:number = clientCore.ScienceTreeManager.ins.increment(13)/100 //科技点所有产品
            let speicalSheepUp:number= clientCore.ItemsInfo.isSpecial(this._info.goodsInfo.itemID) ? clientCore.ScienceTreeManager.ins.increment(4)/100 : 0;
            this.txPrice.changeText("" + Math.round(this._count * this._info.xlsInfo.sell*(1+allSheepUp+speicalSheepUp)));
            if (this.btnAdd.disabled || this.btnReduce.disabled) {
                this.cancleAdd();
            }
        }

        private onSell(): void {
            net.sendAndWait(new pb.cs_user_sell_item({ itemId: this._id, itemCnt: this._count })).then(
                (data: pb.sc_user_sell_item) => {
                    this.hide();
                    let goodsList: clientCore.GoodsInfo[] = [];
                    goodsList.push(new clientCore.GoodsInfo(data.itemId, data.itemCnt));
                    alert.showReward(goodsList);
                }
            ).catch(() => {
                this.hide();
            });
        }
    }
}