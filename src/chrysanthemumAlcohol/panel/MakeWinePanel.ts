namespace chrysanthemumAlcohol {
    export interface MakeWineItemInfo {
        item: any;
        itemId: number;
        num: number;
    }
    export class MakeWinePanel extends ui.chrysanthemumAlcohol.panel.MakeWinePanelUI {
        private _sign: number;
        private isUseItem: boolean = false;     //是否使用额外道具
        private _isUse: boolean = false;        //是否正在使用

        private needDataList: MakeWineItemInfo[];   //需要道具数据

        private _model: ChrysanthemumAlcoholModel;
        private _control: ChrysanthemumAlcoholControl;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(data: any = null) {
            this._model = clientCore.CManager.getModel(this._sign) as ChrysanthemumAlcoholModel;
            this._control = clientCore.CManager.getControl(this._sign) as ChrysanthemumAlcoholControl;
            
            this._isUse = false;
            this.needDataList = [
                { item: this.item1, itemId: this._model.itemId1, num: 50 },
                { item: this.item2, itemId: this._model.itemId2, num: 30 },
                { item: this.item3, itemId: this._model.itemId3, num: 30 },
                { item: this.item4, itemId: this._model.itemId4, num: 5 }];

            for (let i = 0; i < this.needDataList.length; i++) {
                let obj = this.needDataList[i];
                clientCore.GlobalConfig.setRewardUI(obj.item, { id: obj.itemId, cnt: obj.num, showName: true });
            }

            this.updateView();
            this.onNotuseItem();

            // this._notEnoughPanel = new NotEnoughPanel();

            clientCore.UIManager.setMoneyIds([this._model.itemId1, this._model.itemId2, this._model.itemId3, this._model.itemId4]);
            clientCore.UIManager.showCoinBox();
        }

        private updateView(): void {
            for (let i = 0; i < this.needDataList.length; i++) {
                let obj = this.needDataList[i];
                obj.item.num.value = util.StringUtils.parseNumFontValue(clientCore.ItemsInfo.getItemNum(obj.itemId), obj.num);
            }
        }

        /** 交付*/
        private onUse() {
            if (this._isUse) {
                return;
            }
            let itemId = this.isUseItem ? this._model.tokenId3 : this._model.tokenId2;
            let arr = this.isUseItem ? this.needDataList : this.needDataList.slice(0, 3);
            if (this.checkItemEnough(arr)) {
                this._isUse = true;
                this._control.mergeFlower(itemId, Laya.Handler.create(this, (msg: pb.sc_gloden_chrysanthemum_get_free) => {
                    clientCore.DialogMgr.ins.close(this);
                    this.event("ON_UPDATE_MAKEWINE", msg.itms);
                }));
            } else {
                alert.showFWords("材料不足");
            }
        }

        private checkItemEnough(arr: MakeWineItemInfo[]): boolean {
            for (let i = 0; i < arr.length; i++) {
                if (!clientCore.ItemsInfo.checkItemsEnough([new clientCore.GoodsInfo(arr[i].itemId, arr[i].num)])) {
                    return false;
                }
            }
            return true;
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
            this.event("ON_CLOSE_MAKEWINE");
        }

        private onNotuseItem(): void {
            this.isUseItem = true;
            this.btnNotuseItem.visible = false;
            this.btnUseItem.visible = true;
        }

        private onUseItem(): void {
            this.isUseItem = false;
            this.btnNotuseItem.visible = true;
            this.btnUseItem.visible = false;
        }

        private onClickItem1(): void {
            clientCore.ToolTip.showTips(this.item1, { id: this._model.itemId1 });
        }

        private onClickItem2(): void {
            clientCore.ToolTip.showTips(this.item2, { id: this._model.itemId2 });
        }

        private onClickItem3(): void {
            clientCore.ToolTip.showTips(this.item3, { id: this._model.itemId3 });
        }

        private onClickItem4(): void {
            clientCore.ToolTip.showTips(this.item4, { id: this._model.itemId4 });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnUse, Laya.Event.CLICK, this, this.onUse);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnNotuseItem, Laya.Event.CLICK, this, this.onNotuseItem);
            BC.addEvent(this, this.btnUseItem, Laya.Event.CLICK, this, this.onUseItem);
            BC.addEvent(this, this.item1, Laya.Event.CLICK, this, this.onClickItem1);
            BC.addEvent(this, this.item2, Laya.Event.CLICK, this, this.onClickItem2);
            BC.addEvent(this, this.item3, Laya.Event.CLICK, this, this.onClickItem3);
            BC.addEvent(this, this.item4, Laya.Event.CLICK, this, this.onClickItem4);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.needDataList = [];
            this._model = this._control = null;
            super.destroy();
        }
    }
}