namespace heartPrison{
    /**
     * 购买界面
     */
    export class BuyPanel extends ui.heartPrison.panel.BuyPanelUI{

        private _cfg: xls.commonBuy;
        private _id: number;
        private _model: HeartPrisonModel;
        private _buying: boolean;

        constructor(){ super(); }

        show(sign: number,cfg: xls.commonBuy): void{
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID,clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this._model = clientCore.CManager.getModel(sign) as HeartPrisonModel; 
            this._cfg = cfg;
            this.imgCost.skin = this.imgCost1.skin = clientCore.ItemsInfo.getItemIconUrl(this._cfg.itemCost.v1);
            let get: xls.pair = clientCore.LocalInfo.sex == 1 ? this._cfg.femaleAward[0] : this._cfg.maleAward[0];
            this._id = get.v1;
            this.imgGet.skin = clientCore.ItemsInfo.getItemIconUrl(get.v1);
            this.getTxt.changeText(`x${get.v2}`);
            this.costTxt.changeText(this._cfg.itemCost.v2+'');
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        destroy(): void{
            clientCore.UIManager.releaseCoinBox();
            this._cfg = this._model = null;
            super.destroy();
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnBuy,Laya.Event.CLICK,this,this.onBuy);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        private onBuy(): void{
            if(this._buying)return;

            if(!clientCore.ItemsInfo.checkItemsEnough([{itemID: this._cfg.itemCost.v1,itemNum: this._cfg.itemCost.v2}])){
                alert.showFWords('物品数量不足哦~');
                return;
            }

            alert.showSmall(`是否花费${clientCore.ItemsInfo.getItemName(this._cfg.itemCost.v1)}x${this._cfg.itemCost.v2}购买${clientCore.ItemsInfo.getItemName(this._id)}?`,{
                callBack: {
                    caller: this,
                    funArr: [()=>{
                        this._buying = true;
                        net.sendAndWait(new pb.cs_common_buy({activityId: 87})).then((msg: pb.sc_common_buy)=>{
                            this._buying = false;
                            alert.showReward(msg.item);
                            this._model.msg.buyTimes++;
                            this.hide();
                        }).catch(()=>{
                            this._buying = false;
                        })
                    }]
                }
            });
        }
    }
}