namespace alert {
    export class BuyDetailsPanel extends ui.alert.BuyDetailsPanelUI {
        private _rewardArr: xls.pair[];
        private _rechargeID: number;
        private _handle: Laya.Handler;
        private _handleF: Laya.Handler;
        private _waiting: boolean;

        show(rechargeID: number, handle: Laya.Handler, handleF: Laya.Handler = null) {
            this.list.renderHandler = new Laya.Handler(this, this.showReward);
            this.list.mouseHandler = new Laya.Handler(this, this.onItemSelect);
            this.sideClose = true;
            this._handle = handle;
            this._handleF = handleF;
            this._rechargeID = rechargeID;
            let rechargeInfo: xls.rechargeShopOffical = xls.get(xls.rechargeShopOffical).get(this._rechargeID);
            this._rewardArr = clientCore.LocalInfo.sex == 1 ? rechargeInfo.rewardFamale : rechargeInfo.rewardMale;
            this.txtNeedNum.text = "￥" + rechargeInfo.cost;
            this.list.repeatX = this._rewardArr.length;
            this.list.array = this._rewardArr;
            if (this._rewardArr.length <= 3) this.imgBg.width = 460;
            else this.imgBg.width = 460 + (this._rewardArr.length - 3) * 100;
            clientCore.DialogMgr.ins.open(this);
        }
        private onItemSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.currentTarget, { id: this._rewardArr[index].v1 });
            }
        }
        private showReward(cell: ui.commonUI.item.RewardItemUI, index: number) {
            let info = this._rewardArr[index];
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.v1);
            cell.txtName.text = clientCore.ItemsInfo.getItemName(info.v1);
            cell.txtName.visible = true;
            cell.num.value = info.v2.toString();
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.v1);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuyClick);
        }

        private onBuyClick(e: Laya.Event) {
            if (this._waiting) return;
            this._waiting = true;
            clientCore.RechargeManager.pay(this._rechargeID).then((data) => {
                alert.showReward(data.items);
                this._handle.run();
                this._waiting = false;
                clientCore.DialogMgr.ins.close(this);
            }).catch(() => {
                this._handleF?.run();
                this._waiting = false;
            });
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            this._handleF?.recover();
            this._handle?.recover();
            this._handle = this._handleF = null;
            this._rewardArr = null;
            super.destroy();
        }
    }
}