namespace shop {
    export class SeedPanel implements IShopPanel {

        private _mainUI: ui.shop.panel.SeedPanelUI;
        private _parent: ShopModule;
        private _data: ShopItemData[];

        private _selectID: number;
        private _touchPos: Laya.Point;
        constructor(p: any) {
            this._parent = p;
            this._mainUI = p.seedPanel;
            this._mainUI.list.itemRender = SeedRender;
            this._mainUI.list.hScrollBarSkin = "";
            this._mainUI.list.scrollBar.elasticBackTime = 200;
            this._mainUI.list.scrollBar.elasticDistance = 50;
            this._mainUI.panelLv.visible = false;
            this._mainUI.panelUnLock.visible = false;
            this._mainUI.list.mouseEnabled = true;
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
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "seedBuyClick") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
                this.showQuickBuy(index);
            }
            else if (e.type == Laya.Event.CLICK && e.target.name == "mcShowTips") {
                console.log("mouse down click!!!");
                this._selectID = this._data[index].itemId;
                let tmpPos = new Laya.Point(e.target.x, e.target.y);
                this._touchPos = (e.target.parent as Laya.Sprite).localToGlobal(tmpPos);
                this.showTips();
            }
        }
        private showQuickBuy(index: number) {
            let shopInfo = this._data[index];
            let buyInfo: alert.QuickBuyInfo = new alert.QuickBuyInfo(shopInfo.itemId);
            buyInfo.singlePrice = shopInfo.cost[0].v2;
            buyInfo.tokenID = shopInfo.cost[0].v1;
            buyInfo.haveNum = clientCore.ItemsInfo.getItemNum(shopInfo.itemId);
            buyInfo.caller = this;
            buyInfo.cancelFun = () => { };
            buyInfo.sureFun = (itemID: number, buyNum: number) => {
                net.sendAndWait(new pb.cs_shop_buy_item({ id: itemID, num: buyNum })).then(
                    (data: pb.sc_shop_buy_item) => {
                        EventManager.event(SHOP_BUY_SUCC, [data.addItems[0].itemId, data.addItems[0].itemCnt]);
                        if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "seedBuySucc") {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                ).catch((data: any) => {
                });
            };
            alert.quickBuy(buyInfo);
        }
        private showTips() {
            console.log(`show tips id:${this._selectID}  pos:${this._touchPos.x} ${this._touchPos.y}`);
            EventManager.event(SHOP_SHOW_ITEM_INFO_TIPS, [this._selectID, this._touchPos]);
        }
        private hideTips() {
            console.log("hide tips");
            EventManager.event(SHOP_HIDE_ITEM_INFO_TIPS);
        }
        private refresh() {
            this._mainUI.list.array = this._data;
        }

        public setData(value: ShopItemData[]) {
            this._data = value;
        }

        public show() {
            this.refresh();
            this._parent.addChild(this._mainUI);
        }

        public showDirectBuy(id: number) {
            if (id > 0) {
                let index = 0;
                for (let i = 0; i < this._data.length; i++) {
                    if (this._data[i].itemId == id) {
                        index = i;
                        break;
                    }
                }
                this.showQuickBuy(index);
            }
        }

        public hide() {
            this._parent.removeChild(this._mainUI);
        }

        public addEventListeners() {
            this._mainUI.list.mouseHandler = Laya.Handler.create(this, this.onBuy, null, false);
        }

        public removeEventListeners() {
            this._mainUI.list.mouseHandler.recover();
            this._mainUI.list.destroy();
        }

        public getBtnBuy(index: number) {
            return {cell:this._mainUI.list.getCell(index),guideRealTarget:this._mainUI.list.getCell(index)["boxMain"].getChildByName("btnBuy")}
            // return this._mainUI.list.getCell(index)["boxMain"].getChildByName("btnBuy");
        }
    }
}