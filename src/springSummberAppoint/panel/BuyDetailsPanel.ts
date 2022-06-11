namespace springSummberAppoint {
    export class BuyDetailsPanel extends ui.springSummberAppoint.panel.BuyDetailsPanelUI {
        private _rewardArr: xls.pair[];
        private _rechargeID: number;
        constructor() {
            super();
            this.init(null);
        }

        init(d: any) {
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
         */
        showInfo(rechargeID: number) {
            this._rechargeID = rechargeID;
            let rechargeInfo = clientCore.RechargeManager.getShopInfo(this._rechargeID);
            this._rewardArr = clientCore.LocalInfo.sex == 1 ? rechargeInfo.rewardFamale : rechargeInfo.rewardMale;
            this.txtNeedNum.text = "￥" + rechargeInfo.cost;
            this.list.repeatX = this._rewardArr.length;
            this.list.array = this._rewardArr;
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
            EventManager.event("GIFT_BUY", this._rechargeID);
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}