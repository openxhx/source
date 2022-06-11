namespace shoppingMall {
    export class TreeShopSelectPanel extends ui.shoppingMall.TreeShopSelectPanelUI {
        constructor(){
            super();
        }
        init(d:any){

        }
        addEventListeners(){
            BC.addEvent(this,this.btnClothExchange,Laya.Event.CLICK,this,this.onExchangeClick,["cloth"]);
            BC.addEvent(this,this.btnItemExchange,Laya.Event.CLICK,this,this.onExchangeClick,["item"]);
        }
        private onExchangeClick(type:string){
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            if(type == "cloth"){
                clientCore.ModuleManager.open("sellStore.SellStoreModule","clothExchange",{ openWhenClose: "shoppingMall.ShoppingMallModule"});
            }
            else if(type == "item"){
                clientCore.ModuleManager.open("commonShop.CommonShopModule", 5,{ openWhenClose: "shoppingMall.ShoppingMallModule"});
            }
        }
    }
}
