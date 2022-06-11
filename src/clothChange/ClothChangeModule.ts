namespace clothChange {

    enum TAB {
        CLOTH,
        BACKGROUND,
        RIDER,
        LOOK,
    }
    /**
     * clothChange.ClothChangeModule
     */
    export class ClothChangeModule extends ui.clothChange.ClothChangeUI {
        private _panelArr: IClothChangePanel[];
        private _currTab: Number;
        private _changeOkMc: Laya.MovieClip;
        private _chaneOkPlayOver: Laya.Handler;
        private _accept: boolean; //是否收纳

        init(d: any) {
            super.init(d);
            ClothChangeModel.instance.module = this;
            this.addPreLoad(res.load('atlas/clothChange/twinkle.png'));
            this.addPreLoad(res.load('atlas/clothChange/twinkle.atlas', Laya.Loader.ATLAS));
            this.addPreLoad(res.load('res/animate/clothChange/changeOk.json', Laya.Loader.ATLAS));
            this.addPreLoad(res.load('atlas/clothTab.atlas'))
            this.addPreLoad(ClothChangeModel.instance.setUp());
            this.drawCallOptimize = true;
        }

        onPreloadOver() {
            ClothChangeModel.instance.initView(this.boxCotain);
            this._changeOkMc = new Laya.MovieClip();
            this._changeOkMc.load('res/animate/clothChange/changeOk.swf', true);
            this._changeOkMc.pos(this.width / 2, this.height / 2);
            this._chaneOkPlayOver = new Laya.Handler(this, this.onChangePlayOver);
            this._panelArr = [];

            if (this._data) {
                this.btnClose.skin = 'commonBtn/btn_l_y_back.png';
                if (this._data.cfg) {
                    if (this._data.cfg.requireCharpter > 1000) {
                        let panel: ActivityLevelClothPanel = new ActivityLevelClothPanel(this.clothPanel);
                        panel.configure(this._data);
                        this._panelArr.push(panel);
                        this.boxLeftBtns.visible = false;
                    } else {
                        let panel: TwinkleClothPanel = new TwinkleClothPanel(this.clothPanel);
                        panel.configure(this._data);
                        this._panelArr.push(panel);
                        this.btnShowShop.visible = false;
                        this.btnTemple.visible = this.btnAppreciate.visible = false;
                    }
                } else {
                    let panel: ActivityClothPanel = new ActivityClothPanel(this.clothPanel);
                    panel.configure(this._data);
                    this._panelArr.push(panel);
                    this.boxLeftBtns.visible = false;
                }
            } else {
                this._panelArr.push(new ClothPanel(this.clothPanel));
                this.btnShowShop.visible = this.btnTwinkleShop.visible = false;
            }

            for (const panel of this._panelArr) {
                panel.hide();
            }
            this._currTab = TAB.CLOTH;
            this.showTab();

            this.boxLeftBtns.x = -clientCore.LayerManager.mainLayer.x;
            this.boxCotain.x = -clientCore.LayerManager.mainLayer.x / 2 + 303;
            this.hitArea = new Laya.Rectangle(-clientCore.LayerManager.mainLayer.x, 0, Laya.stage.width, Laya.stage.height);

            clientCore.UIManager.showCoinBox();
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SHOW_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
        }
        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "clothChangeModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private showTab() {
            this._panelArr.forEach((v, i) => {
                i == this._currTab ? v.show() : v.hide();
            });
        }

        private onClose(e: Laya.Event) {
            if (this._data) {
                this.needOpenMod = "christmasShow.ChristmasShowModule";
                let cfg: xls.shineTripStage = this._data.cfg ? this._data.cfg : null;
                if (cfg && cfg.requireCharpter >= 1000) {
                    this.needOpenMod = "anniversaryShow.AnniversaryShowModule";
                    this.needOpenData = { type: "level", data: 0 };
                } else if (cfg && cfg.requireCharpter < 10) {
                    this.needOpenMod = "twinkleTransfg.TwinkleTransfgModule";
                } else if (cfg && cfg.requireCharpter >= 100) {
                    this.needOpenMod = "twinkleChapter.TwinkleChapterModule";
                    this.needOpenData = { chapter: cfg.requireCharpter };
                }
            }
            clientCore.UIManager.releaseCoinBox();
            this.destroy();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClothChangeCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private onChangeOk() {
            this.addChild(this._changeOkMc);
            this._changeOkMc.playTo(0, this._changeOkMc.count, this._chaneOkPlayOver);
            if (clientCore.BgShowManager.instance.currRider)
                ClothChangeModel.instance.person.playAnimate('zuoxia', true);
            else
                ClothChangeModel.instance.person.playAnimate(Math.random() > 0.5 ? 'zhiyi' : 'jushou', false);
        }

        private onChangePlayOver() {
            this._changeOkMc.stop();
            this._changeOkMc.removeSelf();
        }

        private onSellStore() {
            this.needOpenMod = '';
            this.destroy();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClothChangeStoreBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            clientCore.ModuleManager.open('sellStore.SellStoreModule', null, { openWhenClose: 'clothChange.ClothChangeModule' });
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "clothChangeModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "firstClothCell") {
                    var obj: any;
                    obj = (this._panelArr[0] as ClothPanel).getClothCell();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);

                }
                else if (objName == "tabSuit") {
                    var obj: any;
                    obj = (this._panelArr[0] as ClothPanel).getSuitTab();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "firstSuitCell") {
                    var obj: any;
                    obj = (this._panelArr[0] as ClothPanel).getSuitCell();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "imgOk") {
                    var obj: any;
                    obj = (this._panelArr[0] as ClothPanel).getOKImg();
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

        private openTemple(): void {
            this.needOpenMod = '';
            this.destroy();
            clientCore.ModuleManager.open("familyTailor.FamilyTailorModule", { type: 1, lv: 0 }, { openWhenClose: 'clothChange.ClothChangeModule' });
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClothTempleIcon") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private openAppreciate(): void {
            this.needOpenMod = '';
            this.destroy();
            clientCore.ModuleManager.open('appreciate.AppreciateModule', null, { openWhenClose: 'clothChange.ClothChangeModule' });
        }

        /** 打开闪耀变身店*/
        private openTwinkleShop(): void {
            if (!this._data) return;
            let cfg: xls.shineTripStage = this._data;
            clientCore.ModuleManager.open('twinkleShop.TwinkleShopModule', cfg.requireCharpter);
        }

        /**打开闪耀秀场商店 */
        private openShowShop() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('commonShop.CommonShopModule', 9);
        }

        addEventListeners() {
            this.btnClose.on(Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnStore, Laya.Event.CLICK, this, this.onSellStore);
            BC.addEvent(this, this.btnTemple, Laya.Event.CLICK, this, this.openTemple);
            BC.addEvent(this, this.btnShowShop, Laya.Event.CLICK, this, this.openShowShop);
            BC.addEvent(this, this.btnAppreciate, Laya.Event.CLICK, this, this.openAppreciate);
            BC.addEvent(this, this.btnTwinkleShop, Laya.Event.CLICK, this, this.openTwinkleShop);
            BC.addEvent(this, this.btnAccept, Laya.Event.CLICK, this, this.onAccept);
            EventManager.on(globalEvent.USER_CHANGE_CLOTH, this, this.onChangeOk);

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        removeEventListeners() {
            this.btnClose.offAll();
            BC.removeEvent(this);
            EventManager.off(globalEvent.USER_CHANGE_CLOTH, this, this.onChangeOk);
        }

        destroy() {
            Laya.Tween.clearAll(this.boxCotain);
            Laya.Tween.clearAll(this.clothPanel);
            clientCore.UIManager.releaseCoinBox();
            for (const panel of this._panelArr) {
                panel.destroy();
            }
            ClothChangeModel.instance.destory();
            super.destroy();
        }

        private onAccept(): void {
            let x: number = this._accept ? 0 : Laya.stage.width - clientCore.LayerManager.OFFSET;
            this.btnAccept.visible = false;
            Laya.Tween.to(this.boxCotain, { x: this._accept ? 303 : 667 }, 1000);
            Laya.Tween.to(this.clothPanel, { x: x }, 1000, null, new Laya.Handler(this, () => {
                this.btnAccept.visible = true;
                this.btnAccept.x = this._accept ? 522 : Laya.stage.width - clientCore.LayerManager.OFFSET - this.btnAccept.width / 2;
                this._accept = !this._accept;
            }));
        }
    }
}