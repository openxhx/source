namespace commonShop {
    export class CommonShopModule extends ui.commonShop.CommonShopModuleUI {
        /**
         * commonShop.CommonShopModule
         */
        private _shopID: number;
        private _shopInfo: xls.commonShopID;
        private _shopDataArr: CommonSingleData[][];

        private _curSelectTabIndex: number = -1;
        private _limitInfoHashMap: util.HashMap<number>;

        private _select: number;
        constructor() {
            super();
        }
        init(d: any) {
            super.init(d);
            if (d) {
                this._shopID = d;
                if (this._shopID == 7) this.needOpenMod = "restaurant.RestaurantModule";
                if (this._shopID == 8 || this._shopID == 9) this.needOpenMod = "twinkleTransfg.TwinkleTransfgModule";
            }
            this.list.itemRender = CommonShopItem;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.selectHandler = Laya.Handler.create(this, this.listSelect, null, false);
            this.addPreLoad(xls.load(xls.commonShopID));
            this.addPreLoad(xls.load(xls.CommonShopData));
            this.imgRule.visible = false;
        }
        popupOver() {
            clientCore.UIManager.showCoinBox();
            this.imgRule.visible = xls.get(xls.commonShopID).get(this._shopID).ruleID > 0;
        }
        public async seqPreLoad() {
            this._shopInfo = xls.get(xls.commonShopID).get(this._shopID);
            await this.getLimit();
        }
        onPreloadOver() {
            this._shopDataArr = [];
            for (let i = 0; i < this._shopInfo.tabArr.length; i++) {
                this._shopDataArr.push(this.findShopDataByTab(this._shopInfo.tabArr[i]));
            }
            this.initTabs();
            // alert.showFWords("转化前的数组："+this._shopInfo.costCurrency.toString());
            clientCore.UIManager.setMoneyIds([...this._shopInfo.costCurrency]);
            this._curSelectTabIndex = 0;
            this.showTab();
            this.imgNpc.skin = "res/commonShop/npc/npc_" + this._shopInfo.npcID[clientCore.LocalInfo.sex - 1] + ".png";
            if( this._shopInfo.shopID == 6){
                this.imgShopTitle.skin = "commonShop/shopTitle_4.png";
            }else{
                this.imgShopTitle.skin = "commonShop/shopTitle_" + this._shopInfo.shopID + ".png";
            }
            Laya.timer.loop(1000, this, this.refreshTime);
        }
        private initTabs() {
            for (let i = 0; i < 3; i++) {
                if (i >= this._shopInfo.tabArr.length) {
                    this["mcTab_" + i].visible = false;
                }
            }
            this.mcLine_1.visible = this._shopInfo.tabArr.length > 1;
            this.mcLine_2.visible = this._shopInfo.tabArr.length > 2;
        }
        refreshTime() {
            this.list.startIndex = this.list.startIndex;
        }
        private findShopDataByTab(tabid: number): CommonSingleData[] {
            let arr: CommonSingleData[] = [];
            let allShopData = xls.get(xls.CommonShopData).getValues();
            for (let i = 0; i < allShopData.length; i++) {
                if (allShopData[i].tab == tabid && (allShopData[i].sex == 0 || allShopData[i].sex == clientCore.LocalInfo.sex)) {
                    let data = new CommonSingleData(allShopData[i]);
                    arr.push(data);
                }
            }
            arr = _.sortBy(arr.reverse(), ["tag"]).reverse();
            for (let i = arr.length - 1; i >= 0; i--) {
                /** 买完了。显示已售罄，不隐藏这个购买项 ,如果需要隐藏，把这段代码放出来*/
                // if (arr[i].xlsData.limitation.v1 == 3) {
                //     if (this._limitInfoHashMap.has(arr[i].xlsData.id)) {
                //         if (this._limitInfoHashMap.get(arr[i].xlsData.id) >= arr[i].xlsData.limitation.v2) {
                //             arr.splice(i, 1);
                //             continue;
                //         }
                //     }
                // }

                let itemID = arr[i].xlsData.itemId;
                let itemInfo = xls.get(xls.itemBag).get(itemID);
                /**花精灵如果拥有 */
                if (itemInfo && itemInfo.kind == 23) {
                    if (clientCore.ItemBagManager.getFairyNum(itemID) !== null)
                        arr.splice(i, 1);
                }
            }
            /** 特殊处理，如果服装已经拥有了。后台返的数据有问题，这里校验下，把已经拥有的服装放到限量里面 */
            for (const dataInfo of arr) {
                let itemID = dataInfo.xlsData.itemId;
                if (clientCore.ClothData.getCloth(itemID) && dataInfo.xlsData.limitation.v1 == 3) {/**判断这个物品是服装 */
                    if (clientCore.ItemsInfo.getItemNum(itemID) > 0 && !this._limitInfoHashMap.has(dataInfo.xlsData.id)) {
                        this._limitInfoHashMap.add(dataInfo.xlsData.id, 1);
                    }
                }
            }
            return arr;
        }
        addEventListeners() {
            BC.addEvent(this, this.mcTab_0, Laya.Event.CLICK, this, this.onTabClick, [0]);
            BC.addEvent(this, this.mcTab_1, Laya.Event.CLICK, this, this.onTabClick, [1]);
            BC.addEvent(this, this.mcTab_2, Laya.Event.CLICK, this, this.onTabClick, [2]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.imgRule, Laya.Event.CLICK, this, this.onShowRule);
        }
        private onShowRule(e: Laya.Event) {
            alert.showRuleByID(xls.get(xls.commonShopID).get(this._shopID).ruleID);
        }
        private onTabClick(index: number) {
            if (this._curSelectTabIndex != index) {
                this._curSelectTabIndex = index;
                this.showTab();
            }
        }
        private showTab() {
            for (let i = 0; i < this._shopInfo.tabArr.length; i++) {
                if (this._curSelectTabIndex == i) {
                    this["mcTab_" + i].skin = `commonShop/tab_light_${this._shopInfo.tabImgArr[i]}.png`;
                }
                else {
                    this["mcTab_" + i].skin = `commonShop/tab_dark_${this._shopInfo.tabImgArr[i]}.png`;
                }
            }
            let arr = [...this._shopDataArr[this._curSelectTabIndex]];
            for (let i = arr.length - 1; i >= 0; i--) {
                let serverTime = clientCore.ServerManager.curServerTime;
                if (arr[i].isTimeLimit && (serverTime < arr[i].startTime || serverTime > arr[i].endTime)) {
                    arr.splice(i, 1);
                }
            }
            this.list.array = arr;
        }
        private listRender(item: CommonShopItem, index: number): void {
            let info: CommonSingleData = this.list.array[index];
            item.setInfo(info);
            item.imgLImit.visible = info.isNumLimit && !info.isLock;
            if (info.isNumLimit) {
                item.imgLImit.skin = `commonShop/limit_${info.xlsData.limitation.v1}.png`;
                item.setLimit(this._limitInfoHashMap.get(info.xlsData.id) >> 0);
            }
            item.showFrame(index % 4 == 0);
        }

        private listSelect(index: number): void {
            if (index == -1) return;
            // let item: any = this.list.getCell(index);
            let info: CommonSingleData = this.list.array[index];
            if (info && !info.isLock) {
                // let info: CommonSingleData = this.list.array[index];
                let hasBuy: number = this._limitInfoHashMap.get(info.xlsData.id) >> 0;
                if (info.isNumLimit && hasBuy >= info.maxLimitNum) {
                    alert.showFWords("商品已售罄~");
                    return;
                }

                let buyInfo: alert.QuickBuyInfo = new alert.QuickBuyInfo(info.xlsData.itemId);
                buyInfo.tokenID = info.xlsData.cost.v1;
                buyInfo.singlePrice = Math.floor(info.xlsData.vipDiscount * info.xlsData.cost.v2);
                buyInfo.haveNum = clientCore.ItemsInfo.getItemNum(info.xlsData.itemId);
                buyInfo.caller = this;
                buyInfo.needCheck = this._shopID != 1;
                buyInfo.minNum = 1;
                buyInfo.stepNum = info.group;
                buyInfo.needFairyPetLevel = info.xlsData.privilege;
                info.isNumLimit && (buyInfo.limitNum = info.maxLimitNum - hasBuy);
                buyInfo.cancelFun = () => { };
                buyInfo.sureFun = (itemID: number, buyNum: number) => {

                    if (this._shopID == 1) {
                        let needCnt: number = buyInfo.singlePrice * buyNum;
                        let has: number = clientCore.ItemsInfo.getItemNum(buyInfo.tokenID);
                        if (needCnt > has) {
                            if (buyInfo.tokenID == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) { //灵豆不足
                                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                                return;
                            }
                            if (buyInfo.tokenID == clientCore.MoneyManager.LEAF_MONEY_ID) { //神叶不足
                                alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                                    alert.AlertLeafEnough.showAlert(needCnt - has);
                                }));
                                // alert.AlertLeafEnough.showAlert(needCnt - has);
                                return;
                            }
                        }
                    }

                    if (buyInfo.needFairyPetLevel > 0 && clientCore.FlowerPetInfo.petType < buyInfo.needFairyPetLevel) {
                        alert.showSmall("当前花宝等级不足，是否前往升级？", {
                            callBack: {
                                funArr: [() => {
                                    this.needOpenMod = "flowerPet.FlowerPetModule";
                                    this.destroy();
                                }], caller: this
                            }
                        });
                        return;
                    }

                    net.sendAndWait(new pb.cs_common_shop_buy_item({ id: info.xlsData.id, num: buyNum })).then(
                        (data: pb.sc_common_shop_buy_item) => {
                            this.buySuccess(data, buyNum);
                        }
                    ).catch((data: any) => {
                    });
                };
                alert.quickBuy(buyInfo);
            }
            this._select = index;
            this.list.selectedIndex = -1;
        }

        /** 购买商品成功*/
        private buySuccess(msg: pb.sc_common_shop_buy_item, count: number): void {
            if (msg.flag == 0) {
                let info: CommonSingleData = this.list.array[this._select];
                if (info.isNumLimit) {
                    let num: number = this._limitInfoHashMap.get(msg.id) >> 0;
                    this._limitInfoHashMap.add(msg.id, num + count);
                    this.list.changeItem(this._select, info);
                }
                alert.showReward(clientCore.GoodsInfo.createArray(msg.buyItems, true), "购买成功");
            }
        }

        /** 获取限购商品信息*/
        private getLimit(): Promise<void> {
            return new Promise((suc) => {
                net.sendAndWait(new pb.cs_get_common_shop_limit_items({ tabs: this._shopInfo.tabArr })).then((msg: pb.sc_get_common_shop_limit_items) => {
                    this._limitInfoHashMap = new util.HashMap();
                    _.forEach(msg.limitList, (element: pb.IcommonShop) => {
                        this._limitInfoHashMap.add(element.id, element.buyCnt);
                    })
                    suc();
                })
            })
        }


        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            clientCore.UIManager.releaseCoinBox();
            Laya.timer.clear(this, this.refreshTime);
            super.destroy();
        }
    }
}