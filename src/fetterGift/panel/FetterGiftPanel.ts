namespace fetterGift {
    /**
     * 羁绊送礼
     */
    export class FetterGiftPanel extends ui.fetterGift.panel.FetterGiftPanelUI {
        private _map: Map<number, xls.shop>;
        private _friendInfo: pb.Ifriend_t;
        private _buyPanel: BuyPanel;
        constructor() {
            super();
            this._map = new Map();
            //显示礼物
            let array: xls.itemBag[] = xls.get(xls.itemBag).getValues();
            array = _.filter(array, (element) => { return element.kind == 33; });
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) { this.showGift(i < len - 1 ? this['view_' + (i + 1)] : this, array[i], i); }
        }
        show(uid: number) {
            clientCore.DialogMgr.ins.open(this);
            this._friendInfo = clientCore.FriendManager.instance.getFriendInfoById(uid);
            //基础信息
            this.htmlTxt.style.fontSize = 25;
            this.htmlTxt.style.width = 616;
            this.htmlTxt.style.align = 'center';
            this.htmlTxt.innerHTML = util.StringUtils.getColorText3(`给{${this._friendInfo.userBaseInfo.nick}}赠送礼物提供羁绊值！}`, '#805329', '#ff0000');
            this.txCurrent.changeText(`当前羁绊：${this._friendInfo.friendShip}`);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, EventManager, globalEvent.FRIEND_INFO_CHANGE, this, this.onFetterChange);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._map?.clear();
            this._buyPanel?.hide();
            this._buyPanel = this._map = this._friendInfo = null;
            super.destroy();
        }

        private showGift(item: FetterGiftPanel | ui.fetterGift.item.GiftItemUI, data: xls.itemBag, index: number): void {
            item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.itemId);
            item.txHave.changeText(clientCore.ItemsInfo.getItemNum(data.itemId) + '');
            item.txFetter.changeText('+' + data.value);
            //获得售卖价格
            let cls: xls.shop = this._map.get(data.itemId);
            if (!cls) {
                let array: xls.shop[] = xls.get(xls.shop).getValues();
                array = _.filter(array, (element) => { return element.itemId == data.itemId; });
                if (array.length <= 0) {
                    item.btnGift.visible = false;
                    console.error(`shop表里似乎并不存在itemId为${data.itemId}的信息~`);
                    return;
                }
                cls = array[0];
                this._map.set(data.itemId, cls);
            }
            let sell: xls.pair = cls.sell[0];
            item.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(sell.v1);
            item.txCost.changeText(sell.v2 + '');
            item.imgIcon.skin = `fetterGift/gift_${index + 1}.png`;
            BC.addEvent(this, item.btnGift, Laya.Event.CLICK, this, this.onGift, [cls, data.value, item, index]);
        }

        private onGift(data: xls.shop, fetterAdd: number, target: FetterGiftPanel | ui.fetterGift.item.GiftItemUI, index: number): void {
            this._buyPanel = this._buyPanel || new BuyPanel();
            this._buyPanel.show(this._friendInfo.friendUid, this._friendInfo.userBaseInfo.nick, fetterAdd, this._friendInfo.friendShip, data, index, new Laya.Handler(this, () => {
                target?.txHave.changeText(clientCore.ItemsInfo.getItemNum(data.itemId) + '');
            }));
        }

        private onFetterChange(): void {
            this.txCurrent.changeText(`当前羁绊：${this._friendInfo.friendShip}`);
        }
    }
}