namespace shop {
    export class HousePanel implements IShopPanel {

        private _mainUI: ui.shop.panel.HousePanelUI;
        private _parent: ShopModule;
        private _data: ShopItemData[];

        private _selectID: number;
        private _touchPos: Laya.Point;

        constructor(p: any) {
            this._parent = p;
            this._mainUI = p.housePanel;
            this._mainUI.list.itemRender = HouseRender;
            this._mainUI.list.hScrollBarSkin = "";
            this._mainUI.list.scrollBar.elasticBackTime = 200;
            this._mainUI.list.scrollBar.elasticDistance = 50;
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
                net.sendAndWait(new pb.cs_shop_buy_item({ id: this._data[index].itemId, num: 1 })).then(
                    (data: pb.sc_shop_buy_item) => {
                        EventManager.event(SHOP_BUY_SUCC, data.addItems[0].itemId);
                        if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "buildingBuyClick") {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                    }
                ).catch((data: any) => {
                });
            }
            else if (e.type == Laya.Event.CLICK && e.target.name == "mcShowTips") {
                console.log("mouse down click!!!");
                this._selectID = this._data[index].itemId;
                let tmpPos = new Laya.Point(e.target.x, e.target.y);
                this._touchPos = (e.target.parent as Laya.Sprite).localToGlobal(tmpPos);
                this.showTips();
            }
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
            for (let i = value.length - 1; i >= 0; i--) {
                if (clientCore.MapItemsInfoManager.instance.checkHasSomeById(value[i].itemId)) {
                    value.splice(i, 1);
                }
            }
            this._data = value;
        }

        public show() {
            this._parent.addChild(this._mainUI);
            this.refresh();
        }

        public hide() {
            this._parent.removeChild(this._mainUI);
        }

        showDirectBuy(id: number) {

        }

        public addEventListeners() {
            this._mainUI.list.mouseHandler = Laya.Handler.create(this, this.onBuy, null, false);
        }

        public removeEventListeners() {
            this._mainUI.list.mouseHandler.recover();
            this._mainUI.list.destroy();
        }
        public getBtnBuy(index: number) {
            return { cell: this._mainUI.list.getCell(index), guideRealTarget: this._mainUI.list.getCell(index)["boxMain"].getChildByName("btnBuy") }
            // return this._mainUI.list.getCell(index)["boxMain"].getChildByName("btnBuy");
        }
    }
}