namespace shoppingMall {
    export class ShoppingMallModule extends ui.shoppingMall.ShoppingMallModuleUI {
        /**
         * shoppingMall.ShoppingMallModule
         */
        private _treeShopPanel: TreeShopSelectPanel;
        constructor() {
            super();
        }
        public init(d: any) {
            this.onOpenChange();
            if (clientCore.GlobalConfig.isIosTest) {
                this.btnActivityShop.visible = false;
            }
        }
        public onPreloadOver() {

        }
        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "shoppingMallModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }
        private onOpenChange() {
            this.btnFairyShop.disabled = !clientCore.SystemOpenManager.ins.getIsOpen(30);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnActivityShop, Laya.Event.CLICK, this, this.onShopClick);
            BC.addEvent(this, this.btnClothShop, Laya.Event.CLICK, this, this.onShopClick);
            BC.addEvent(this, this.btnFairyShop, Laya.Event.CLICK, this, this.onShopClick);
            BC.addEvent(this, this.btnFriendshipShop, Laya.Event.CLICK, this, this.onShopClick);
            BC.addEvent(this, this.btnPlantShop, Laya.Event.CLICK, this, this.onShopClick);
            BC.addEvent(this, this.btnTreeShop, Laya.Event.CLICK, this, this.onShopClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
            // this.btnActivityShop.gray = true;
            BC.addEvent(this, EventManager, globalEvent.SYSTEM_OPEN_CHANGED, this, this.onOpenChange);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "ShoppingMallModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
            }
        }
        onShopClick(e: Laya.Event) {
            switch (e.currentTarget) {
                case this.btnActivityShop://活动商店
                    // alert.showFWords("当前商店正在维修中，敬请期待");
                    // return;
                    this.destroy();
                    clientCore.ModuleManager.open("commonShop.CommonShopModule", 2, { openWhenClose: "shoppingMall.ShoppingMallModule" });
                    break;
                case this.btnClothShop://服装商店
                    this.destroy();
                    clientCore.ModuleManager.open("sellStore.SellStoreModule", { openWhenClose: "shoppingMall.ShoppingMallModule" });
                    break;
                case this.btnFairyShop://花仙商店
                    // alert.showFWords("当前商店正在维修中，敬请期待");
                    // return;
                    this.destroy();
                    clientCore.ModuleManager.open("commonShop.CommonShopModule", 1, { openWhenClose: "shoppingMall.ShoppingMallModule" });
                    break;
                case this.btnFriendshipShop://友情商店
                    this.destroy();
                    clientCore.ModuleManager.open("commonShop.CommonShopModule", 3, { openWhenClose: "shoppingMall.ShoppingMallModule" });
                    break;
                case this.btnPlantShop://种植商店
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "plantShopClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    this.destroy();
                    clientCore.ModuleManager.open('shop.ShopModule', null, { openWhenClose: "shoppingMall.ShoppingMallModule" });
                    break;
                case this.btnTreeShop://神树商店
                    if (!this._treeShopPanel) {
                        this._treeShopPanel = new TreeShopSelectPanel();
                        this._treeShopPanel.sideClose = true;
                    }
                    clientCore.DialogMgr.ins.open(this._treeShopPanel);
                    break;
            }
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            super.destroy();
        }
    }
}