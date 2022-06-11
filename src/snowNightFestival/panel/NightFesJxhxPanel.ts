namespace snowNightFestival {
    export class NightFesJxhxPanel extends ui.snowNightFestival.panel.NightFesJxhxPanelUI {
        private _model: SnowNightFestivalModel;
        private _person: clientCore.Person;
        private curWearIds: number[] = [];
        private clothBuyIds: number[];
        private buyCarPanel: ShopCarPanel;
        constructor(sign: number) {
            super();
            this.addEventListeners();
            this.buyCarPanel = new ShopCarPanel(sign);
            this._model = clientCore.CManager.getModel(sign) as SnowNightFestivalModel;
            this.initUI();
        }

        private initUI() {
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this._person.scale(0.6, 0.6);
            this._person.x = 150;
            this._person.y = 210;
            this.boxImage.addChild(this._person);
            this.clothBuyIds = [2395, 2396];
            for (let i: number = 2403; i <= 2411; i++) {
                this.clothBuyIds.push(i);
            }
            this.listGoods.vScrollBarSkin = "";
            this.listGoods.renderHandler = new Laya.Handler(this, this.goodsRender);
            this.listGoods.mouseHandler = new Laya.Handler(this, this.goodsMouse);
        }

        public onShow() {
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.listGoods.array = this.clothBuyIds;
            this.setPrice();
        }

        /**商品列表渲染 */
        private goodsRender(item: ui.snowNightFestival.render.ShopItemUI) {
            let id: number = item.dataSource;
            let config = xls.get(xls.eventExchange).get(id);
            let reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty : config.maleProperty;
            item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            if (xls.get(xls.itemCloth).has(reward[0].v1)) {
                item.list.visible = true;
                item.list.repeatX = clientCore.ClothData.getCloth(reward[0].v1).xlsInfo.quality;
                item.labName.text = clientCore.ClothData.getCloth(reward[0].v1).xlsInfo.name;
                item.imgHad.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
                item.imgTrying.visible = this._person.getWearginIds().indexOf(reward[0].v1) >= 0;
                item.labType.text = "服装部件";
            } else if (xls.get(xls.manageBuildingId).has(reward[0].v1)) {
                let info = xls.get(xls.manageBuildingId).get(reward[0].v1);
                item.imgTrying.visible = false;
                item.list.visible = false;
                item.labName.text = info.name;
                item.imgHad.visible = false;
                item.imgTrying.visible = false;
                item.labType.text = "家园装饰";
            } else {
                item.labType.text = "背景秀/舞台";
            }
            item.btnAdd.visible = this._model.buyCarInfo.indexOf(id) < 0 && !item.imgHad.visible;
            item.btnPop.visible = !item.btnAdd.visible && !item.imgHad.visible;
            item.labPrice.text = config.cost[0].v2.toString();
            BC.addEvent(this, item.imgIcon, Laya.Event.CLICK, this, this.previewCloth, [reward[0].v1]);
            BC.addEvent(this, item.btnAdd, Laya.Event.CLICK, this, this.addToCar, [1, id]);
            BC.addEvent(this, item.btnPop, Laya.Event.CLICK, this, this.addToCar, [0, id]);
        }

        /**商品列表点击 */
        private goodsMouse(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let item = this.listGoods.getCell(index) as any;
                if (e.target.mouseY > 244) {
                    if (item.btnAdd.visible) {
                        this.addToCar(1, item.dataSource);
                    } else if (item.btnPop.visible) {
                        this.addToCar(0, item.dataSource);
                    }
                } else {
                    let config = xls.get(xls.eventExchange).get(item.dataSource);
                    let reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty : config.maleProperty;
                    this.previewCloth(reward[0].v1);
                }
            }
        }

        /**预览部件 */
        private previewCloth(id: number) {
            if (xls.get(xls.itemCloth).has(id)) {
                this.imgGoods.visible = false;
                this._person.visible = true;
                this._person.upById(id);
                this.listGoods.refresh();
            } else {
                this.imgGoods.skin = clientCore.ItemsInfo.getItemIconUrl(id);
                this.imgGoods.visible = true;
                this._person.visible = false;
            }
        }

        /**加入购物车 */
        private addToCar(flag: number, id: number) {
            if (flag) {
                if (this._model.buyCarInfo.length >= 6) {
                    alert.showFWords("你的购物车已经满了！先去结算吧！");
                    return;
                }
                if (this._model.buyCarInfo.indexOf(id) >= 0) return;
                this._model.buyCarInfo.push(id);
            } else {
                _.remove(this._model.buyCarInfo, (o) => { return o == id });
            }
            this.setPrice();
            this.listGoods.refresh();
        }

        /**计算购物车价格 */
        private setPrice() {
            let price = 0;
            for (let i: number = 0; i < this._model.buyCarInfo.length; i++) {
                price += xls.get(xls.eventExchange).get(this._model.buyCarInfo[i]).cost[0].v2;
            }
            this.labPrice.text = price.toString();
            this.labCarNum.text = this._model.buyCarInfo.length.toString();
        }

        /**还原形象 */
        private backImage() {
            this._person.downAllCloth();
            this._person.replaceByIdArr(clientCore.LocalInfo.wearingClothIdArr);
            this.listGoods.refresh();
        }

        /**打开购物车 */
        private openBuyCar() {
            this.buyCarPanel.show();
            this.buyCarPanel.once(Laya.Event.CLOSE, this, () => {
                this.setPrice();
                this.listGoods.refresh();
            })
        }

        public hide() {
            clientCore.UIManager.releaseCoinBox();
            this.visible = false;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnToBack, Laya.Event.CLICK, this, this.backImage);
            BC.addEvent(this, this.btnCar, Laya.Event.CLICK, this, this.openBuyCar);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            this._person.destroy();
            this._person = null;
        }
    }
}