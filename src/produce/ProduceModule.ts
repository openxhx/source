

namespace produce {


    /**
     * 生产模块（2.0版本）
     */
    export class ProduceModule extends ui.produce.ProduceModuleUI {

        /** 当前页面 1-花种 2-精灵小屋*/
        private _viewType: number;

        /** 升级信息面板*/
        private _upgradePanel: panel.UpgradePanel;

        /** 当前生产信息面板*/
        private _currentPanel: panel.IPanel;

        /** 面板字典*/
        private _panelMap: any;

        private _flowerInfoArr: pb.IFlowerInfo[];

        private _flowerUpgradePanel: panel.FlowerUpgradePanel;

        private _shopInfo: util.HashMap<xls.shop>;

        private _vipLevel: number;

        private _vipSpeedUp: number = 0;
        private _vipBuildSeedUp: number = 0;
        // 158 602
        // 157 598
        //
        constructor() { super(); }

        public init(d?: any): void {
            super.init(d);
            this.addPreLoad(this.loadFlowerInfo());
            this.addPreLoad(xls.load(xls.shop));
            this.addPreLoad(xls.load(xls.vipLevel));

            this.addPreLoad(xls.load(xls.activityshop));
        }

        private async loadFlowerInfo() {
            return net.sendAndWait(new pb.cs_get_flower_exp_info).then((data: pb.sc_get_flower_exp_info) => {
                this._flowerInfoArr = data.flowers;
            });
        }

        public onPreloadOver() {
            this._vipLevel = clientCore.LocalInfo.vipLv;
            if (this._vipLevel > 0) {
                this._vipSpeedUp = this.getFlowerSpeedUpPersent();
                this._vipBuildSeedUp = this.getBuildSpeedUpPersent();
            }


            this.parseShopData();
            this.initView();
            this.updateWareNum();
        }
        private getFlowerSpeedUpPersent(): number {
            let privilegeArr = xls.get(xls.vipLevel).get(this._vipLevel).privilege;
            for (let i = 0; i < privilegeArr.length; i++) {
                if (privilegeArr[i].v1 == 9) {
                    return privilegeArr[i].v2;
                }
            }
            return 0;
        }
        private getBuildSpeedUpPersent(): number {
            let privilegeArr: xls.pair[] = xls.get(xls.vipLevel).get(this._vipLevel).privilege;
            privilegeArr = _.filter(privilegeArr, (element) => { return element.v1 == 8; });
            if (privilegeArr.length <= 0) return 0;
            return privilegeArr[0].v2;
        }

        private parseShopData() {
            this._shopInfo = new util.HashMap<xls.shop>();
            let valueArr = xls.get(xls.shop).getValues();
            for (let i = 0; i < valueArr.length; i++) {
                if (valueArr[i].type == 1) {
                    this._shopInfo.add(clientCore.SeedFlowerRelateConf.getRelateID(valueArr[i].itemId), valueArr[i]);
                }
            }
        }

        public popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "produceModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }

            clientCore.UIManager.setMoneyIds([1550001, 9900001, 9900002, 9900003]);
            clientCore.UIManager.showCoinBox();
        }

        public addEventListeners(): void {
            for (let i: number = 1; i <= 2; i++) {
                BC.addEvent(this, this["tab" + i], Laya.Event.CLICK, this, this.showViewByTab, [i, false]);
            }

            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.changePage, [0]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.changePage, [1]);
            BC.addEvent(this, this.txGo, Laya.Event.CLICK, this, this.goShop);
            BC.addEvent(this, this.btnAllHarvest, Laya.Event.CLICK, this, this.allHarvest);
            BC.addEvent(this, EventManager, globalEvent.PRODUCE_TIME_REFRESH, this, this.refreshProduceTime);
            BC.addEvent(this, EventManager, ProduceConstant.START_PRODUCE, this, this.updateProInfo);
            BC.addEvent(this, EventManager, ProduceConstant.SHEEP_UP, this, this.updateProInfo);
            BC.addEvent(this, EventManager, ProduceConstant.GET_ONE_PRODUCED, this, this.updateProInfo);
            BC.addEvent(this, EventManager, globalEvent.PRODUCE_GET_ALL_PRODUCTION_SUCC, this, this.allHarvestSucc);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
            BC.addEvent(this, EventManager, globalEvent.CHANGE_PRODUCR_ID, this, this.changeProduceID);
            BC.addEvent(this, this.mcWareHouse, Laya.Event.CLICK, this, this.showWarehouse);
            BC.addEvent(this, EventManager, globalEvent.HARVEST_ONE_FLOWER, this, this.harvestOneFlower);

        }
        private harvestOneFlower(flowerID: number) {
            for (let i = 0; i < this._flowerInfoArr.length; i++) {
                if (this._flowerInfoArr[i].flowerId == flowerID) {
                    this._flowerInfoArr[i].exp++;
                }
            }
        }
        private showWarehouse(e: Laya.Event) {
            clientCore.ModuleManager.open("backpack.BackpackModule");
        }

        private changeProduceID(itemId: number): void {
            if (!itemId) return;
            this.go(itemId);
            this.showProduceInfo(this.list.selectedIndex);
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "produceModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "btnPlace") {
                    var obj: any;
                    // obj = this.list.getCell(0).getChildByName("place");
                    obj = { cell: this.list.getCell(0), guideRealTarget: this.list.getCell(0).getChildByName("place") };
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });

                }
                else if (objName == "btnPlace2") {
                    var obj: any;
                    // obj = this.list.getCell(1).getChildByName("place");
                    obj = { cell: this.list.getCell(1), guideRealTarget: this.list.getCell(1).getChildByName("place") };
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });
                }
                else if (objName == "btnGetSeed0") {
                    var obj: any;
                    // obj = this.list.getCell(1)["btnGet"];
                    obj = { cell: this.list.getCell(1), guideRealTarget: this.list.getCell(1)["btnGet"] };
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });
                }
                else if (objName == "btnSpeedUp") {
                    var obj: any;
                    obj = (this._panelMap[0] as panel.ProducePanel).btnSpeedUp;
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });
                }
                else if (objName == "btnProduce") {
                    var obj: any;
                    obj = (this._panelMap[1] as panel.LeisurePanel).btnPro;
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });
                }
                else if (objName == "secondSeedImg") {
                    var obj: any;
                    // obj = this.list.getCell(1)["ico"];
                    obj = { cell: this.list.getCell(1), guideRealTarget: this.list.getCell(1)["ico"] };
                    Laya.timer.frameOnce(2, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });
                }
                else if (objName == "btnGet") {
                    var obj: any;
                    // obj = this.list.getCell(1)["btnGet"];
                    obj = { cell: this.list.getCell(1), guideRealTarget: this.list.getCell(1)["btnGet"] };
                    Laya.timer.frameOnce(2, this, () => {
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
        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            super.destroy();
            this._currentPanel && this._currentPanel.dispose();
            this._upgradePanel && this._upgradePanel.destroy();
            this._flowerUpgradePanel && this._flowerUpgradePanel.destroy();
            for (let key in this._panelMap) {
                this._panelMap[key] && this._panelMap[key].dispose();
            }
            this._upgradePanel = this._currentPanel = this._panelMap = null;

            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickProduceCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            clientCore.UIManager.releaseCoinBox();
        }

        private initView(): void {
            this._panelMap = {};
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.listMouse, null, false);
            //新手引导阶段。list不让拖动
            if (clientCore.GuideMainManager.instance.isGuideAction) {
                this.list.scrollBar.touchScrollEnable = false;
            }
            window['hanId'] = this.list.mouseHandler['_id'];
            if (this._data && this._data > 0) {
                this.go(this._data);
                // let index = 0;
                // if (clientCore.SeedFlowerRelateConf.isFlower(this._data)) {
                //     index = this.findFlowerIndex(this._data);
                //     this.showViewByTab(1, true);
                // }
                // else {
                //     // let info: clientCore.MapItemInfo = clientCore.MapItemsInfoManager.instance.getBuildingInfoByID(this._data)
                //     let array: xls.shop[] = xls.get(xls.shop).getValues();
                //     let info = _.find(array, (element: xls.shop) => {
                //         return element.itemId == this._data;
                //     })
                //     if (info) {
                //         this.showViewByTab(2, true);
                //         index = this.list.array.indexOf(info);
                //     }
                // }
                // if (index != this.list.selectedIndex) {
                //     this.list.selectedIndex = index;
                //     this.list.scrollTo(index);
                // }
            }
            else {
                this.showViewByTab(1, true);
                if (this.list.array.length > 0)
                    this.list.selectedIndex = 0;
            }
            this.showProduceInfo(this.list.selectedIndex);
        }


        private go(id: number): void {
            let index = 0;
            if (clientCore.SeedFlowerRelateConf.isFlower(id)) {
                index = this.findFlowerIndex(id);
                this.showViewByTab(1, true);
            }
            else {
                let array: xls.shop[] = xls.get(xls.shop).getValues();
                let info = _.find(array, (element: xls.shop) => {
                    return element.itemId == id;
                })
                if (info) {
                    this.showViewByTab(2, true);
                    index = this.list.array.indexOf(info);
                }
            }
            if (index != this.list.selectedIndex) {
                this.list.selectedIndex = index;
                this.list.scrollTo(index);
            }
        }

        private findFlowerIndex(id: number): number {
            for (let i = 0; i < this._flowerInfoArr.length; i++) {
                if (this._flowerInfoArr[i].flowerId == id) {
                    return i;
                }
            }
            return 0;
        }

        /**
         * 建筑列表渲染
         * @param item 
         * @param index 
         */
        private listRender(item: ui.produce.item.BuildingItemUI, index: number): void {
            let info = item.dataSource;


            item.imgSel.visible = this.list.selectedIndex == index; //当前是否选中
            item.imgBg.skin = this.list.selectedIndex == index ? "produce/bgSelect.png" : "produce/bgNormal.png";
            item.btnBuy.visible = item.cost.visible = item.boxBuildLock.visible = item.boxMain.gray = item.boxFull.visible = false;

            if (this._viewType == 2) {
                let data: xls.shop = info;
                item.ico.skin = pathConfig.getBuildingIconPath(data.itemId);
                item.ico.scale(1, 1);
                item.txName.changeText(data.itemName);
                let itemInfo: clientCore.MapItemInfo = clientCore.MapItemsInfoManager.instance.getBuildingInfoByID(info.itemId);
                if (!itemInfo) {
                    let canUnlock: boolean = this.checkCanUnlock(data.unlockConditions, item.txBuildLimit);
                    item.boxMain.gray = item.boxBuildLock.visible = !canUnlock;
                    item.btnBuy.visible = canUnlock;
                    item.cost.visible = true;
                    item.cost.txCost.changeText(data.sell[0].v2 + "");
                    item.boxIng.visible = item.imgLeisure.visible = item.btnPlace.visible = item.btnInfo.visible = item.btnLv.visible = false;
                    item.txLv.text = '1'
                    //生产数量和时间
                    let upgradeType = xls.get(xls.manageBuildingId).get(data.itemId).buildingType;
                    let upgradeInfo: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getCurUpgradeInfoByTypeAndLevel(upgradeType, 1);
                    let formulaInfo: xls.manageBuildingFormula = xls.get(xls.manageBuildingFormula).get(xls.get(xls.manageBuildingId).get(data.itemId).unlock1Formula);
                    item.txLimit.changeText(upgradeInfo.stackLimit + "");

                    item.txTime.changeText(util.StringUtils.getTimeStr(Math.round((1 - upgradeInfo.efficiency / 100 - this._vipBuildSeedUp / 100 - clientCore.ScienceTreeManager.ins.increment(10) / 100) * formulaInfo.timeS)));
                } else {
                    item.txLv.text = itemInfo.level.toString();
                    // 0-生产中 1-空闲中 2-没放置
                    let status: number = itemInfo.putState == 0 ? 2 : (itemInfo.produceRestTime > 0 ? 0 : 1);
                    item.boxIng.visible = status == 0;
                    item.imgLeisure.visible = status == 1;
                    item.btnPlace.visible = status == 2;
                    status == 0 && item.txProTime.changeText(util.StringUtils.getDateStr(itemInfo.produceRestTime));

                    //检查是否可以升级
                    let isLv: boolean = this.checkCanUpgrade(itemInfo);
                    item.btnInfo.visible = !isLv;
                    item.btnLv.visible = isLv;

                    //生产数量和时间
                    let upgradeInfo: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getCurUpgradeInfoByTypeAndLevel(itemInfo.upgradeType, itemInfo.level);
                    let formulaInfo: xls.manageBuildingFormula = xls.get(xls.manageBuildingFormula).get(itemInfo.produceFormulaID);
                    item.txLimit.changeText(upgradeInfo.stackLimit + "");
                    item.txTime.changeText(util.StringUtils.getTimeStr(Math.round((1 - upgradeInfo.efficiency / 100 - this._vipBuildSeedUp / 100 - clientCore.ScienceTreeManager.ins.increment(10) / 100) * formulaInfo.timeS)));

                    //是否有产物
                    // item.boxPro.visible = info.produceCompleteNum > 0;
                    item.fIco.skin = clientCore.ItemsInfo.getItemIconUrl(formulaInfo.outputItem);
                    item.fIco.scale(0.55, 0.55);
                }

                item.btnGet.visible = false;
                item.boxFlower.visible = false;
                item.boxFlowerGrow.visible = false;
                item.boxLock.visible = false;
            }
            else if (info instanceof pb.FlowerInfo) {
                let xlsFlower: xls.manageBuildingId = xls.get(xls.manageBuildingId).get(info.flowerId);
                item.txName.changeText(xlsFlower.name);
                item.txLv.changeText(clientCore.FlowerGrowConf.getFlowerLevel(info.flowerId, info.exp) + "");
                item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.flowerId);
                item.ico.scale(0.7, 0.7);

                item.txLimit.changeText(clientCore.FlowerGrowConf.getFlowerMax(info.flowerId, info.exp) + "");
                let scienceSpeedUp: number = clientCore.ScienceTreeManager.ins.increment(7);
                let speedUpPercent = clientCore.FlowerGrowConf.getSpeedUpEfficiency(info.flowerId, info.exp);
                let time: number = this.getFlowerGrowTime(info.flowerId) * (1 - scienceSpeedUp / 100 - this._vipSpeedUp / 100 - speedUpPercent / 100);
                item.txTime.changeText(util.StringUtils.getTimeStr(time));

                item.imgLeisure.visible = false;
                item.btnInfo.visible = true;
                item.btnLv.visible = false;
                item.boxIng.visible = false;

                let seedNum = clientCore.MapItemsInfoManager.instance.getPackageSeedNum(clientCore.SeedFlowerRelateConf.getRelateID(info.flowerId));
                item.btnGet.visible = seedNum == 0;
                item.btnPlace.visible = seedNum > 0;
                item.txtSeedNum.changeText("" + seedNum);

                item.boxFlower.visible = true;
                item.boxFlowerGrow.visible = true;

                let plantFlowerNum = clientCore.MapItemsInfoManager.instance.getFlowerInMapByID(info.flowerId).length;
                item.txtFlowerGrowNum.text = "" + plantFlowerNum;
                if (plantFlowerNum <= 0) {
                    item.boxFlowerGrow.visible = false;
                }

                let unlockInfo = this.parseUnlockInfo(this._shopInfo.get(info.flowerId).unlockConditions[0]);
                if (unlockInfo.length == 0) {
                    item.boxLock.visible = false;
                    item.boxMain.gray = false;
                }
                else {
                    item.txtUnlockCondition.text = unlockInfo;
                    item.boxLock.visible = true;
                    item.boxMain.gray = true;
                }
                //检查是否上限
                let all: number = clientCore.MapItemsInfoManager.instance.getAllFlowerInMap().length;
                let limit: number = this.getUpperLimit();
                if (all >= limit && !item.btnGet.visible) {
                    item.btnBuy.visible = item.btnPlace.visible = false;
                    item.boxFull.visible = true;
                }
            }
        }

        private getUpperLimit(): number {
            return clientCore.ScienceTreeManager.ins.increment(1) + clientCore.BuildingUpgradeConf.getGodTreeInfo(99).plantLimit + clientCore.FlowerPetInfo.getPrivilegeByType(4);
        }

        private checkCanUnlock(array: xls.pair[], lb: Laya.Label): boolean {
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.pair = array[i];
                switch (element.v1) {
                    case 1: //玩家等级
                        if (element.v2 > clientCore.LocalInfo.userLv) {
                            lb.changeText(`玩家${element.v2}级解锁购买`);
                            return false;
                        }
                        break;
                    case 3: //神树等级
                        if (element.v2 > clientCore.LocalInfo.treeLv) {
                            lb.changeText(`神树${element.v2}级解锁购买`);
                            return false;
                        }
                        break;
                    case 3:
                        break;
                }
            }
            return true;
        }

        private parseUnlockInfo(info: xls.pair) {
            let str = '';
            switch (info.v1) {
                case 1:
                    str = clientCore.LocalInfo.userLv < info.v2 ? '角色等级达到' + info.v2 : '';
                    break;
                case 2:
                    break;
                case 3:
                    str = clientCore.LocalInfo.treeLv < info.v2 ? '精灵树等级' + info.v2 : '';
                    break;
                default:
                    break;
            }
            return str;
        }

        private getFlowerGrowTime(id: number) {
            let arr = xls.get(xls.flowerPlant).get(id).growUp;
            let count = 0;
            for (let num of arr) {
                count += num;
            }
            return count;
        }

        private checkCanUpgrade(info: clientCore.MapItemInfo): boolean {
            if (info.level == 20) {
                return false;
            }
            else {
                let upgradeInfo = clientCore.BuildingUpgradeConf.getNextUpgradeInfoByTypeAndLevel(info.upgradeType, info.level);
                let goodsEnoughFlag = clientCore.ItemsInfo.checkItemsEnough(clientCore.GoodsInfo.createArray(upgradeInfo.item));
                let limitType = upgradeInfo.limit.v1;
                let limitValue = upgradeInfo.limit.v2;
                //能量判断
                if (clientCore.BuildQueueManager.allEnergy < upgradeInfo.energy) {
                    return false
                }
                if (limitType == 1) {
                    return limitValue <= clientCore.LocalInfo.userLv && goodsEnoughFlag;
                }
                else if (limitType == 2) {
                    return limitValue <= clientCore.LocalInfo.treeLv && goodsEnoughFlag;
                }
            }
        }

        /**
         * 列表的鼠标事件
         * @param e 
         * @param index 
         */
        private listMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            // if (e.currentTarget['boxLock'].visible) {
            //     alert.showFWords('还未解锁！')
            //     return;
            // }
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "selectBuildOrSeed") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this.showProduceInfo(index);
            if (e.currentTarget['boxLock'].visible) {
                // alert.showFWords('还未解锁！')
                return;
            }

            let info = this.list.array[index];
            switch (e.target.name) {
                case "place": //放置
                    this.destroy();
                    if (this._viewType == 2) {
                        let itemInfo: clientCore.MapItemInfo = clientCore.MapItemsInfoManager.instance.getBuildingInfoByID(info.itemId);
                        clientCore.MapEditorManager.getInstance().markReturnModule({ mod: 'produce.ProduceModule', data: itemInfo.id });
                        clientCore.MapEditorManager.getInstance().showUI(itemInfo.type, 'produce');
                        clientCore.MapEditorManager.getInstance().showOperateMapItem(itemInfo, { row: -1, col: -1 }, true, true);
                    }
                    else if (info instanceof pb.FlowerInfo) {
                        clientCore.MapEditorManager.getInstance().markReturnModule({ mod: 'produce.ProduceModule', data: info.flowerId });
                        clientCore.MapEditorManager.getInstance().showUI(2, 'produce');
                        clientCore.MapEditorManager.getInstance().showOperateMapItem(clientCore.MapItemInfo.createMapItemInfoByID(info.flowerId), { row: -1, col: -1 }, true, true);
                    }

                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickPlaceBtn") {
                        Laya.timer.frameOnce(2, this, () => {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        });
                    }
                    break;
                case "lv": //升级

                case "info": //信息
                    if (clientCore.GuideMainManager.instance.curGuideInfo.mainID == 14) {//新手引导阶段，信息不能点
                        return;
                    }
                    if (info instanceof pb.FlowerInfo) {
                        this.showFlowerUpgradeInfo(info);
                    }
                    else {
                        let itemInfo: clientCore.MapItemInfo = clientCore.MapItemsInfoManager.instance.getBuildingInfoByID(info.itemId);
                        if (itemInfo)
                            this.showBuildGradeInfo(itemInfo);
                    }
                    break;
                case "get":
                    let flowerID = 0;
                    if (info instanceof pb.FlowerInfo) {
                        flowerID = info.flowerId;
                    }
                    let seedId = clientCore.SeedFlowerRelateConf.getRelateID(flowerID)
                    let itemBagInfo = xls.get(xls.itemBag).get(seedId);
                    if (itemBagInfo) {
                        let getModId = itemBagInfo.channelType[0];
                        if (getModId) {
                            let modId = parseInt(getModId.split('/')[1])
                            if (modId == 23) {
                                this.destroy();
                                clientCore.ModuleManager.open("shop.ShopModule", seedId);
                                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickProduceGetIcon") {
                                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                                }
                            }
                            else {
                                clientCore.ToolTip.gotoMod(modId);
                            }
                            break;
                        }
                        else {
                            alert.showFWords(`${flowerID}暂无获取途径`)
                        }
                    }
                    else {
                        alert.showFWords(`ITEMBAG中无${flowerID}数据`)
                    }
                case "buy":
                    let data: xls.shop = info;
                    net.sendAndWait(new pb.cs_shop_buy_item({ id: data.itemId, num: 1 })).then(() => {
                        this.showBuilds();
                    });
                    break;
                default:
                    break;
            }
        }

        private showFlowerUpgradeInfo(info: pb.FlowerInfo): void {
            if (!this._flowerUpgradePanel) {
                this._flowerUpgradePanel = new panel.FlowerUpgradePanel();
            }
            this._flowerUpgradePanel.show(info);
        }

        private showBuildGradeInfo(info: clientCore.MapItemInfo): void {
            let maxLev: number = clientCore.BuildingUpgradeConf.getMaxLevel(info.upgradeType);
            if (info.level >= maxLev) {
                alert.showFWords(info.name + "已满级了~");
                return;
            }
            if (!this._upgradePanel) {
                this._upgradePanel = new panel.UpgradePanel();
                BC.addEvent(this, this._upgradePanel, "UPGRADE_SUCC", this, this.upgradeSucc);
            }
            this._upgradePanel.show(info);
        }

        /**
         * 成功升级
         */
        private upgradeSucc(getTime: number): void {
            this.updateProInfo();
            this.list.startIndex = this.list.startIndex;
            if (this._upgradePanel) {
                let info = clientCore.MapItemsInfoManager.instance.getBuildingInfoByGetTime(getTime);
                this._upgradePanel.refreshInfo(info);
            }
        }

        private allHarvestSucc() {
            this.updateProInfo();
            this.loadFlowerInfo();
        }

        /** 更新生产信息*/
        private updateProInfo(): void {
            this.showProduceInfo(this.list.selectedIndex);
            this.updateWareNum();
        }

        /**
         * 显示生产信息
         * @param index 
         */
        private showProduceInfo(index: number): void {
            let info = this.list.array[index];
            if (this._viewType == 2) {
                this._currentPanel && this._currentPanel.dispose();
                let itemInfo: clientCore.MapItemInfo = clientCore.MapItemsInfoManager.instance.getBuildingInfoByID(info.itemId);
                let status = 2;
                if (itemInfo) {
                    // 0-生产中 1-空闲中 2-没放置 
                    status = itemInfo.produceRestTime > 0 ? 0 : (itemInfo.putState ? 1 : 2);
                    if (itemInfo.produceCompleteNum > 0) {
                        status = 0
                    }
                }
                // else{/**选择的建筑还没有购买，则这个建筑在 MapItemsInfoManager 里面是没有数据的 ，这里生产一个MapItemInfo*/

                // }

                this._currentPanel = this.getPanel(status);
                this._currentPanel.update(this, itemInfo ? itemInfo : info, status);
            }
            else if (info instanceof pb.FlowerInfo) {
                this._currentPanel && this._currentPanel.dispose();
                this._currentPanel = new panel.FlowerProducePanel();
                this._currentPanel.update(this, info, 0);
            }
        }

        /**
         * 获取信息面板
         * @param status 0-生产中 1-空闲中 2-没放置 3-未购买
         */
        private getPanel(status: number): panel.IPanel {
            let p: panel.IPanel = this._panelMap[status];
            if (!p) {
                let cls: any[] = [panel.ProducePanel, panel.LeisurePanel, panel.LeisurePanel, panel.NormalPanel];
                p = new cls[status]();
                this._panelMap[status] = p;
            }
            return p;
        }

        /**
         * 显示界面
         * @param type 1-花种 2-精灵小屋
         */
        private showViewByTab(type: number, initFlag: boolean = false): void {
            if (this._viewType == type) return;
            this._viewType = type;
            for (let i: number = 1; i <= 2; i++) {
                this["tab" + i].skin = type == i ? "produce/clip_l_y_1.png" : "produce/clip_l_y_2.png";
            }

            if (type == 1) {
                this.list.array = _.compact(_.map(this._flowerInfoArr, (element: pb.IFlowerInfo) => {
                    let cfg: xls.flowerPlant = xls.get(xls.flowerPlant).get(element.flowerId);
                    if (cfg && cfg.inAction == 1) return element;
                }));
            } else {
                // this.list.array = clientCore.MapItemsInfoManager.instance.getBuildingsAll();
                this.showBuilds();
            }

            this.btnLeft.visible = this.btnRight.visible = this.list.array.length > 4; //TODO 隐藏左右按钮 当大于一页的时候显示 现在默认一页是4个
            let isEmtry: boolean = this.list.array.length == 0;
            this.boxDesc.visible = isEmtry;
            if (isEmtry) {
                let typeStr: string = this._viewType == 1 ? "花种" : "精灵小屋";
                this.txDesc.changeText(`您还没有${typeStr}哦，快去商场购买吧~`);
                this._currentPanel && this._currentPanel.dispose();
                this._currentPanel = null;

            } else {
                if (!initFlag) {
                    this.list.selectedIndex = 0;
                    this.showProduceInfo(0);
                }
            }
            //必须点击才算步骤完成，所以这里需要区别下打开面板时调用跟点击时调用
            if (!initFlag && clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickProduceModuleTab") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private showBuilds(): void {
            let array: xls.shop[] = xls.get(xls.shop).getValues();
            let builds: xls.shop[] = [];
            _.forEach(array, (element: xls.shop) => {
                element.type == 2 && builds.push(element);
            })
            this.list.array = _.sortBy(builds, (element) => {
                return clientCore.MapItemsInfoManager.instance.checkHasSomeById(element.itemId);
            })
        }

        /** 前往商场*/
        private goShop(): void {
            this.destroy();
            clientCore.ModuleManager.open("shop.ShopModule");
        }

        /**
         * 切换页面
         * @param type 
         */
        private changePage(type: number): void {
            let item: Laya.Box = this.list.cells[0];
            if (item) {
                let _num: number = Math.floor(this.list.width / (item.width + this.list.spaceX));
                _num = type == 0 ? Math.max(0, this.list.startIndex - _num) : Math.min(this.list.length - _num, this.list.startIndex + _num);
                this.list.tweenTo(_num);
            }
        }

        /**
         * 一键领取
         */
        private allHarvest(): void {
            EventManager.event(globalEvent.PRODUCE_GET_ALL_PRODUCTION);
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickHarvestAll") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        /**
         * 刷新生产时间
         */
        private refreshProduceTime(): void {
            this.list.startIndex = this.list.startIndex;
            this._currentPanel && this._currentPanel.updateFrame();
        }

        private updateWareNum() {
            let nowNum = clientCore.MaterialBagManager.getAllItems().reduce((sum, value) => {
                return sum + value.goodsInfo.itemNum;
            }, 0);
            let total = clientCore.LocalInfo.pkgSize;
            let per = _.clamp(nowNum / total, 0, 1);
            let perArr = [0.01, 0.4, 0.9, 1.1];
            let idx = Math.max(0, _.findIndex(perArr, (i) => {
                return per < i;
            }));
            this.mcWareHouse.skin = `produce/btn_cangku_${idx}.png`;
        }

    }
}