namespace orderSystem {
    enum TAB {
        ORDER,
        SELL
    }
    export class OrderSystemModule extends ui.orderSystem.OrderSystemModuleUI {

        private _orderPanel: OrderPanel;
        // private _sellPanel: SellPanel;
        private _currTab: TAB;
        constructor() {
            super();

            this._orderPanel = new OrderPanel();
            // this._sellPanel = new SellPanel();

            this.addPreLoad(xls.load(xls.orderBase));
            this.addPreLoad(xls.load(xls.sellBase));
            this.addPreLoad(xls.load(xls.globaltest));
            this.addPreLoad(xls.load(xls.manageBuildingFormula));
            this.addPreLoad(xls.load(xls.manageBuildingId));
            // this.addPreLoad(this.loadJs("materialTips"));
            // this.addPreLoad(this.loadatlas("materialTips"));
            this.addPreLoad(res.load('atlas/orderSystem/extra2.atlas'));
            this.addPreLoad(res.load('atlas/orderSystem/extra3.atlas'));
            this.addPreLoad(this._orderPanel.preLoadOrderData());
        }

        init(d: any) {
            super.init(d);
            // this._orderPanel.init(undefined);
            if (!d) {
                d = TAB.ORDER;
            }
            this.onChangeTab(d);
        }

        public onPreloadOver() {
            this._orderPanel.init(undefined);
        }
        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "orderSystemModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private onChangeTab(tab: TAB) {
            if (tab == this._currTab)
                return;
            if (tab == TAB.SELL) {
                alert.showFWords('暂未开放！');
                return;
            }
            this._currTab = tab;
            this.showTab(tab);
        }

        private showTab(tab: TAB) {
            this.tab_0.index = tab == TAB.ORDER ? 1 : 0;
            this.tab_1.index = tab == TAB.SELL ? 1 : 0;
            this.panel.removeChildren();
            if (tab == TAB.ORDER)
                this.panel.addChild(this._orderPanel);
        }

        private onClose() {
            this.destroy();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clientOrderSystemCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "orderSystemModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "btnDeliver") {
                    var obj: any;
                    obj = this._orderPanel.getDeliverBtn();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "refreshAll") {
                    var obj: any;
                    obj = this._orderPanel.getRefreshAllBtn();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "mcOrderItem") {
                    var obj: any;
                    obj = this._orderPanel.getOneOrder();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {

                }
            }
        }

        public addEventListeners() {
            this._orderPanel.addEventListeners();
            // this._sellPanel.addEventListeners();
            this.btnClose.on(Laya.Event.CLICK, this, this.onClose);
            this.tab_0.on(Laya.Event.CLICK, this, this.onChangeTab, [TAB.ORDER]);
            this.tab_1.on(Laya.Event.CLICK, this, this.onChangeTab, [TAB.SELL]);

            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        public removeEventListeners() {
            this.btnClose.offAll();
            this.tab_0.offAll();
            this.tab_1.offAll();

            EventManager.off(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        public destroy() {
            this._orderPanel.destroy();
            super.destroy();
        }

    }
}