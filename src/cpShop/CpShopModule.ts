namespace cpShop {
    enum SHOP {
        SUIT,
        BGSHOW,
        MOUNT,
        ITEM,
        RING
    }

    /**
     * cp商场
     */
    export class CpShopModule extends ui.cpShop.CpShopModuleUI {

        private _bgshow: Laya.Image;
        private _person: clientCore.Person;
        private _currentTab: SHOP;
        private _currentSel: number;
        private _cpID: number; //cp的UID
        private _ringSk: clientCore.Bone;

        constructor() { super(); }

        init(): void {
            this.shopList.vScrollBarSkin = '';
            this.shopList.renderHandler = new Laya.Handler(this, this.shopRender, null, false);
            this.shopList.mouseHandler = new Laya.Handler(this, this.shopMouse, null, false);
            this.addPreLoad(xls.load(xls.cpShop));
            this.addPreLoad(xls.load(xls.cpRing));
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver(): void {
            this._cpID = clientCore.CpManager.instance.cpID;
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this._person.scale(0.45, 0.45);
            this.spPerson.addChild(this._person);

            this._bgshow = new Laya.Image();
            this._bgshow.anchorX = this._bgshow.anchorY = 0.5;
            this._bgshow.scale(0.25, 0.25);
            this.spPerson.addChild(this._bgshow);
            this.initTab();
            this.onShowTab(SHOP.RING);
        }

        private _letterPanel: LetterPreviewPanel;
        private onPrevLetter() {
            let data: xls.cpShop = this.shopList.array[this._currentSel];
            this._letterPanel = this._letterPanel || new LetterPreviewPanel();
            this._letterPanel.show(data.items[0].v1);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnLetter, Laya.Event.CLICK, this, this.onPrevLetter);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnReset, Laya.Event.CLICK, this, this.onReset);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.shopList.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            for (let i: number = 0; i < 5; i++) {
                BC.addEvent(this, this['tab' + i], Laya.Event.CLICK, this, this.onShowTab, [i]);
            }
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            clientCore.UIManager.releaseCoinBox();
            this._bgshow.destroy();
            this._person.destroy();
            this._person = this._bgshow = null;
            this._letterPanel?.destroy();
            this._ringSk?.dispose();
            super.destroy();
        }

        private shopRender(item: ui.cpShop.render.ShopItemUI, index: number): void {
            let data: xls.cpShop = this.shopList.array[index];
            item.imgIcon.skin = this._currentTab == SHOP.SUIT ? pathConfig.getSuitImg(data.items[0].v1, clientCore.LocalInfo.sex) : clientCore.ItemsInfo.getItemIconUrl(data.items[0].v1);
            item.imgIcon.scaleX = item.imgIcon.scaleY = this._currentTab == SHOP.SUIT ? 0.6 : 1;
            item.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(data.cost.v1);
            item.txCost.changeText(data.discount + '');
            item.imgWedding.visible = _.findIndex(data.unlock, o => o.v1 == 3) != -1;
            item.nameTxt.changeText(clientCore.ItemsInfo.getItemName(data.items[0].v1));

            let isHas: boolean = this.checkIsHave(data.items[0].v1);
            item.imgHas.visible = isHas && this._currentTab != SHOP.ITEM;
            item.boxLock.visible = this.checkBuy(data.unlock).lock;
            if (item.boxLock.visible) {
                _.forEach(data.unlock, (element) => {
                    element.v1 == 2 && item.conTxt.changeText(`花缘羁绊值达到${element.v2}`);
                    element.v1 == 3 && item.conTxt.changeText(`预约过结缘礼`);
                })
            }
            //星级
            item.starList.width = 27 * data.star;
            item.starList.array = new Array(data.star);
            //附带效果
            item.effectTxt.visible = this._currentTab == SHOP.RING;
            item.effectTxt.visible && item.effectTxt.changeText(xls.get(xls.cpRing).get(data.items[0].v1).attachDesc);
            //折扣
            item.txOrigi.visible = item.imgDiscount.visible = data.discount != data.cost.v2;
            item.txOrigi.visible && item.txOrigi.changeText(`(原价:${data.cost.v2})`);
            //奇趣道具显示数量
            item.boxItem.visible = this._currentTab == SHOP.ITEM;
            item.boxItem.visible && item.txItem.changeText(`拥有:${clientCore.ItemsInfo.getItemNum(data.items[0].v1)}`);
        }


        private checkBuy(data: xls.pair[]): { lock: boolean, type?: number, value?: number } {
            if (this._cpID == 0 && this._currentTab != SHOP.RING) {
                return { lock: true, type: 3 };
            }
            let len: number = data.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.pair = data[i];
                if (element.v1 == 1 && clientCore.LocalInfo.userLv < element.v2) { //等级   
                    return { lock: true, type: 1, value: element.v2 };
                }
                if (element.v1 == 2) { //与cp的羁绊值
                    let info: pb.Ifriend_t = clientCore.FriendManager.instance.getFriendInfoById(this._cpID);
                    if (info.friendShip < element.v2) return { lock: true, type: 2, value: element.v2 };
                }
                if (element.v1 == 3) {//是否办过婚礼
                    return { lock: !clientCore.CpManager.instance.haveWedding, type: 3, value: element.v2 };
                }
            }
            return { lock: false };
        }

        private shopMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK || this._currentSel == index) return;
            this.select(index);
        }

        private select(index: number): void {
            let data: xls.cpShop = this.shopList.array[index];
            switch (this._currentTab) {
                case SHOP.SUIT:
                    let info: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(data.items[0].v1);
                    this._person.replaceByIdArr(info.clothes);
                    break;
                case SHOP.BGSHOW:
                    let config = xls.get(xls.bgshow).get(data.items[0].v1);
                    if (config.fullScreen) {
                        this._bgshow.anchorX = this._bgshow.anchorY = 0;
                        this._bgshow.pos(-config.showParameters[0] / 2 * 0.25, -config.showParameters[1] / 2 * 0.25);
                    } else {
                        this._bgshow.anchorX = this._bgshow.anchorY = 0.5;
                        this._bgshow.pos(0, 0);
                    }
                    this._bgshow.skin = clientCore.ItemsInfo.getItemUIUrl(data.items[0].v1);

                    break;
                case SHOP.RING:
                    if (clientCore.CpManager.checkHaveRingEffect(data.items[0].v1)) {
                        this.txtNoRingEffect.visible = false;
                        this._ringSk?.dispose();
                        this._ringSk = clientCore.BoneMgr.ins.play(pathConfig.getCpRingSk(data.items[0].v1), 0, true, this);
                        this._ringSk.pos(this.txtNoRingEffect.x, this.txtNoRingEffect.y);
                    }
                    else {
                        this.txtNoRingEffect.visible = true;
                        this._ringSk?.dispose();
                    }
                    break;
                case SHOP.ITEM:
                    this._ringSk?.dispose();
                    this._ringSk = clientCore.BoneMgr.ins.play(pathConfig.getFunnyToySk(data.items[0].v1), 0, true, this);
                    this._ringSk.pos(this.txtNoRingEffect.x, this.txtNoRingEffect.y);
                    break;
            }
            this.imgWedding.visible = _.findIndex(data.unlock, o => o.v1 == 3) != -1;
            this._currentSel = index;
            this.btnBuy.disabled = this._cpID == 0 && this._currentTab != SHOP.RING;
            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(data.cost.v1);
            this.shopList.getCell(index).addChild(this.imgSel);
            //折扣
            this.txDiscountPrice.visible = this.imgLine.visible = data.cost.v2 != data.discount;
            if (this.imgLine.visible) {
                this.txDiscountPrice.changeText(data.discount + '');
                this.txCost.pos(792, 579);
                this.txCost.fontSize = 20;
            } else {
                this.txCost.pos(792, 567);
                this.txCost.fontSize = 28;
            }
            this.txCost.changeText(data.cost.v2 + '');
        }

        private initTab(): void {
            let array: xls.cpShop[] = xls.get(xls.cpShop).getValues();
            for (let i: number = 0; i < 5; i++) {
                this['tab' + i].gray = _.filter(array, (element) => { return element.tabId == i + 1; }).length == 0;
            }
        }

        private onShowTab(index: number): void {
            if (this._currentTab == index) return;
            let array: xls.cpShop[] = _.filter(xls.get(xls.cpShop).getValues(), (element) => { return element.tabId == index + 1; });
            if (array.length <= 0) {
                alert.showFWords('当前暂未开放 敬请期待~');
                return;
            }
            this._currentTab = index;
            this.ani1.gotoAndStop(index);
            this.shopList.array = array;
            this.btnReset.visible = this._person.visible = index == SHOP.SUIT;
            this.txtNoRingEffect.visible = index == SHOP.RING;
            if (index != SHOP.RING)
                this._ringSk?.dispose();
            this.btnLetter.visible = index == SHOP.RING;
            this._bgshow.visible = index == SHOP.BGSHOW;
            this.imgDesc.visible = index == SHOP.SUIT;
            this.txDesc.visible = index == SHOP.RING;
            switch (index) {
                case SHOP.RING:
                    this.txDesc.changeText('*花缘之戒的特殊效果需装备后与花缘对象在同一地图时生效 * 鹊遥之戒首周七折优惠');
                    break;
                default:
                    break;
            }
            this.select(0);
        }

        /** 购买*/
        private onBuy(): void {
            let data: xls.cpShop = this.shopList.array[this._currentSel];
            if (!data) {
                alert.showFWords('请小花仙先选择商品哟~');
                return;
            }
            //判断是否已拥有
            if (this.checkIsHave(data.items[0].v1) && this._currentTab != SHOP.ITEM) {
                alert.showFWords('小花仙你已经拥有该物品啦~');
                return;
            }
            //判断条件是否满足
            let buyInfo: { lock: boolean, type?: number, value?: number } = this.checkBuy(data.unlock);
            if (buyInfo.lock) {
                if (buyInfo.type == 3) {
                    alert.showFWords('小花仙需要先举行结缘礼才可购买哦~');
                } else {
                    alert.showFWords(buyInfo.type == 1 ? `小花仙等级需达到${buyInfo.value}才可以购买哟~` : `小花仙需和花缘对象羁绊达到${buyInfo.value}才可以购买哟~`);
                }
                return;
            }
            //判断物品是否充足
            let itemID: number = data.cost.v1;
            let useCnt: number = data.discount;
            let has: number = clientCore.ItemsInfo.getItemNum(itemID);
            if (has < useCnt) {
                alert.showFWords(`小花仙你的${clientCore.ItemsInfo.getItemName(itemID)}不足哟~`);
                return;
            }

            alert.showSmall(`是否花费 ${clientCore.ItemsInfo.getItemName(itemID)}x${useCnt} 购买商品？`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        net.sendAndWait(new pb.cs_cp_shop_buy_item({ index: data.id, num: 1 })).then((msg: pb.sc_cp_shop_buy_item) => {
                            this.shopList.changeItem(this._currentSel, data);
                            if (this._currentTab == SHOP.SUIT) {
                                let info: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(data.items[0].v1);
                                let array: clientCore.GoodsInfo[] = [];
                                _.forEach(info.clothes, (element) => { array.push(new clientCore.GoodsInfo(element, 1)) })
                                alert.showReward(array);
                                return;
                            }
                            alert.showReward(clientCore.GoodsInfo.createArray(msg.itms));
                        });
                    }]
                }
            })
        }

        /**
         * 判断是否拥有
         * @param itemID 
         */
        private checkIsHave(itemID: number): boolean {
            if (this._currentTab == SHOP.SUIT) {
                let info: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(itemID);
                return info.allGet;
            } else {
                return clientCore.ItemsInfo.getItemNum(itemID) > 0;
            }
        }

        private onReset(): void {
            this._person.replaceByIdArr(clientCore.LocalInfo.wearingClothIdArr);
        }

        private onScroll(): void {
            let scroll: Laya.ScrollBar = this.shopList.scrollBar;
            if (scroll.max == 0) return;
            this.imgBar.y = 93 + 425 * scroll.value / scroll.max;
        }

        private onRule(): void {
            alert.showRuleByID(12);
        }
    }

    class LetterPreviewPanel extends ui.cpShop.panel.LetterPanelUI {
        show(ringid: number) {
            clientCore.DialogMgr.ins.open(this);
            this.imgLetter.skin = pathConfig.getCpLetterImg(ringid);
            this.txtContent.text = xls.get(xls.cpRing).get(ringid)?.content ?? '';
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}