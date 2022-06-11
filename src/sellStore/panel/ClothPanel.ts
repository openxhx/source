
namespace sellStore {
    import cloth_type = clientCore.CLOTH_TYPE;
    export class ClothPanel implements ISellStorePanel {
        private _mainUI: ui.sellStore.panel.ClothPanelUI;
        private _parent: SellStoreModule;
        private _clothType: number;
        private _tabControl: SellTabControl;
        private _isSearching: boolean = false;
        private _costMap: util.HashMap<number>;

        init(parent: SellStoreModule) {
            this._mainUI = new ui.sellStore.panel.ClothPanelUI();
            this._parent = parent;
            this._parent.addChild(this._mainUI);
            this._mainUI.listCloth.vScrollBarSkin = "";
            this._mainUI.listCloth.renderHandler = new Laya.Handler(this, this.onClothListRender);
            this._mainUI.listCloth.mouseHandler = new Laya.Handler(this, this.onClothListSelect);
            this._mainUI.listCloth.selectHandler = new Laya.Handler(this, this.showLeftView);

            this._mainUI.listDeco.vScrollBarSkin = "";
            this._mainUI.listDeco.renderHandler = new Laya.Handler(this, this.onDecoListRender);
            this._mainUI.listDeco.mouseHandler = new Laya.Handler(this, this.onDecoListSelect);
            this._mainUI.listDeco.selectHandler = new Laya.Handler(this, this.showLeftView);

            this._mainUI.listCoin.renderHandler = new Laya.Handler(this, this.onCoinListRender);

            this.checkTimeDiscount();
            // this._clothType = TAB_BASE_CHILDREN[0];//暂时下掉限时
            this._clothType = TAB_CLOTH_CHILDREN[0];
            if (clientCore.GuideMainManager.instance.isGuideAction && clientCore.GuideMainManager.instance.curGuideInfo.mainID == 10) {
                TAB_CLOTH_CHILDREN
                this._clothType = TAB_CLOTH_CHILDREN[0];
            }
            let hash = this.createTab();
            if (SellStoreModel.instance.shopType == sellStore.CLOTH_STORE_TYPE.GodTreeStore) {
                // hash.remove(TAB_BASE_CHILDREN[0]);
                this._clothType = TAB_CLOTH_CHILDREN[0];
            }
            else if(SellStoreModel.instance.shopType == sellStore.CLOTH_STORE_TYPE.TwinkleStore){
                this._clothType = TAB_CLOTH_CHILDREN[1];
            }
            this._tabControl = new SellTabControl(this._mainUI.boxTabCon, hash, this._clothType, UI_NAME_DIC, new Laya.Handler(this, this.onClothTypeChange));
            this.refreshList(true);
            //新手引导阶段。list不让拖动
            if (clientCore.GuideMainManager.instance.isGuideAction) {
                this._mainUI.listCloth.scrollBar.touchScrollEnable = false;
                this._mainUI.listDeco.scrollBar.touchScrollEnable = false;
            }
            Laya.timer.loop(1000, this, this.onTimer)
            BC.addEvent(this, this._mainUI.btnClear, Laya.Event.CLICK, this, this.onClear);
            BC.addEvent(this, this._mainUI.btnCart, Laya.Event.CLICK, this, this.onCart);
            BC.addEvent(this, this._mainUI.btnBuyAll, Laya.Event.CLICK, this, this.onBuyAll);
            BC.addEvent(this, this._mainUI.btnSearch, Laya.Event.CLICK, this, this.onSearch);
            BC.addEvent(this, this._mainUI.listCloth.scrollBar, Laya.Event.CHANGE, this, this.onListScroll);
            EventManager.on(SellStoreEvent.EV_NEED_REFRESH_LIST, this, this.refreshList, [false]);
            let coinArr = SellStoreModel.instance.currStoreCoinArr;
            this._costMap = new util.HashMap();
            for (const id of coinArr) {
                this._costMap.add(id, 0);
            }
            this._mainUI.listCoin.dataSource = coinArr.slice();
            this._mainUI.listCoin.repeatY = coinArr.length;
            clientCore.UIManager.setMoneyIds(coinArr);
        }

        private createTab() {
            let hash = new util.HashMap<number[] | number>();
            for (const base of TAB_BASE_CHILDREN) {
                let typeArr: any = [];
                if (base == cloth_type.FACE_ARR) {
                    typeArr = TAB_FACE_CHILDREN.slice();
                }
                else if (base == cloth_type.JEWELRY_ARR) {
                    typeArr = TAB_JEWERY_CHILDREN.slice();
                }
                else if (base == cloth_type.DECO_ARR) {
                    typeArr = TAB_DECO_CHILDREN.slice();
                }
                else if (base == cloth_type.CLOTH_ARR) {
                    typeArr = TAB_CLOTH_CHILDREN.slice();
                }
                else {
                    typeArr = base;
                }
                //如果某个部位没有 过滤tab页
                if (typeArr instanceof Array) {
                    //舞台，背景秀，坐骑单独过滤
                    if (base == cloth_type.DECO_ARR)
                        typeArr = _.filter(typeArr, (clothKind) => { return SellStoreModel.instance.getDecoByType(clothKind).length > 0 });
                    //闪耀散件需要过滤没有的
                    if(SellStoreModel.instance.shopType == CLOTH_STORE_TYPE.TwinkleStore)
                        typeArr = _.filter(typeArr, (o: number) => { return SellStoreModel.instance.getClothByType(o).length > 0 });
                    if (typeArr.length > 0)
                        hash.add(base, typeArr)
                }
                else {
                    hash.add(base, typeArr)
                }
            }
            return hash;
        }
        /**前面的参数是大的tab类型，后面的参数是大tab下面的子类 */
        public getTabByType(mTab: number, sTab: number) {
            return this._tabControl.getClothListCell(mTab, sTab);

        }
        /**更新左边的视图 */
        private showLeftView() {
            //代币
            this._costMap = SellStoreModel.instance.getCartFinalPrice();
            this._mainUI.listCoin.startIndex = this._mainUI.listCoin.startIndex;
            this._mainUI.imgRed.visible = SellStoreModel.instance.cartClothes.length > 0;
            this._mainUI.txtCartNum.text = SellStoreModel.instance.cartClothes.length.toString();
        }
        /**检查限时折扣 */
        private checkTimeDiscount() {
            this._mainUI.bgDiscount.visible = this._mainUI.labDiscount.visible = false;
            let item = SellStoreModel.instance.getTimeDisGoods();
            if (item) {
                this._mainUI.bgDiscount.visible = this._mainUI.labDiscount.visible = true;
                this._mainUI.labDiscount.text = `今日购买${item.name}可享受${item.dicount * 10}折优惠`;
            }
        }

        private onTimer() {
            if (this._mainUI.listCloth.visible) {
                this._mainUI.listCloth.startIndex = this._mainUI.listCloth.startIndex;
            }
        }

        private onCoinListRender(cell: Laya.Box, idx: number) {
            let coinId = cell.dataSource as number;
            cell.getChildByName('imgCoin')['skin'] = clientCore.ItemsInfo.getItemIconUrl(coinId);
            cell.getChildByName('txtCoin')['text'] = this._costMap.has(coinId) ? this._costMap.get(coinId) : '0';
        }

        private onBuyAll() {
            let beforeAdd = SellStoreModel.instance.cartClothes;
            for (const id of SellStoreModel.instance.selectClothes) {
                SellStoreModel.instance.pushToCart(id);
            }
            let afterAdd = SellStoreModel.instance.cartClothes;
            if (beforeAdd.length != afterAdd.length)
                alert.showFWords('当前试穿的服装已加入购物车');
            else
                alert.showFWords('没有可打包的新服装');
            this.refreshList(false);
        }

        private onSearch() {
            //当前没有选中，且不在搜索模式下，不让搜索
            if (!this._isSearching && this._mainUI.listCloth.selectedIndex == -1) {
                return;
            }
            this._mainUI.btnSearch.index = 1 - this._mainUI.btnSearch.index;
            let isSearching = this._mainUI.btnSearch.index == 0;
            if (isSearching) {
                let selectItem: xls.clothStore = this._mainUI.listCloth.selectedItem;
                let suitInfo = clientCore.ClothData.getCloth(selectItem.clothId);
                if (suitInfo) {
                    let suit = clientCore.SuitsInfo.getSuitInfo(suitInfo.suitId);
                    if (suit) {
                        this._mainUI.listCloth.dataSource = SellStoreModel.instance.getClothByClothIdArr(suit.clothes);
                        this._mainUI.listCloth.scrollTo(0);
                    }
                    else {
                        console.warn(`没找到套装信息 clothId:${selectItem.clothId}`)
                    }
                }
            }
            else {
                this.onClothTypeChange(this._clothType);
            }
            this._isSearching = isSearching;
            this._mainUI.boxTabCon.alpha = isSearching ? 0.3 : 1;
            this._mainUI.boxTabCon.mouseEnabled = !isSearching;
        }

        private onClear() {
            SellStoreModel.instance.clearCloth();
            this._mainUI.listCloth.selectedIndex = -1;
            this._mainUI.listDeco.selectedIndex = -1;
        }

        private onCart() {
            this._mainUI.imgRed.visible = false;
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClothPanelBuyAllBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            EventManager.event(SellStoreEvent.EV_OPEN_CART);

        }

        private onClothTypeChange(clothType: number) {
            this._clothType = clothType;
            this.refreshList(true);
        }

        private refreshList(scrollToTop: boolean = false) {
            let isDeco = TAB_DECO_CHILDREN.indexOf(this._clothType) > -1;
            this._mainUI.listCloth.visible = !isDeco;
            this._mainUI.listDeco.visible = isDeco;
            if (isDeco) {
                this._mainUI.listDeco.dataSource = SellStoreModel.instance.getDecoByType(this._clothType);
                this._mainUI.listDeco.selectedIndex = _.findIndex(this._mainUI.listDeco.dataSource, (o: any) => {
                    return o.wearing;
                });
                if (scrollToTop)
                    this._mainUI.listDeco.scrollTo(0);
            }
            else {
                this._mainUI.listCloth.dataSource = SellStoreModel.instance.getClothByType(this._clothType);
                // let len = this._mainUI.listCloth.length;
                // this._mainUI.imgTop.visible = false;
                // this._mainUI.imgBot.visible = len > 6;
                this._mainUI.listCloth.selectedIndex = _.findIndex(this._mainUI.listCloth.dataSource, (o: any) => {
                    return o.wearing;
                });
                if (scrollToTop)
                    this._mainUI.listCloth.scrollTo(0);

            }
            this.showLeftView();
            this.checkTimeDiscount();
        }

        private onClothListRender(cell: ui.sellStore.render.ClothRenderUI, idx: number) {
            let info = cell.dataSource as (xls.clothStore & IClothExInfo);
            cell.img.skin = clientCore.ItemsInfo.getItemIconUrl(info.clothId);
            cell.imgHave.visible = info.have;
            cell.imgNew.visible = info.label == 1;
            cell.imgDown.visible = info.label == 3;
            cell.imgWearing.visible = SellStoreModel.instance.selectClothes.indexOf(info.clothId) > -1;
            cell.imgSelect.visible = this._mainUI.listCloth.selectedIndex == idx;
            cell.txtName.text = info.name;
            cell.listStar.repeatX = info.quality;
            cell.imgTime.visible = info.onTimeSell;
            cell.btnCart.visible = !info.have;
            cell.btnCart.index = SellStoreModel.instance.isInCart(info.clothId) ? 1 : 0;
            if (info.onTimeSell) {
                // let time = Math.floor(new Date(info.timeLimit.split(';')[1]?.replace(/\-/g, '/')).getTime() / 1000);
                let time = util.TimeUtil.formatTimeStrToSec(info.timeLimit.split(';')[1]);
                cell.txtTime.text = util.StringUtils.getDateStr(time - clientCore.ServerManager.curServerTime, ':');
            }
            //目前只有2种代币
            for (let i = 0; i < 2; i++) {
                this.setPriceUI(i, info, cell);
            }
        }

        /**
         * 设定clothrender
         * @param idx：第几种代币
         */
        private async setPriceUI(idx: number, data: xls.clothStore, cell: ui.sellStore.render.ClothRenderUI) {
            let priceUI: ui.sellStore.render.PriceRenderUI = cell['boxPrice_' + idx];
            if (data.cost.length > idx) {
                priceUI.visible = true;
                let coinId = data.cost[idx].v1;
                let oriPrice = data.cost[idx].v2;
                let disscountPrice = SellStoreModel.instance.calcuFinalPriceById(data.clothId)[idx].v2;
                let haveDisscount = oriPrice != disscountPrice;
                if (data.dicountTime && data.dicountTime != "") {
                    haveDisscount = haveDisscount && SellStoreModel.instance.checkTimeBetween(data.dicountTime);
                }
                priceUI.boxOriPrice.visible = haveDisscount;
                priceUI.txtPrice.text = haveDisscount ? "" + disscountPrice : oriPrice.toString();
                priceUI.txtOriPrice.text = oriPrice.toString();
                priceUI.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(coinId);
            }
            else {
                priceUI.visible = false;
            }
        }

        private onClothListSelect(e: Laya.Event, idx: number) {
            if (e.type != Laya.Event.CLICK)
                return;
            let info = this._mainUI.listCloth.getItem(idx);
            let cell: any = this._mainUI.listCloth.getCell(idx);
            if (e.target instanceof Laya.Clip) {
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClothPanelCartBtn") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }

                if (SellStoreModel.instance.isInCart(info.clothId))
                    SellStoreModel.instance.removeFromCart(info.clothId);
                else
                    SellStoreModel.instance.pushToCart(info.clothId);
                cell.btnCart.index = SellStoreModel.instance.isInCart(info.clothId) ? 1 : 0;
                this.showLeftView();
            }
            else {
                if (this._mainUI.listCloth.selectedIndex != idx) {
                    this._mainUI.listCloth.getCell(idx)['ani1'].play(0, false);
                    SellStoreModel.instance.upCloth(info.clothId);
                    this._mainUI.listCloth.selectedIndex = idx;
                }
                else {
                    SellStoreModel.instance.downCloth(info.clothId);
                    this._mainUI.listCloth.selectedIndex = -1;
                }
            }
        }

        private onDecoListRender(cell: ui.sellStore.render.ClothRenderUI, idx: number) {
            let info = cell.dataSource as (xls.clothStore & IClothExInfo);
            cell.img.skin = clientCore.ItemsInfo.getItemIconUrl(info.clothId);
            cell.imgHave.visible = info.have;
            cell.imgNew.visible = info.label == 1;
            cell.imgDown.visible = info.label == 3;
            cell.imgWearing.visible = SellStoreModel.instance.selectClothes.indexOf(info.clothId) > -1;
            cell.imgSelect.visible = this._mainUI.listCloth.selectedIndex == idx;
            cell.txtName.text = info.name;
            cell.listStar.repeatX = info.quality;
            cell.imgTime.visible = info.onTimeSell;
            cell.btnCart.visible = !info.have;
            cell.btnCart.index = SellStoreModel.instance.isInCart(info.clothId) ? 1 : 0;
            if (info.onTimeSell) {
                // let time = Math.floor(new Date(info.timeLimit.split(';')[1]?.replace(/\-/g, '/')).getTime() / 1000);
                let time = util.TimeUtil.formatTimeStrToSec(info.timeLimit.split(';')[1]);
                cell.txtTime.text = util.StringUtils.getDateStr(time - clientCore.ServerManager.curServerTime, ':');
            }
            //目前只有2种代币
            for (let i = 0; i < 2; i++) {
                this.setPriceUI(i, info, cell);
            }
        }

        private onDecoListSelect(e: Laya.Event, idx: number) {
            if (e.type != Laya.Event.CLICK)
                return;
            let info = this._mainUI.listDeco.getItem(idx);
            let cell: any = this._mainUI.listDeco.getCell(idx);
            if (e.target instanceof Laya.Clip) {
                if (SellStoreModel.instance.isInCart(info.clothId))
                    SellStoreModel.instance.removeFromCart(info.clothId);
                else
                    SellStoreModel.instance.pushToCart(info.clothId);
                cell.btnCart.index = SellStoreModel.instance.isInCart(info.clothId) ? 1 : 0;
                this.showLeftView();
            }
            else {
                if (this._mainUI.listDeco.selectedIndex != idx) {
                    this._mainUI.listDeco.getCell(idx)['ani1'].play(0, false);
                    SellStoreModel.instance.upDeco(info.clothId);
                    this._mainUI.listDeco.selectedIndex = idx;
                }
                else {
                    SellStoreModel.instance.downDeco(info.clothId);
                    this._mainUI.listDeco.selectedIndex = -1;
                }
            }
        }

        private onListScroll() {
            let scroll = this._mainUI.listCloth.scrollBar;
            // this._mainUI.imgTop.visible = scroll.value > 0;
            // this._mainUI.imgBot.visible = scroll.value < scroll.max;
        }

        guideGetBuyBtn() {
            return { cell: this._mainUI.listCloth.getCell(0), guideRealTarget: this._mainUI.listCloth.getCell(0)["btnCart"] };
            // return this._mainUI.listCloth.getCell(0)["btnCart"];
        }

        getBtnChatCar() {
            return this._mainUI.btnCart;
        }

        show(d: any) {
            this._parent.addChild(this._mainUI);
            this.showLeftView();
        }

        hide() {
            this._parent.removeChild(this._mainUI);
        }

        destory() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
            EventManager.off(SellStoreEvent.EV_NEED_REFRESH_LIST, this, this.refreshList);
        }
    }
}