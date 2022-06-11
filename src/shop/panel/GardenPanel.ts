namespace shop {
    export class GardenPanel implements IShopPanel {

        private _mainUI: ui.shop.panel.GardenPanelUI;
        private _parent: ShopModule;
        private _tabList: laya.ui.Clip[];
        private _selectIndex: number;
        private _dataNormal: ShopItemData[];
        private _dataLimit: ShopItemData[];

        constructor(p: any) {
            this._parent = p;
            this._mainUI = p.gardenPanel;
            this._mainUI.list.itemRender = GardenRender;
            this._mainUI.list.hScrollBarSkin = "";
            this._mainUI.list.scrollBar.elasticBackTime = 200;
            this._mainUI.list.scrollBar.elasticDistance = 50;

            this._tabList = [];
            for (let i: number = 0; i < 2; i++) {
                this._tabList[i] = this._mainUI["tab_" + i];
            }

            //新手引导阶段。list不让拖动
            if (clientCore.GuideMainManager.instance.isGuideAction) {
                this._mainUI.list.scrollBar.touchScrollEnable = false;
            }
        }

        private onBuy(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == 'btnBuy') {
                if (e.currentTarget['boxLock'].visible) {
                    alert.showFWords('还未解锁！')
                    return;
                }

                this.showQuickBuy(index);
                
            }
        }
        private showQuickBuy(index:number){
            let shopInfo = this._mainUI.list.array[index];
            let buyInfo:alert.QuickBuyInfo = new alert.QuickBuyInfo(shopInfo.itemId);
            buyInfo.singlePrice = shopInfo.cost[0].v2;
            buyInfo.tokenID = shopInfo.cost[0].v1;
            buyInfo.haveNum = clientCore.MapItemsInfoManager.instance.getPackageDecorationNumInById(shopInfo.itemId);
            buyInfo.caller = this;
            buyInfo.cancelFun = ()=>{};
            buyInfo.sureFun = (itemID:number,buyNum:number)=>{
                net.sendAndWait(new pb.cs_shop_buy_item({ id: itemID, num: buyNum })).then(
                    (data: pb.sc_shop_buy_item) => {
                        EventManager.event(SHOP_BUY_SUCC,data.addItems[0].itemId);
                        if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "shopModuleDecBuyClick") {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                    }
                ).catch((data: any) => {
                });
            };
            alert.quickBuy(buyInfo);
        }

        private changeTab() {
            switch (this._selectIndex) {
                case 0:
                    this._mainUI.list.array = this._dataNormal;
                    this._mainUI.mcEmpty.visible = this._dataNormal.length < 1;
                    break;
                case 1:
                    this._mainUI.list.array = this._dataLimit;
                    this._mainUI.mcEmpty.visible = this._dataLimit.length < 1;
                    break;
            }
            this._mainUI.list.scrollTo(0);
        }

        private tabClick(index: number) {
            if (this._selectIndex == index) return;
            this._selectIndex = index;
            for (let i: number = 0; i < 2; i++) {
                this._tabList[i].index = index == i ? 1 : 0;
            }
            this.changeTab();
        }

        public setData(value: ShopItemData[]) {
            this._dataNormal = [];
            this._dataLimit = [];
            for (let i: number = 0; i < value.length; i++) {
                if (value[i].deadline == "") {
                    this._dataNormal.push(value[i]);
                } else {
                    this._dataLimit.push(value[i]);
                }
            }
        }

        public show() {
            this._tabList[0].index = 1;
            this._selectIndex = 0;
            this.changeTab();
            this._parent.addChild(this._mainUI);
        }

        public hide() {
            this._parent.removeChild(this._mainUI);
        }

        showDirectBuy(id:number){

        }

        public addEventListeners() {
            for (let i: number = 0; i < 2; i++) {
                this._tabList[i].on(Laya.Event.CLICK, this, this.tabClick, [i]);
            }
            this._mainUI.list.mouseHandler = Laya.Handler.create(this, this.onBuy, null, false);
        }

        public removeEventListeners() {
            for (let i: number = 0; i < 2; i++) {
                this._tabList[i].offAll();
            }
            this._mainUI.list.mouseHandler.recover();
            this._mainUI.list.destroy();
        }
        public getBtnBuy(index:number) {
            return {cell:this._mainUI.list.getCell(index),guideRealTarget:this._mainUI.list.getCell(index)["boxMain"].getChildByName("btnBuy")}
            // return this._mainUI.list.getCell(index)["boxMain"].getChildByName("btnBuy");
        }
    }
}