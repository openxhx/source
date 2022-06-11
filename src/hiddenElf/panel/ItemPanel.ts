namespace hiddenElf{
    /**
     * 特殊道具
     */
    export class ItemPanel extends ui.hiddenElf.panel.ItemPanelUI{
        constructor(){ super(); }
        show(sign: number): void{
            this.initView();
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnBack,Laya.Event.CLICK,this,this.hide);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }

        private initView(): void{
            let ids: number[] = [102,101];
            for(let i:number=1; i<3; i++){
                let cfg: xls.shop = xls.get(xls.shop).get(ids[i-1]);
                let cost: xls.pair = cfg.sell[0];
                this['imgCost_'+i].skin = clientCore.ItemsInfo.getItemIconUrl(cost.v1);
                this['txtCost_'+i].changeText(cost.v2);
                BC.addEvent(this,this['btnBuy_'+ i],Laya.Event.CLICK,this,this.onBuy, [cfg.itemId]);
            }
        }

        private onBuy(id: number): void{
            alert.alertQuickBuy(id,1,true);
        }
    }
}