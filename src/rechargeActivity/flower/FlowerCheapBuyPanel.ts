namespace rechargeActivity {
    export class FlowerCheapBuyPanel extends ui.rechargeActivity.flowerPanel.FlowerCheapBuyPanelUI {
        private _rewardArr: xls.pair[];
        private _rechargeID: number;
        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.showReward);
            this.list.mouseHandler = new Laya.Handler(this, this.onItemSelect);
            this.sideClose = true;
        }
        private onItemSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.currentTarget, { id: this._rewardArr[index].v1 });
            }
        }
        /**
         * 
         * @param rechargeID 
         * @param type 超值礼包传1，灵豆礼包传2
         */
        showInfo(rechargeID: number) {
            this._rechargeID = rechargeID;
            let rechargeInfo: xls.rechargeShopOffical = xls.get(xls.rechargeShopOffical).get(this._rechargeID);
            this._rewardArr = clientCore.LocalInfo.sex == 1 ? rechargeInfo.rewardFamale : rechargeInfo.rewardMale;
            this.txtNeedNum.text = "￥" + rechargeInfo.cost;
            this.list.repeatX = this._rewardArr.length;
            this.list.array = this._rewardArr;
            clientCore.DialogMgr.ins.open(this);
        }
        private showReward(cell: ui.commonUI.item.RewardItemUI, index: number) {
            let info = this._rewardArr[index];
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.v1);
            cell.txtName.text = clientCore.ItemsInfo.getItemName(info.v1);
            cell.txtName.visible = true;
            cell.num.value = info.v2.toString();
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.v1);
        }
        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuyClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }
        private onBuyClick(e: Laya.Event) {
            clientCore.RechargeManager.pay(this._rechargeID).then((data) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.items.concat(data.extItms)));
                this.event(Laya.Event.CHANGED, this._rechargeID);
                clientCore.DialogMgr.ins.close(this);
            });
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}