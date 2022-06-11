namespace bigCharge {
    export class ShopPanel extends ui.bigCharge.panel.ShopPanelUI {
        private _person: clientCore.Person;
        private curWearIds: number[] = [];
        private clothBuyIds: number[];
        private buyCarPanel: ShopCarPanel;

        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this._person.scale(0.5, 0.5);
            this._person.x = 150;
            this._person.y = 200;
            this.boxImage.addChild(this._person);
            this.clothBuyIds = [];
            for (let i: number = 2849; i <= 2853; i++) {
                this.clothBuyIds.push(i);
            }
            for (let i: number = 2813; i <= 2816; i++) {
                this.clothBuyIds.push(i);
            }
            for (let i: number = 2792; i <= 2795; i++) {
                this.clothBuyIds.push(i);
            }
            for (let i: number = 2771; i <= 2776; i++) {
                this.clothBuyIds.push(i);
            }
            for (let i: number = 2756; i <= 2760; i++) {
                this.clothBuyIds.push(i);
            }
            for (let i: number = 2742; i <= 2746; i++) {
                this.clothBuyIds.push(i);
            }
            for (let i: number = 2722; i <= 2726; i++) {
                this.clothBuyIds.push(i);
            }
            for (let i: number = 2698; i <= 2709; i++) {
                this.clothBuyIds.push(i);
            }
            this.clothBuyIds.sort(this.sortByGet);
            this.listGoods.vScrollBarSkin = "";
            this.listGoods.renderHandler = new Laya.Handler(this, this.goodsRender);
            this.listGoods.mouseHandler = new Laya.Handler(this, this.goodsMouse);
            this.listGoods.array = this.clothBuyIds;
            this.setPrice();
        }
        show() {
            clientCore.UIManager.setMoneyIds([BigChargeModel.instance.coinid]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年7月2日活动', '【付费】暑假大充', '打开夏日小铺面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        private sortByGet(a: number, b: number) {
            let configA = xls.get(xls.eventExchange).get(a);
            let rewardA = clientCore.LocalInfo.sex == 1 ? configA.femaleProperty[0].v1 : configA.maleProperty[0].v1;
            let configB = xls.get(xls.eventExchange).get(b);
            let rewardB = clientCore.LocalInfo.sex == 1 ? configB.femaleProperty[0].v1 : configB.maleProperty[0].v1;
            return clientCore.ItemsInfo.getItemNum(rewardA) - clientCore.ItemsInfo.getItemNum(rewardB);
        }

        /**商品列表渲染 */
        private goodsRender(item: ui.bigCharge.render.ShopItemUI) {
            let id: number = item.dataSource;
            let config = xls.get(xls.eventExchange).get(id);
            let reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty : config.maleProperty;
            item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            item.imgTrying.visible = this.curWearIds.indexOf(reward[0].v1) > 0;
            item.list.repeatX = clientCore.ClothData.getCloth(reward[0].v1).xlsInfo.quality;
            item.labName.text = clientCore.ClothData.getCloth(reward[0].v1).xlsInfo.name;
            item.imgHad.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
            item.btnAdd.visible = BigChargeModel.instance.buyCarInfo.indexOf(id) < 0 && !item.imgHad.visible;
            item.btnPop.visible = !item.btnAdd.visible && !item.imgHad.visible;
            item.labPrice.text = config.cost[0].v2.toString();
            item.imgTrying.visible = this._person.getWearginIds().indexOf(reward[0].v1) >= 0;
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
            this._person.upById(id);
            this.listGoods.refresh();
        }

        /**加入购物车 */
        private addToCar(flag: number, id: number) {
            if (flag) {
                if (BigChargeModel.instance.buyCarInfo.length >= 6) {
                    alert.showFWords("你的购物车已经满了！先去结算吧！");
                    return;
                }
                if (BigChargeModel.instance.buyCarInfo.indexOf(id) >= 0) return;
                BigChargeModel.instance.buyCarInfo.push(id);
            } else {
                _.remove(BigChargeModel.instance.buyCarInfo, (o) => { return o == id });
            }
            this.setPrice();
            this.listGoods.refresh();
        }

        /**计算购物车价格 */
        private setPrice() {
            let price = 0;
            for (let i: number = 0; i < BigChargeModel.instance.buyCarInfo.length; i++) {
                price += xls.get(xls.eventExchange).get(BigChargeModel.instance.buyCarInfo[i]).cost[0].v2;
            }
            this.labPrice.text = price.toString();
            this.labCnt.text = BigChargeModel.instance.buyCarInfo.length.toString();
        }

        /**还原形象 */
        private backImage() {
            this._person.downAllCloth();
            this._person.replaceByIdArr(clientCore.LocalInfo.wearingClothIdArr);
            this.listGoods.refresh();
        }

        /**打开购物车 */
        private openBuyCar() {
            if (!this.buyCarPanel) this.buyCarPanel = new ShopCarPanel();
            this.buyCarPanel.show();
            this.buyCarPanel.once(Laya.Event.CLOSE, this, () => {
                this.setPrice();
                this.listGoods.refresh();
            })
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1193);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnToBack, Laya.Event.CLICK, this, this.backImage);
            BC.addEvent(this, this.btnCar, Laya.Event.CLICK, this, this.openBuyCar);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            this.buyCarPanel?.destroy();
            this._person.destroy();
            this.buyCarPanel = this._person = null;
            super.destroy();
        }
    }
}