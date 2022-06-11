namespace packageBuy {
    /**
     * packageBuy.CommonBuyModule
     * commonBuy 通用购买小面板
     * 
     */
    export class CommonBuyModule extends ui.packageBuy.PackageBuyModuleUI{
        private _rewardArr: xls.pair[];
        private _rechargeID: number;
        private _commonBuyInfo:xls.commonBuy;
        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.showReward);
            this.list.mouseHandler = new Laya.Handler(this, this.onItemSelect);
            this.sideClose = true;
        }
        init(d:any){
            this._rechargeID = d;
            this.addPreLoad(xls.load(xls.commonBuy));
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
            this._commonBuyInfo = xls.get(xls.commonBuy).get(this._rechargeID);
            this._rewardArr = clientCore.LocalInfo.sex == 1 ? this._commonBuyInfo.femaleAward : this._commonBuyInfo.maleAward;
            this.txtNeedNum.text = ""+this._commonBuyInfo.itemCost.v2;
            this.imgItem.skin = clientCore.ItemsInfo.getItemIconUrl(this._commonBuyInfo.itemCost.v1);
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
            net.sendAndWait(new pb.cs_common_buy({activityId:this._commonBuyInfo.type})).then((data:pb.sc_common_buy) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.item));
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