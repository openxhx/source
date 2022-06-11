namespace fetterGift {

    export class BuyPanel extends ui.fetterGift.panel.BuyPanelUI {
        private _price: number;
        private _unit: number;//每组出售数量
        private _costId: number;
        private _uid: number;
        private _sendId: number;
        private _currentCnt: number;
        private _haveCnt: number;
        private _sendCom: Laya.Handler;
        private _simpleFetter: number;
        private _nick: string;
        constructor() {
            super();
            this.htmlTxt.style.fontSize = 25;
            this.htmlTxt.style.width = 501;
            this.htmlTxt.style.align = 'center';
            this.inputTxt.restrict = '0-9';
        }
        show(friendUid: number, nick: string, fetterAdd: number, fetterCnt: number, data: xls.shop, index: number, handler: Laya.Handler): void {
            this._sendCom = handler;
            this._uid = friendUid;
            this._unit = data.unitNum;
            this._sendId = data.itemId;
            this._haveCnt = clientCore.ItemsInfo.getItemNum(this._sendId);
            this._simpleFetter = fetterAdd;
            this._nick = nick;

            index == 4 ? this.imgIcon.pos(239, 195) : this.imgIcon.pos(253.5, 186);
            this.imgIcon.skin = `fetterGift/gift_${index + 1}.png`;
            this.htmlTxt.innerHTML = util.StringUtils.getColorText3(`确认要送礼物给{${nick}}嘛？`, '#805329', '#ff0000');
            this.txCurrent.changeText(fetterCnt + '');
            this.txHave.changeText(this._haveCnt + '');
            //每日限购
            this.txLimit.visible = data.dayLimit != 0;
            this.txLimit.visible && this.txLimit.changeText(`限购${data.dayLimit}次/天`);

            let sell: xls.pair = data.sell[0];
            this._costId = sell.v1;
            this._price = sell.v2;
            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(this._costId);
            this.updateCost(this._haveCnt > 0 ? 1 : data.unitNum);

            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.onSend);
            BC.addEvent(this, this.inputTxt, Laya.Event.BLUR, this, this.onChange);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onClick, [1]);
            BC.addEvent(this, this.btnReduce, Laya.Event.CLICK, this, this.onClick, [2]);
            BC.addEvent(this, this.btnMax, Laya.Event.CLICK, this, this.onClick, [3]);
            BC.addEvent(this, EventManager, globalEvent.FRIEND_INFO_CHANGE, this, this.onFetterChange);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._sendCom = null;
            super.destroy();
        }

        private updateCost(count: number): void {
            let d: number = count - this._haveCnt;
            if (d <= 0) {
                this._currentCnt = count;
                this.txCost.changeText('0');
            } else {
                let group: number = Math.ceil(d / this._unit);
                this._currentCnt = group * this._unit + this._haveCnt;
                this.txCost.changeText(this._price * group + '');
            }
            this.inputTxt.text = this._currentCnt + '';
            this.txAdd.changeText(this._currentCnt * this._simpleFetter + '');
            this.updateBtn();
        }

        private onClick(type: number): void {
            let current: number = Number(this.inputTxt.text);
            let max: number = Math.max(this._haveCnt > 0 ? 1 : this._unit, Math.floor(clientCore.ItemsInfo.getItemNum(this._costId) / this._price) * this._unit + this._haveCnt);
            switch (type) {
                case 1: //+
                    current = Math.min(current + this._unit, max);
                    break;
                case 2: //-
                    current = Math.max(this._haveCnt > 0 ? 1 : this._unit, this._haveCnt > 0 ? (current <= this._unit ? current - 1 : current - this._unit) : current - this._unit);
                    break;
                case 3: //max
                    current = max;
                    break;
            }
            this.updateCost(current);
        }


        private onSend(): void {
            let num: number = Number(this.inputTxt.text);
            if (num <= this._haveCnt) { //道具够直接送
                this.sendGift(num);
                return;
            }

            let needBuy: number = Math.ceil((num - this._haveCnt) / this._unit);
            let d: number = clientCore.ItemsInfo.getItemNum(this._costId) - needBuy * this._price;
            if (d < 0) {
                if (this._costId == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.alertQuickBuy(this._costId, -d, true);
                }
                return;
            }

            alert.showSmall(`是否花费 ${clientCore.ItemsInfo.getItemName(this._costId)}x${needBuy * this._price} 购买并赠送礼物？`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        net.sendAndWait(new pb.cs_shop_buy_item({ id: this._sendId, num: needBuy })).then(() => {
                            this.sendGift(num);
                        })
                    }]
                }
            })
        }

        private sendGift(num: number): void {
            net.sendAndWait(new pb.cs_friend_give_gift_item({ friendId: this._uid, itemId: this._sendId, itemNum: num })).then(() => {
                alert.showFWords(`赠礼成功,你和${this._nick}的羁绊值提升啦~`);
                this._haveCnt = clientCore.ItemsInfo.getItemNum(this._sendId);
                this.txHave.changeText(this._haveCnt + '');
                this.updateCost(parseInt(this.inputTxt.text));
                this._sendCom?.run();
            });
        }

        private onFetterChange(): void {
            this.txCurrent.changeText(clientCore.FriendManager.instance.getFriendInfoById(this._uid).friendShip + '');
        }

        private onChange(): void {
            let current: number = Number(this.inputTxt.text);
            if (this._currentCnt == current) return;
            let max: number = Math.max(this._haveCnt > 0 ? 1 : this._unit, Math.floor(clientCore.ItemsInfo.getItemNum(this._costId) / this._price) * this._unit + this._haveCnt);
            current = _.clamp(current, this._haveCnt > 0 ? 1 : this._unit, max);
            this.updateCost(current);
        }

        private updateBtn(): void {
            let current: number = Number(this.inputTxt.text);
            let min: number = this._haveCnt > 0 ? 1 : this._unit;
            let max: number = Math.max(this._haveCnt > 0 ? 1 : this._unit, Math.floor(clientCore.ItemsInfo.getItemNum(this._costId) / this._price) * this._unit + this._haveCnt);
            this.btnAdd.disabled = max == current;
            this.btnReduce.disabled = min == current;
        }
    }
}