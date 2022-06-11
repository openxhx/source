namespace samsungShop {

    const TAB_STR: string[] = [
        '限时',
        '常驻',
        '活动',
        '超值',
        '兑换',
        '本期兑换',
        '往期兑换',
        '热卖'
    ]

    /**
     * 三星公益项目
     * samsungShop.SamsungShopModule
     */
    export class SamsungShopModule extends ui.samsungShop.SamsungShopModuleUI {
        private _shopID: number;
        private _shopInfo: xls.commonShopID;
        private _shopDataArr: ShopData[][];
        private _buyPanel: BuyPanel;

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
            }
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.listSelect, null, false);
            this.list.vScrollBarSkin = "";
            this.list.scrollBar.elasticBackTime = 200;
            this.list.scrollBar.elasticDistance = 200;
            //TAB
            this.tabList.selectEnable = true;
            this.tabList.renderHandler = Laya.Handler.create(this, this.tabRender, null, false);
            this.tabList.selectHandler = Laya.Handler.create(this, this.tabSelect, null, false);
            //Money
            this.moneyList.renderHandler = Laya.Handler.create(this, this.moneyRender, null, false);
            this.moneyList.mouseHandler = Laya.Handler.create(this, this.moneyMouse, null, false);

            this.addPreLoad(xls.load(xls.commonShopID));
            this.addPreLoad(xls.load(xls.CommonShopData));
        }
        popupOver() {
            // clientCore.UIManager.showCoinBox();
        }
        async onPreloadOver() {
            this._shopInfo = xls.get(xls.commonShopID).get(this._shopID);
            this._shopDataArr = [];
            await this.getLimit();
            for (let i = 0; i < this._shopInfo.tabArr.length; i++) {
                this._shopDataArr.push(this.findShopDataByTab(this._shopInfo.tabArr[i]));
            }
            this.shopTxt.changeText(this._shopInfo.shopName);
            this.initTabs();
            // alert.showFWords("转化前的数组："+this._shopInfo.costCurrency.toString());
            // clientCore.UIManager.setMoneyIds([...this._shopInfo.costCurrency]);

            this.moneyList.array = this._shopInfo.costCurrency;
            this._curSelectTabIndex = 0;
            this.showTab();
            Laya.timer.loop(1000, this, this.refreshTime);
        }
        private moneyRender(item: ui.samsungShop.MoneyItemUI, index: number): void{
            let id: number = this._shopInfo.costCurrency[index];
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.numTxt.changeText(clientCore.ItemsInfo.getItemNum(id).toString());
        }
        private moneyMouse(e: Laya.Event): void{
            if(e.type == Laya.Event.CLICK && e.target instanceof component.HuaButton){
                let id = e.currentTarget['dataSource'];
                switch (id) {
                    case clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID:
                        clientCore.ToolTip.gotoMod(50);
                        break;
                    case clientCore.MoneyManager.LEAF_MONEY_ID:
                        alert.alertQuickBuy(clientCore.MoneyManager.LEAF_MONEY_ID, 1);
                        break;
                    case clientCore.MoneyManager.HEART_ID:
                    case clientCore.MoneyManager.FAMILY_CON:
                    case clientCore.MoneyManager.FAIRY_DEW_MONEY_ID:
                    case clientCore.MoneyManager.FRIEND_MONEY_ID:
                        clientCore.ToolTip.showTips(e.target, { id: id });
                        break;
                    case 1511008://大充活动代币 花语简
                        EventManager.event("ANNIVERSARY_BUY_MONEY");
                        break;
                    case 9900056://鹊桥期遇代币 钥匙
                        EventManager.event("MAGPIE_BRIDGE_BUY_KEY");
                        break;
                    case 9900060://作业如诗
                        EventManager.event("MAGPIE_BRIDGE_BUY_KEY");
                        break;
                    case 9900083://花斯卡
                        EventManager.event("HUASCARS_BUY_GOLDMAN");
                        break;
                    default:
                        let array: xls.shop[] = xls.get(xls.shop).getValues();
                        let len: number = array.length;
                        let quickSell: boolean = false;
                        let buyCnt: number = 0;
                        for (let i: number = 0; i < len; i++) {
                            let element: xls.shop = array[i];
                            if (element.itemId == id && element.quickSell == 1) {
                                quickSell = true;
                                buyCnt = element.unitNum;
                                break;
                            }
                        }
                        if (quickSell)
                            alert.alertQuickBuy(id, buyCnt, true);
                        else
                            clientCore.ToolTip.showTips(e.target, { id: id });
                        break;
                }
            }
        }
        private initTabs() {
            this.tabList.array = this._shopInfo.tabArr;
        }
        refreshTime() {
            this.list.startIndex = this.list.startIndex;
        }
        private findShopDataByTab(tabid: number): ShopData[] {
            let arr: ShopData[] = [];
            let allShopData = xls.get(xls.CommonShopData).getValues();
            for (let i = 0; i < allShopData.length; i++) {
                if (allShopData[i].tab == tabid && (allShopData[i].sex == 0 || allShopData[i].sex == clientCore.LocalInfo.sex)) {
                    let data = new ShopData(allShopData[i]);
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
            // BC.addEvent(this, this.mcTab_0, Laya.Event.CLICK, this, this.onTabClick, [0]);
            // BC.addEvent(this, this.mcTab_1, Laya.Event.CLICK, this, this.onTabClick, [1]);
            // BC.addEvent(this, this.mcTab_2, Laya.Event.CLICK, this, this.onTabClick, [2]);
            // BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnHide, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.onMoneyChange);
        }
        private onMoneyChange(): void{
            this.moneyList.refresh();
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
            // for (let i = 0; i < this._shopInfo.tabArr.length; i++) {
            //     if (this._curSelectTabIndex == i) {
            //         this["mcTab_" + i].skin = `commonShop/tab_light_${this._shopInfo.tabImgArr[i]}.png`;
            //     }
            //     else {
            //         this["mcTab_" + i].skin = `commonShop/tab_dark_${this._shopInfo.tabImgArr[i]}.png`;
            //     }
            // }
            let arr = [...this._shopDataArr[this._curSelectTabIndex]];
            for (let i = arr.length - 1; i >= 0; i--) {
                let serverTime = clientCore.ServerManager.curServerTime;
                if (arr[i].isTimeLimit && (serverTime < arr[i].startTime || serverTime > arr[i].endTime)) {
                    arr.splice(i, 1);
                }
            }
            this.list.array = arr;
        }
        private listRender(item: ui.samsungShop.ShopItemUI, index: number): void {
            let info: ShopData = this.list.array[index];
            item.nameTxt.changeText(info.xlsData.name);
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(info.xlsData.itemId);
            item.itemIco.skin = clientCore.ItemsInfo.getItemIconUrl(info.xlsData.cost.v1);
            item.imgFrame.skin = clientCore.GlobalConfig.rise ? 'samsungShop/2.png' : 'samsungShop/6.png';
            item.boxOri.visible = item.imgArrow.visible = clientCore.GlobalConfig.rise;

            let price: number = info.xlsData.cost.v2;
            if(clientCore.GlobalConfig.rise){
                item.priceTxt.changeText(Math.floor(price * 1.2) + '');
                item.txOri.changeText(`${price}`);
            }else{
                item.priceTxt.changeText(price + '');
            }
        }

        private listSelect(e: Laya.Event,index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            if(clientCore.GlobalConfig.rise){
                this._buyPanel = this._buyPanel || new BuyPanel();
                this._buyPanel.show(this.list.array[index],new Laya.Handler(this, this.buyItem, [index]));
            }else{
                this.buyItem(index);
            }
        }

        private buyItem(index: number): void{
            // let item: any = this.list.getCell(index);
            let info: ShopData = this.list.array[index];
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

        private tabRender(item: ui.samsungShop.TabItemUI, index: number): void{
            item.nameTxt.text = TAB_STR[this.tabList.array[index]];
            item.nameTxt.color = this.tabList.selectedIndex == index ? '#ede5d8' : '#3c4355';
        }

        private tabSelect(index: number): void{
            this._curSelectTabIndex = index;
            this.showTab();
        }

        /** 购买商品成功*/
        private buySuccess(msg: pb.sc_common_shop_buy_item, count: number): void {
            if (msg.flag == 0) {
                let info: ShopData = this.list.array[this._select];
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
            return net.sendAndWait(new pb.cs_get_common_shop_limit_items({ tabs: this._shopInfo.tabArr })).then((msg: pb.sc_get_common_shop_limit_items) => {
                this._limitInfoHashMap = new util.HashMap();
                _.forEach(msg.limitList, (element: pb.IcommonShop) => {
                    this._limitInfoHashMap.add(element.id, element.buyCnt);
                })
            })
        }


        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            this._buyPanel = null;
            // clientCore.UIManager.releaseCoinBox();
            Laya.timer.clear(this, this.refreshTime);
            super.destroy();
        }
    }
}