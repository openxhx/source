namespace sellStore {
    enum TAB {
        CLOTH,
        SUIT,
        SUIT_DETAIL,
    }
    export const DEFAULT_CLOTH = [601043, 601044, 601045];
    import Money = clientCore.MoneyManager;
    /**
     * sellStore.SellStoreModule
     */
    export class SellStoreModule extends ui.sellStore.SellStoreUI {
        private _currTab: TAB;
        private _currSuitId: number;
        private _person: clientCore.Person;
        private _panelArr: ISellStorePanel[];
        private _currPanel: ISellStorePanel;
        private _cartPanel: CartPanel;

        init(d: any) {
            super.init(d);
            this.addPreLoad(res.load('atlas/sellStore/detail.atlas'));
            this.addPreLoad(res.load('atlas/sellStore/shoppingCart.atlas'));
            this.addPreLoad(res.load('atlas/sellStore/suit.atlas'));
            this.addPreLoad(res.load('atlas/clothTab.atlas'))
            this.addPreLoad(xls.load(xls.suits));
            this.addPreLoad(xls.load(xls.itemCloth));
            this.addPreLoad(xls.load(xls.clothStore));
            this._currTab = TAB.CLOTH;
            this._panelArr = [];
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this._person.scale(0.6, 0.6);
            this._person.pos(300, 400);
            this.imgBgshow.scale(1, 1);
            this.imgStage.scale(1, 1);
            this.imgBgshow.pos(-470, -350);
            this.imgStage.pos(-470, -350);
            this.imgBgshow.skin = clientCore.ItemsInfo.getItemUIUrl(clientCore.BgShowManager.instance.currBgShowId);
            this.imgStage.skin = clientCore.ItemsInfo.getItemUIUrl(clientCore.BgShowManager.instance.currStageId);
            this.addChildAt(this._person, 3);
        }

        initOver() {
            if (this._data && this._data == "clothExchange") {
                clientCore.Logger.sendLog('2021年1月8日活动', '神树商店上新', '打开活动面板');
                this.imgTitle.skin = 'sellStore/title.png';
                SellStoreModel.instance.initData(sellStore.CLOTH_STORE_TYPE.GodTreeStore);
            }
            else if (this._data && this._data == 'twinkleStore') {
                this.imgTitle.skin = 'sellStore/title_3.png';
                SellStoreModel.instance.initData(sellStore.CLOTH_STORE_TYPE.TwinkleStore);
            }
            else {
                this.imgTitle.skin = 'sellStore/title.png';
                SellStoreModel.instance.initData(sellStore.CLOTH_STORE_TYPE.ClothStore);
            }
            this._currTab = TAB.CLOTH;
            this.showView();
        }
        popupOver() {
            clientCore.UIManager.showCoinBox();
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "sellStoreModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private getPanel(tab: TAB): ISellStorePanel {
            if (this._panelArr[tab])
                return this._panelArr[tab];
            else
                return this.createPanel(tab);
        }

        private createPanel(tab: TAB): ISellStorePanel {
            let rtn;
            switch (this._currTab) {
                case TAB.CLOTH:
                    rtn = new ClothPanel();
                    break;
                case TAB.SUIT:
                    rtn = new SuitPanel();
                    break;
                case TAB.SUIT_DETAIL:
                    rtn = new DetailPanel();
                    break;
                default:
                    break;
            }
            rtn.init(this);
            this._panelArr[tab] = rtn;
            return rtn;
        }

        private showView() {
            if (this._currPanel) {
                this._currPanel.hide();
            }
            this._person.visible = this._currTab != TAB.SUIT;
            this.tab_cloth.index = this._currTab == TAB.CLOTH ? 0 : 1;
            this.tab_suit.index = this._currTab != TAB.CLOTH ? 0 : 1;
            this._currPanel = this.getPanel(this._currTab);
            this._currPanel.show(this._currSuitId);
        }

        private onTabClick(tab: TAB) {
            if (this._currTab != tab) {
                this._currTab = tab;
                this.showView();
            }
        }

        private onChangePerson(data) {
            if (data.up)
                this._person.upById(data.up);
            if (data.down)
                this._person.downById(data.down);
            if (data.clear)
                this._person.downAllCloth();
        }

        private onOpenCart() {
            if (!this._cartPanel) {
                this._cartPanel = new CartPanel();
                this._cartPanel.init(this);
            }
            this._cartPanel.show();
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitShowCatPanelOpen") {
                Laya.timer.frameOnce(2, this, () => {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                });
            }
        }

        private onDetailPanel(open: boolean) {
            this._person.downAllCloth();
            if (open)
                this._person.upByIdArr(clientCore.SuitsInfo.getSuitInfo(SellStoreModel.instance.selectSuit).clothes);
            else
                this._person.upByIdArr(SellStoreModel.instance.selectClothes);
            this.btnClose.visible = !open;
            this.boxTab.visible = !open;
            this.onTabClick(open ? TAB.SUIT_DETAIL : TAB.SUIT);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "sellStoreModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "btnCart") {
                    var obj: any;
                    obj = (this._panelArr[TAB.CLOTH] as ClothPanel).guideGetBuyBtn();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "tabCloth") {
                    var obj: any;
                    obj = (this._panelArr[TAB.CLOTH] as ClothPanel).getTabByType(clientCore.CLOTH_TYPE.CLOTH_ARR, clientCore.CLOTH_TYPE.Cloth);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "btnCartCar") {
                    var obj: any;
                    obj = (this._panelArr[TAB.CLOTH] as ClothPanel).getBtnChatCar();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "btnSure") {
                    var obj: any;
                    Laya.timer.frameOnce(2, this, () => {
                        obj = this._cartPanel.getSureBtn();
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });

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

        private changeBgStage() {
            let bg = SellStoreModel.instance.getSelectCloth(18);
            let stage = SellStoreModel.instance.getSelectCloth(19);
            if (bg) {
                this.imgBgshow.skin = clientCore.ItemsInfo.getItemUIUrl(bg);
            } else {
                this.imgBgshow.skin = clientCore.ItemsInfo.getItemUIUrl(clientCore.BgShowManager.instance.currBgShowId);
            }
            if (stage) {
                this.imgStage.skin = clientCore.ItemsInfo.getItemUIUrl(stage);
            } else {
                this.imgStage.skin = clientCore.ItemsInfo.getItemUIUrl(clientCore.BgShowManager.instance.currStageId);
            }

        }

        addEventListeners() {
            BC.addEvent(this, this.tab_cloth, Laya.Event.CLICK, this, this.onTabClick, [TAB.CLOTH]);
            BC.addEvent(this, this.tab_suit, Laya.Event.CLICK, this, this.onTabClick, [TAB.SUIT]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnClothChange, Laya.Event.CLICK, this, this.showClothChange);
            EventManager.on(SellStoreEvent.EV_NEED_CHANGE_CLOTH, this, this.onChangePerson);
            EventManager.on(SellStoreEvent.EV_OPEN_CART, this, this.onOpenCart);
            EventManager.on(SellStoreEvent.EV_DETAIL_PANEL, this, this.onDetailPanel);
            EventManager.on(SellStoreEvent.EV_CHANGE_BG_STAGE, this, this.changeBgStage);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        private onClose() {
            this.needOpenMod = '';
            let type = this._data;
            this.destroy();
            if (type == 'twinkleStore') {
                clientCore.ModuleManager.open('twinkleTransfg.TwinkleTransfgModule');
            }
        }
        destroy() {
            super.destroy();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSellStoreCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }
        private showClothChange(e: Laya.Event) {
            this.destroy();
            clientCore.ModuleManager.open('clothChange.ClothChangeModule');
        }
        removeEventListeners() {
            BC.removeEvent(this);
            for (let i = 0; i < this._panelArr.length; i++) {
                if (this._panelArr[i]) {
                    this._panelArr[i].destory();
                }
            }
            EventManager.off(SellStoreEvent.EV_NEED_CHANGE_CLOTH, this, this.onChangePerson);
            EventManager.off(SellStoreEvent.EV_OPEN_CART, this, this.onOpenCart);
            EventManager.off(SellStoreEvent.EV_DETAIL_PANEL, this, this.onDetailPanel);
            clientCore.UIManager.releaseCoinBox();
            SellStoreModel.instance.clearData();
        }
    }
}