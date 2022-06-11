namespace oneLeafAutumn {
    export class CheapBuyPanel extends ui.oneLeafAutumn.panel.CheapBuyPanelUI {
        private _rewardArr: xls.pair[];
        private _rechargeID: number;
        constructor() {
            super();
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
        showInfo(rechargeID: number) {
            this._rechargeID = rechargeID;
            let rechargeInfo = xls.get(xls.rechargeShopOffical).get(this._rechargeID);
            this._rewardArr = clientCore.LocalInfo.sex == 1 ? rechargeInfo.rewardFamale : rechargeInfo.rewardMale;
            this.list.array = this._rewardArr;
            this.txtNeedNum.text = "￥" + rechargeInfo.cost;
            // this.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(xls.get(xls.giftSell).get(1).dayDiscountsCost.v1);
            // this.txtNeedNum.text = "x" + xls.get(xls.giftSell).get(1).dayDiscountsCost.v2;
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
            clientCore.RechargeManager.pay(this._rechargeID).then((data) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.items.concat(data.extItms)));
                let index = 0;
                if (this._rechargeID == 21) {
                    clientCore.MedalManager.setMedal([{ id: MedalDailyConst.GOD_TOWER_BUY_6_430, value: 1 }]);
                }
                else if (this._rechargeID == 22) {
                    index = 1;
                    clientCore.MedalManager.setMedal([{ id: MedalDailyConst.GOD_TOWER_BUY_68_430, value: 1 }]);
                }
                this.event("CHEAP_PACKAGE_BUY_SUCC", index);
                clientCore.DialogMgr.ins.close(this);
            });
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
        }
    }
}