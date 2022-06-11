namespace sellStore {
    export class CartPanel implements ISellStorePanel {
        private _mainUI: ui.sellStore.panel.ShoppingCartPanelUI;
        private _parent: SellStoreModule;
        private _finalSelect: number[];

        init(parent: SellStoreModule) {
            this._mainUI = new ui.sellStore.panel.ShoppingCartPanelUI();
            this._parent = parent;
            this._parent.addChild(this._mainUI);
            this._mainUI.list.vScrollBarSkin = "";
            this._mainUI.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this._mainUI.list.mouseHandler = new Laya.Handler(this, this.onListClick);
            BC.addEvent(this, this._mainUI.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this._mainUI.btnAll, Laya.Event.CLICK, this, this.onAll);
            BC.addEvent(this, this._mainUI.btnSure, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this._mainUI.btnClear, Laya.Event.CLICK, this, this.onClearAll);
            EventManager.on(SellStoreEvent.EV_NEED_REFRESH_LIST, this, this.refreshView);
            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
            this._mainUI.listPrice.renderHandler = new Laya.Handler(this, this.onPriceRender);
            this._mainUI.listPrice.dataSource = [];
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "sellStoreCatPanel") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this._mainUI[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
            }
        }

        private onAll() {
            if (this._mainUI.imgAll.visible) this._finalSelect = [];
            else this._finalSelect = SellStoreModel.instance.cartClothes;
            this._mainUI.list.refresh();
            this.refreshView();
        }

        private onListRender(cell: ui.sellStore.render.CartRenderUI, idx: number) {
            let id = cell.dataSource as number;
            let info = SellStoreModel.instance.getStoreInfoByClothId([id])[0];
            cell.img.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            if (SellStoreModel.instance.xlsCloth.get(id)) {
                cell.txtName.text = SellStoreModel.instance.xlsCloth.get(id).name;
            } else if (SellStoreModel.instance.xlsBgshow.get(id)) {
                cell.txtName.text = SellStoreModel.instance.xlsBgshow.get(id).name;
            }
            cell.imgSelect.visible = this._finalSelect.indexOf(id) > -1;
            cell.img.skin = clientCore.ItemsInfo.getItemIconUrl(info.clothId);
            let prices = SellStoreModel.instance.calcuFinalPriceById(id);
            cell.box1.visible = prices.length == 1;
            cell.box2.visible = prices.length == 2;
            if (prices.length == 1) {
                this.setPrice(cell.box1, prices[0]);
            } else {
                for (let i = 0; i < 2; i++) {
                    this.setPrice(cell.box2.getChildAt(i) as Laya.Box, prices[i]);
                }
            }
        }

        private setPrice(box: Laya.Box, price: xls.pair) {
            (box.getChildByName(
                "img"
            ) as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(price.v1);
            (box.getChildByName("txt") as Laya.Label).text = price.v2 + " ";
        }

        private onListClick(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == "btnSelect") {
                let id = this._mainUI.list.getItem(idx);
                if (this._finalSelect.indexOf(id) == -1) this._finalSelect.push(id);
                else _.pull(this._finalSelect, id);
                this._mainUI.list.refresh();
                this.refreshView();
            }
        }

        private async onBuy() {
            let needFairyBeanNum = _.find(this._mainUI.listPrice.array, (o) => { return parseInt(o[0]) == clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID }) ?? [0];
            let needClothMoneyNum = _.find(this._mainUI.listPrice.array, (o) => { return parseInt(o[0]) == clientCore.MoneyManager.CLOTH_MONEY_ID }) ?? [0];
            needFairyBeanNum = needFairyBeanNum[1];
            needClothMoneyNum = needClothMoneyNum[1];
            let curPrice: [string, number][] = this._mainUI.listPrice.dataSource;
            let realPrice = this.getCurPrice();
            for (let i: number = 0; i < curPrice.length; i++) {
                //先判断价格对不对
                if (!realPrice.get(curPrice[i][0]) || curPrice[i][1] != realPrice.get(curPrice[i][0])) {
                    alert.showFWords("部分商品价格0点后发生变动，请重新选择");
                    this._mainUI.list.refresh();
                    this.refreshView();
                    EventManager.event(SellStoreEvent.EV_NEED_REFRESH_LIST);
                    return;
                }
                //再判断货币够不够
                let has: number = clientCore.ItemsInfo.getItemNum(parseInt(curPrice[i][0]));
                let cost = realPrice.get(curPrice[i][0]);
                if (has < cost) {
                    alert.showFWords(clientCore.ItemsInfo.getItemName(parseInt(curPrice[i][0])) + "不足！");
                    return;
                }
            }
            // //先判断仙豆是否足够
            // if (needFairyBeanNum > 0) {
            //     let has: number = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID);
            //     let diff: number = needFairyBeanNum - has;
            //     if (diff > 0) {
            //         alert.alertQuickBuy(
            //             clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID,
            //             diff,
            //             true
            //         );
            //         return;
            //     }
            // }

            // //再判断仙豆是否足够
            // if (needClothMoneyNum > 0) {
            //     let has = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.CLOTH_MONEY_ID);
            //     let diff = needClothMoneyNum - has;
            //     if (diff > 0) {
            //         if (
            //             !clientCore.LittleRechargManager.instacne.checkCanShow(3) ||
            //             clientCore.LocalInfo.userLv < 8
            //         ) {
            //             alert.alertQuickBuy(
            //                 clientCore.MoneyManager.CLOTH_MONEY_ID,
            //                 diff,
            //                 true
            //             );
            //         } else {
            //             clientCore.LittleRechargManager.instacne.activeWindowById(3);
            //         }
            //         return;
            //     }
            // }

            if (
                clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickCatPanelSureBtn"
            ) {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            if (this._finalSelect.length > 0) {
                this.onClose();
                let buyOk = await SellStoreModel.instance.buyCloth(this._finalSelect);
                if (!buyOk) return;
                if (!clientCore.GuideMainManager.instance.isGuideAction)
                    /**新手的时候，把衣服穿起来隐藏 */
                    alert.showSmall("是否立刻穿上当前试穿服装?", {
                        callBack: { caller: this, funArr: [this.putOnAll, this.onClose] }
                    });
            }
        }

        private putOnAll() {
            let currTryClothes = SellStoreModel.instance.selectClothes;
            let canPutOnAll = true;
            for (const id of currTryClothes) {
                if (!clientCore.ItemsInfo.checkHaveItem(id)) {
                    canPutOnAll = false;
                    break;
                }
            }
            if (canPutOnAll) {
                let arr = SellStoreModel.instance.actualWearingClothes;
                net.sendAndWait(new pb.cs_save_user_clothes({ clothesid: arr }))
                    .then(() => {
                        clientCore.LocalInfo.wearingClothIdArr = arr;
                        EventManager.event(globalEvent.USER_CHANGE_CLOTH);
                        alert.showSmall("换装成功!", { btnType: alert.Btn_Type.ONLY_SURE });
                    });
                let arrDeo = SellStoreModel.instance.curBgStage;
                if (arrDeo.length > 0) {
                    clientCore.BgShowManager.instance.setCurrDecoShow(arrDeo).then(() => {
                        EventManager.event(globalEvent.USER_CHANGE_CLOTH);
                    }).catch(() => { })
                }
            } else {
                alert.showSmall("你尚未拥有部分服装!", {
                    btnType: alert.Btn_Type.ONLY_SURE
                });
            }
            this.onClose();
        }

        private onClose() {
            this.hide();
            // if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSellStoreModuleSureBtn") {
            //     EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            // }
        }

        private onClearAll() {
            SellStoreModel.instance.clearCart();
            this._finalSelect = SellStoreModel.instance.cartClothes;
            this._mainUI.list.dataSource = this._finalSelect.slice();
            this.refreshView();
            EventManager.event(SellStoreEvent.EV_NEED_REFRESH_LIST);
        }

        show(d?: any) {
            this._parent.addChild(this._mainUI);
            this._finalSelect = SellStoreModel.instance.cartClothes;
            this._mainUI.list.dataSource = this._finalSelect.slice();
            this.refreshView();
        }

        private refreshView() {
            let select = SellStoreModel.instance.cartClothes;
            this._mainUI.imgAll.visible = _.difference(select, this._finalSelect).length == 0 && select.length > 0;
            let priceMap = this.getCurPrice();
            this._mainUI.listPrice.dataSource = priceMap.toArray();
        }

        private getCurPrice() {
            //算价格
            let priceMap = new util.HashMap<number>();
            for (const clothId of this._finalSelect) {
                let priceArr = SellStoreModel.instance.calcuFinalPriceById(clothId);
                for (const priceInfo of priceArr) {
                    let coinId = priceInfo.v1;
                    let price = priceInfo.v2;
                    let prePrice = priceMap.has(coinId) ? priceMap.get(coinId) : 0;
                    priceMap.add(coinId, price + prePrice);
                }
            }
            return priceMap;
        }

        private onPriceRender(cell: Laya.Box, idx: number) {
            let data = cell.dataSource as [string, number];
            cell.getChildByName('txtPrice')['text'] = data[1].toString();
            cell.getChildByName('imgCoin')['skin'] = clientCore.ItemsInfo.getItemIconUrl(parseInt(data[0]));
        }

        hide() {
            this._parent.removeChild(this._mainUI);
        }
        getSureBtn() {
            return this._mainUI.btnSure;
        }
        destory() {
            BC.removeEvent(this);
            EventManager.off(
                SellStoreEvent.EV_NEED_REFRESH_LIST,
                this,
                this.refreshView
            );
        }
    }
}
