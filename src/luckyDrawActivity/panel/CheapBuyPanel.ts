namespace luckyDrawActivity {
    export class CheapBuyPanel extends ui.luckyDrawActivity.panel.CheapBuyPanelUI {
        private _rewardArr: xls.pair[];
        private _rechargeID: number;
        private _type: number;
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
        /**
         * 
         * @param rechargeID 
         * @param type 超值礼包传1，灵豆礼包传2
         */
        showInfo(rechargeID: number, type: number) {
            this._type = type;
            this._rechargeID = rechargeID;
            if (type == 1) {
                let rechargeInfo: xls.rechargeShopOffical = xls.get(xls.rechargeShopOffical).get(this._rechargeID);
                this._rewardArr = clientCore.LocalInfo.sex == 1 ? rechargeInfo.rewardFamale : rechargeInfo.rewardMale;
                this.txtNeedNum.text = "￥" + rechargeInfo.cost;
            } else if (type == 2) {
                let rechargeInfo: xls.commonBuy = xls.get(xls.commonBuy).get(this._rechargeID) as xls.commonBuy;
                this._rewardArr = clientCore.LocalInfo.sex == 1 ? rechargeInfo.femaleAward : rechargeInfo.maleAward;
                this.txtNeedNum.text = "灵豆" + rechargeInfo.itemCost.v2;
            }
            this.list.repeatX = this._rewardArr.length;
            this.list.array = this._rewardArr;
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
            if (this._type == 1) {
                clientCore.RechargeManager.pay(this._rechargeID).then((data) => {
                    alert.showReward(clientCore.GoodsInfo.createArray(data.items.concat(data.extItms)));
                    this.event("CHEAP_PACKAGE_BUY_SUCC", this._rechargeID);
                    clientCore.DialogMgr.ins.close(this);
                });
            } else if (this._type == 2) {
                let cls: xls.commonBuy = xls.get(xls.commonBuy).get(this._rechargeID);
                let has: number = clientCore.ItemsInfo.getItemNum(cls.itemCost.v1);
                if (has < cls.itemCost.v2) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                    return;
                }
                alert.showSmall(`是否花费${cls.itemCost.v2}${clientCore.ItemsInfo.getItemName(cls.itemCost.v1)}兑换？`, {
                    callBack: {
                        caller: this,
                        funArr: [() => {
                            net.sendAndWait(new pb.cs_common_buy({ activityId: 19 })).then((msg: pb.sc_common_buy) => {
                                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                                if (this._rechargeID == 38) {
                                    clientCore.MedalManager.setMedal([{ id: MedalDailyConst.WANSHI_CHAOYIN_BUY_200, value: 1 }]);
                                }
                                else if (this._rechargeID == 39) {
                                    clientCore.MedalManager.setMedal([{ id: MedalDailyConst.WANSHI_CHAOYIN_BUY_600, value: 1 }]);
                                }
                                this.event("CHEAP_PACKAGE_BUY_SUCC", this._rechargeID);
                                clientCore.DialogMgr.ins.close(this);
                            })
                        }]
                    }
                })
            }

        }
        removeEventListeners() {

        }
        destroy() {
            super.destroy();
        }
    }
}