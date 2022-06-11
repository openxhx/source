namespace packageBuy {
    /**
     * packageBuy.PackageBuyModule
     * 6元 68元礼包购买 通用小面板
     * 
     */
    export class PackageBuyModule extends ui.packageBuy.PackageBuyModuleUI{
        private _rewardArr: xls.pair[];
        private _rechargeID: number;
        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.showReward);
            this.list.mouseHandler = new Laya.Handler(this, this.onItemSelect);
            this.sideClose = true;
        }
        init(d:any){
            this._rechargeID = d;
            this.addPreLoad(xls.load(xls.rechargeShopOffical));
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
        onPreloadOver() {
            let rechargeInfo: xls.rechargeShopOffical = xls.get(xls.rechargeShopOffical).get(this._rechargeID);
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
        private onClose() {
            this.destroy();
        }
        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuyClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }
        private onBuyClick(e: Laya.Event) {
            clientCore.RechargeManager.pay(this._rechargeID).then((data) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.items.concat(data.extItms)));
                this.event(Laya.Event.CHANGED, this._rechargeID);
                this.destroy();
            });
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy(){
            super.destroy();
        }
    }
}