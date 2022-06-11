namespace shop {
    // export const EV_BUY_ITEM_OVER: string = 'EV_BUY_ITEM';
    export const SHOP_BUY_SUCC: string = "shop_buy_succ";
    export const SHOP_SHOW_ITEM_INFO_TIPS: string = "shop_show_item_info_tips";
    export const SHOP_HIDE_ITEM_INFO_TIPS: string = "shop_hide_item_info_tips";
    export class ShopModule extends ui.shop.ShopModuleUI {
        private _panelClsArr: any[] = [
            SeedPanel,
            HousePanel,
            GardenPanel
        ]
        private _panelArr: IShopPanel[];
        private _tabArr: Laya.Clip[];
        private _currTab: number = -1;
        private _shopConfig: ShopDB;

        private _buySuccPanel: BuySuccPanel;

        private _tipsPanel: InfoTipsPanle;

        private _willShowID: number = 0;
        init(d: any) {
            super.init(d);
            if (d) {
                this._willShowID = d;
            }
            this._panelArr = [];
            this._tabArr = [];
            for (const cls of this._panelClsArr) {
                this._panelArr.push(new cls(this));
            }
            for (let i = 0; i < this._panelClsArr.length; i++) {
                this._tabArr.push(this['tab_' + i]);
            }
            this.addPreLoad(xls.load(xls.shop));
            this.addPreLoad(xls.load(xls.manageBuildingId));
            this.addPreLoad(xls.load(xls.chapterBase));
        }

        public onPreloadOver() {
            this._shopConfig = new ShopDB(xls.get(xls.shop));
            this.getInfo();

            this._buySuccPanel = new BuySuccPanel();
            this._buySuccPanel.sideClose = false;

            this._tipsPanel = new InfoTipsPanle();
            this._tipsPanel.mouseEnabled = false;
        }
        popupOver() {
            //新手引导
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "shopModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
            if (this._willShowID > 0) {
                this._panelArr.forEach((panel, idx) => {
                    if (idx == this._currTab) {
                        panel.showDirectBuy(this._willShowID);
                    }
                })
            }
        }

        private getInfo() {
            this._panelArr.forEach((panel, index) => {
                let list: xls.shop[] = this._shopConfig.getListbyType(index + 1);
                let dataList: ShopItemData[] = [];
                let count: number = 0;
                for (let i: number = 0; i < list.length; i++) {
                    dataList.push(new ShopItemData(list[i]));
                }
                panel.setData(dataList);
            });
            if (this._currTab == -1)
                this._currTab = 0;
            this.showTab();
        }

        private showTab() {
            this._tabArr.forEach((clip, idx) => {
                idx == this._currTab ? clip.skin = "shop/clip_l_y_1.png" : clip.skin = "shop/clip_l_y_2.png";
            })
            this._panelArr.forEach((panel, idx) => {
                if (idx == this._currTab) {
                    panel.show();
                }
                else {
                    panel.hide();
                }

            })
        }

        private onTabChange(idx: number) {
            if (idx != this._currTab) {
                this._currTab = idx;
                this.showTab();
            }

            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickShopModuleTab") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private onClose() {
            this.destroy();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickShopCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "shopModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "btnBuySeed") {
                    var obj: any;
                    obj = this._panelArr[0].getBtnBuy(0);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "btnBuySeed_2") {
                    var obj: any;
                    obj = this._panelArr[0].getBtnBuy(1);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "btnBuyBuild") {
                    var obj: any;
                    obj = this._panelArr[1].getBtnBuy(0);
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });
                }
                else if (objName == "btnBuyDec") {
                    var obj: any;
                    obj = this._panelArr[2].getBtnBuy(0);
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });
                }
                else if (objName == "btnPut") {
                    var obj: any;
                    obj = this._buySuccPanel.btnPut;
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
        showBuyReward(id: number) {
            this.getInfo();
            this._buySuccPanel.show(id);
            clientCore.DialogMgr.ins.open(this._buySuccPanel);
        }
        private showInfoTips(itemID: number, pos: Laya.Point) {
            this._tipsPanel.visible = true;
            this._tipsPanel.show(itemID);
            pos = this.globalToLocal(pos, false);
            this._tipsPanel.pos(pos.x, pos.y);
            this.addChild(this._tipsPanel);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onClickStage);
        }

        private onClickStage() {
            if (this._tipsPanel.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY)) {
                return;
            }
            this.hideInfoTips();
        }
        private hideInfoTips() {
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onClickStage);
            this._tipsPanel.removeSelf();
        }
        public addEventListeners() {
            this.btnClose.on(Laya.Event.CLICK, this, this.onClose);
            for (let i = 0; i < this._tabArr.length; i++) {
                this['tab_' + i].on(Laya.Event.CLICK, this, this.onTabChange, [i]);
            }
            this._panelArr.forEach((panel) => {
                panel.addEventListeners();
            });
            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
            EventManager.on(SHOP_BUY_SUCC, this, this.showBuyReward);
            this._buySuccPanel.on("close_by_put_click", this, this.closeByPut);

            EventManager.on(SHOP_SHOW_ITEM_INFO_TIPS, this, this.showInfoTips);
            EventManager.on(SHOP_HIDE_ITEM_INFO_TIPS, this, this.hideInfoTips);
        }

        public removeEventListeners() {
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onClickStage);
            this.btnClose.offAll();
            for (let i = 0; i < this._tabArr.length; i++) {
                this['tab_' + i].offAll();
            }
            this._panelArr.forEach((panel) => {
                panel.removeEventListeners();
            });
            // EventManager.off(EV_BUY_ITEM_OVER, this, this.getInfo);
            EventManager.off(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
            EventManager.off(SHOP_BUY_SUCC, this, this.showBuyReward);
            this._buySuccPanel.off("close_by_put_click", this, this.closeByPut);
            EventManager.off(SHOP_SHOW_ITEM_INFO_TIPS, this, this.showInfoTips);
            EventManager.off(SHOP_HIDE_ITEM_INFO_TIPS, this, this.hideInfoTips);
        }
        private closeByPut() {
            this.needOpenMod = null;
            this.destroy();
        }
        destroy() {
            console.log("shop destroy call!!!");
            super.destroy();
        }
    }
}