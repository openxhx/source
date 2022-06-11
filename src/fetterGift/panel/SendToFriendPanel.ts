namespace fetterGift {
    export class SendToFriendPanel extends ui.fetterGift.panel.SendToFriendPanelUI {
        private _uid: number;
        private _selectId: number;
        private _nowNum: number;
        private _haveSendNum: number;
        private _maxCanSend: number;

        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.list.dataSource = xls.get(xls.globaltest).get(1).friendDonate;
            this._selectId = this.list.array[1];
            this._nowNum = 1;

            this.txtname.style.width = 451;
            this.txtname.style.align = 'center';
            this.txtname.style.fontSize = 25
            this.txtname.style.font = '汉仪中圆简';
            this._maxCanSend = xls.get(xls.globaltest).get(1).friendDonateLimit;
        }

        show(uid: number, haveSendNum: number) {
            this._uid = uid;
            this._haveSendNum = haveSendNum;
            this.updateView();
            clientCore.DialogMgr.ins.open(this);
            let name = clientCore.FriendManager.instance.getFriendInfoById(uid)?.userBaseInfo?.nick ?? '';
            this.txtname.innerHTML = util.StringUtils.getColorText3(`是否确认向{${name}}赠送道具？`, '#805329', '#fb7c82')
        }

        private onListRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let id = cell.dataSource as number;
            let cnt = clientCore.ItemsInfo.getItemNum(id);
            clientCore.GlobalConfig.setRewardUI(cell, { id: id, cnt: cnt, showName: false });
            cell.num.visible = true;
            cell.num.value = cnt.toString();
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let id = this.list.getItem(idx);
                if (id != this._selectId) {
                    this._selectId = id;
                    this.updateView();
                }
            }
        }

        updateView() {
            let min = 1;
            let max = this._maxCanSend - this._haveSendNum; 
            this._nowNum = _.clamp(this._nowNum, min, max);
            this.txtNum.text = this._nowNum.toString();
            this.btnSub.disabled = this._nowNum == min;
            this.btnMax.disabled = this.btnAdd.disabled = this._nowNum == max;
            this.list.startIndex = this.list.startIndex;
            this.txtName.text = clientCore.ItemsInfo.getItemName(this._selectId);
            this.txtToday.text = `今日已赠送：${this._haveSendNum}/${this._maxCanSend}`
            clientCore.GlobalConfig.setRewardUI(this.itemSelect, { id: this._selectId, cnt: clientCore.ItemsInfo.getItemNum(this._selectId), showName: false });
        }

        private onSend() {
            if (clientCore.ItemsInfo.getItemNum(this._selectId) < this._nowNum) {
                alert.showFWords('物品不足')
                return;
            }
            net.sendAndWait(new pb.cs_send_gift_to_friend({ uid: this._uid, itemId: this._selectId, itemNum: this._nowNum })).then(() => {
                alert.showFWords('赠送成功~');
                this._haveSendNum += this._nowNum;
                if (this._haveSendNum >= this._maxCanSend) {
                    this.onClose();
                }
                else {
                    this.updateView();
                }
            })
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private changeNum(diff: number) {
            this._nowNum += diff;
            this.updateView();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSub, Laya.Event.CLICK, this, this.changeNum, [-1]);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.changeNum, [1]);
            BC.addEvent(this, this.btnMax, Laya.Event.CLICK, this, this.changeNum, [999999]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.onSend);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.updateView);
        }
    }
}