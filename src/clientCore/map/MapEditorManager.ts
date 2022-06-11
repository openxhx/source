
namespace clientCore {
    type unionType = MapItemInfo | DecorationInfo | SeedInfo | SkinInfo;
    /**
     * 地图建筑，装饰，花种编辑面板。
     */
    export class MapEditorManager {
        private static _instance: MapEditorManager;
        private TAB_NUM: number = 4;
        private _mainUI: ui.mapEditor.mapEditorUI;
        private _onBackOpenModule: { mod: string, data: any };
        private _curShowType: number;
        private _mcOperateItem: MapOperateItem;
        /**编辑操作变化数组 */
        private _optHash: util.HashMap<pb.ImapItem>;
        private _resetArr: number[];
        private _tempSkinId: number;
        /**
         * 是否为单独编辑模式 
         * ui 表示点击UI上面的布置按钮进入编辑模式
         * produce 表示从生产面板或者商店购买了跳过去
         * map 表示长按地图建筑进入编辑模式
        */
        private _whereFrom: 'ui' | 'produce' | 'map';

        private _lastAddMapItemInfo: MapItemInfo;
        private _newAddFlag: boolean = true;//表示当前建筑是新摆进地图，还是之前就在地图中

        public static getInstance(): MapEditorManager {
            if (!MapEditorManager._instance) {
                MapEditorManager._instance = new MapEditorManager();
            }
            return MapEditorManager._instance;
        }
        public get whereFrom(): 'ui' | 'produce' | 'map' {
            return this._whereFrom;
        }

        public setUp() {
            this._optHash = new util.HashMap();
            this._resetArr = [];
            this._mainUI = new ui.mapEditor.mapEditorUI();
            this._mainUI.mouseEnabled = true;
            this._mainUI.mouseThrough = true;
            this._mainUI.btnHideGrid.visible = false;
            this.addEventListeners();

            this._mainUI.itemList.renderHandler = new Laya.Handler(this, this.itemsRender);
            this._mainUI.itemList.mouseHandler = new Laya.Handler(this, this.buildingSelect);
            this._mainUI.itemList.hScrollBarSkin = "";

            this._mcOperateItem = new MapOperateItem();
            this._mainUI.mcEditPanel.visible = false;
            this._mainUI.width = Laya.stage.width;
        }
        private itemsRender(cell: ui.mapEditor.render.buildingRenderUI, index: number) {
            let bInfo = cell.dataSource;
            cell.mcTypeImg.visible = true
            cell.item.num.visible = true;
            if (bInfo instanceof MapItemInfo) {
                if (bInfo.type == 1) {
                    cell.item.ico.skin = pathConfig.getBuildingIconPath(bInfo.id);
                    cell.item.txtName.text = bInfo.name;
                    cell.item.num.visible = false;
                }
                cell.mcTypeImg.index = bInfo.putType - 1;
                cell.item.imgBg.skin = ItemsInfo.getItemIconBg(bInfo.id)
            }
            else if (bInfo instanceof SeedInfo) {
                cell.item.ico.skin = pathConfig.getSeedIconPath(SeedFlowerRelateConf.getRelateID(bInfo.seedID));
                cell.item.txtName.text = bInfo.name;
                cell.item.num.value = 'x' + bInfo.num;
                cell.mcTypeImg.index = bInfo.putType - 1;
                cell.item.imgBg.skin = ItemsInfo.getItemIconBg(bInfo.seedID)
            }
            else if (bInfo instanceof DecorationInfo) {
                cell.item.ico.skin = ItemsInfo.getItemIconUrl(bInfo.decoID);
                cell.item.txtName.text = bInfo.name;
                cell.item.num.value = 'x' + bInfo.num;
                cell.mcTypeImg.index = bInfo.putType - 1;
                cell.item.imgBg.skin = ItemsInfo.getItemIconBg(bInfo.decoID)
            }
            cell.imgSelct.visible = this._mcOperateItem && this._mcOperateItem.getOperateMapItemInfo() && this._mcOperateItem.getOperateMapItemInfo().id == bInfo.id;
            if (bInfo instanceof SkinInfo) {
                cell.item.ico.skin = ItemsInfo.getItemIconUrl(bInfo.skinID);
                cell.item.txtName.text = bInfo.name;
                cell.item.num.visible = false;
                cell.mcTypeImg.visible = false;
                cell.imgSelct.visible = bInfo.serverID == this._tempSkinId;
                cell.item.imgBg.skin = ItemsInfo.getItemIconBg(bInfo.skinID)
            }
        }
        private buildingSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let info = this._mainUI.itemList.getItem(index) as unionType;
                if (info instanceof MapItemInfo) {
                    this.showOperateMapItem(info, { row: -1, col: -1 }, true, true);
                }
                else if (info instanceof SeedInfo) {
                    if (this.mapFlowerIsFull()) {
                        alert.showFWords("已达最大种植上限！");
                        return;
                    }
                    let tmpInfo = MapItemInfo.createMapItemInfoByID(SeedFlowerRelateConf.getRelateID(info.seedID));
                    // this.showOperateMapItem(tmpInfo);
                    this.showOperateMapItem(tmpInfo, { row: -1, col: -1 }, true, true);
                }
                else if (info instanceof DecorationInfo) {
                    let tmpInfo = MapItemInfo.createMapItemInfoByID(info.decoID);
                    // this.showOperateMapItem(tmpInfo);
                    this.showOperateMapItem(tmpInfo, { row: -1, col: -1 }, true, true);
                }
                else if (info instanceof SkinInfo) {
                    this._tempSkinId = info.serverID;
                    MapObjectTouchManager.changeObjSkin(9, this._tempSkinId);
                }
                this._mainUI.itemList.refresh();

                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSelectDec") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }

        private mapFlowerIsFull(): boolean {
            let maxNum = clientCore.BuildingUpgradeConf.getGodTreeInfo(99).plantLimit + clientCore.ScienceTreeManager.ins.increment(1) + clientCore.FlowerPetInfo.getPrivilegeByType(4);
            let curFlowerNum = 0;
            let mapItemArr = MapItemsInfoManager.instance.getAllMapItems();
            for (let i = 0; i < mapItemArr.length; i++) {
                if (mapItemArr[i].mapItemInfo.type == 2) {
                    curFlowerNum++;
                }
            }
            return curFlowerNum >= maxNum;
        }

        /**点击了3个操作小按钮 */
        private async onOpreateEditClick(opt: 'sure' | 'cancle' | 'pushToPack') {
            let mapItemInfo = this._mcOperateItem.getOperateMapItemInfo();
            var optInfo: pb.mapItem;
            this._lastAddMapItemInfo = null;
            switch (opt) {
                case 'sure':
                    if (!this._mcOperateItem.buildingCanPutFlag) {
                        alert.showFWords("当前这个位置不能摆放！");
                        return;
                    }
                    if (mapItemInfo.type == 2) {
                        if (mapItemInfo.putState == 0 && this.mapFlowerIsFull()) {
                            alert.showFWords("已达最大种植上限！");
                            return;
                        }
                    }
                    mapItemInfo.mapPosRow = this._mcOperateItem.mapItemPreRow;
                    mapItemInfo.mapPosCol = this._mcOperateItem.mapitemPreCol;
                    mapItemInfo.isReverse = this._mcOperateItem.isReverse;
                    mapItemInfo.putState = 1;


                    optInfo = this.createOptInfo(mapItemInfo, opt);
                    this._optHash.add(optInfo.getTime, optInfo);
                    if (mapItemInfo.type == 3 || mapItemInfo.type == 6) {/**放进去一个装饰，需要把这个装饰放到地图装饰数组里面 */
                        MapItemsInfoManager.instance.getDecorationInMap().push(mapItemInfo);
                    }
                    MapItemsInfoManager.instance.changeMapItemState(mapItemInfo);
                    if (this._newAddFlag && this.checkCanAddNextOne(mapItemInfo)) {/**表示这个是新摆进地图，而不是在地图中移动位置的 */
                        this._lastAddMapItemInfo = mapItemInfo;
                    }
                    break;
                case 'cancle':
                    MapEditorManager.getInstance().resumePreMapItem();
                    break;
                case 'pushToPack':
                    if (mapItemInfo.type == 2 && mapItemInfo.getTime > MapItemInfo.MAX_UNIQUE_GET_TIME) {
                        alert.showFWords("已经种植的花种不会收回！");
                        return;
                    }
                    if (mapItemInfo.id == 300161) {
                        alert.showFWords("已经种植的蓝蘑菇不能收回！");
                        return;
                    }
                    if (mapItemInfo.type == 5) {
                        alert.showFWords("家族建筑不能收回！");
                        return;
                    }
                    optInfo = this.createOptInfo(mapItemInfo, opt);
                    this._optHash.add(optInfo.getTime, optInfo);
                    if (mapItemInfo.type == 3 || mapItemInfo.type == 6) {/**装饰 */
                        MapItemsInfoManager.instance.addOneDecToPackage(mapItemInfo.id);
                        mapItemInfo.putState = 0;
                        MapItemsInfoManager.instance.changeMapItemState(mapItemInfo);
                        if (optInfo.getTime < MapItemInfo.MAX_UNIQUE_GET_TIME) {/**之前就不是在地图里面的 */
                            this._optHash.remove(optInfo.getTime);
                        }
                    }
                    else if (mapItemInfo.type == 1 && mapItemInfo.produceCompleteNum <= 0) {
                        try {
                            this.alertSurePutBack()
                                .then(() => {
                                    //没有生产完成的物品 可以直接收取
                                    mapItemInfo.putState = 0;
                                    MapItemsInfoManager.instance.changeMapItemState(mapItemInfo);
                                    let isOnMap = _.find(MapItemsInfoManager.instance.mapSrvData, { 'getTime': mapItemInfo.getTime });
                                    if (!isOnMap) {
                                        this._optHash.remove(optInfo.getTime);
                                    }
                                })
                                .catch(() => {
                                    this._optHash.remove(optInfo.getTime);
                                });
                        } catch (error) {

                        }
                    }
                    else if (mapItemInfo.type == 2) {
                        MapItemsInfoManager.instance.addSeedToPackage(SeedFlowerRelateConf.getRelateID(mapItemInfo.id), 1);
                        mapItemInfo.putState = 0;
                        MapItemsInfoManager.instance.changeMapItemState(mapItemInfo);
                        this._optHash.remove(optInfo.getTime);
                    }
                    else {
                        let getRewardOk = await this.waitGetReward(mapItemInfo);
                        if (getRewardOk) {
                            mapItemInfo.putState = 0;
                            this._resetArr.push(mapItemInfo.getTime);
                            MapItemsInfoManager.instance.changeMapItemState(mapItemInfo);
                        }
                        else
                            return;
                    }
                    break;
                default:
                    break;
            }
            this.refreshItemList();
            this._mcOperateItem.hideOperateMapItem();//影藏UI

            if (this._whereFrom != 'ui') {
                this.saveDirect(opt);
            }
            else if (this._lastAddMapItemInfo) {/**继续往地图里面摆放建筑（花朵或者装饰） */
                this.putNextOneIntoMap();
            }
            //新手 
            /**点击保存家园摆放，在回包里面确认进入下一步 */
            if (GuideMainManager.instance.curGuideInfo.operationBehavior == "clickMapEditSureBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }
        private putNextOneIntoMap() {
            if (this._lastAddMapItemInfo.type == 2) {
                if (this.mapFlowerIsFull()) {
                    MapItemsInfoManager.instance.checkBuildingsInPackage();
                    return;
                }
                let tmpInfo = MapItemInfo.createMapItemInfoByID(this._lastAddMapItemInfo.id);
                this.showOperateMapItem(tmpInfo, this.findNextPutPos(tmpInfo));
            }
            else {
                let tmpInfo = MapItemInfo.createMapItemInfoByID(this._lastAddMapItemInfo.id);
                this.showOperateMapItem(tmpInfo, this.findNextPutPos(tmpInfo));
            }
            this._mainUI.itemList.refresh();
        }
        /**找一个可以放置的位置，右下角方向找三次 */
        private findNextPutPos(info: MapItemInfo): { row: number, col: number } {
            let startRow = this._lastAddMapItemInfo.mapPosRow;
            let startCol = this._lastAddMapItemInfo.mapPosCol;
            let curRowColInfo: { row: number, col: number } = { row: startRow, col: startCol };
            for (let i = 0; i < 3; i++) {
                let nextRowColInfo = MapInfo.findBottomRightPos(curRowColInfo.row, curRowColInfo.col);
                if (MapInfo.checkMapItemCanPut(nextRowColInfo.row, nextRowColInfo.col, info.blockPosArr, info.putType)) {
                    return nextRowColInfo;
                }
                else {
                    curRowColInfo = nextRowColInfo;
                }
            }
            return curRowColInfo;
        }
        private checkCanAddNextOne(info: MapItemInfo): boolean {
            if (info.type == 2) {
                /**花朵可以摆放达到上限 */
                if (this.mapFlowerIsFull()) {
                    return false;
                }
                if (MapItemsInfoManager.instance.getPackageSeedNum(SeedFlowerRelateConf.getRelateID(info.id)) > 0) {
                    return true;
                }
            }
            else if (info.type == 3) {
                if (MapItemsInfoManager.instance.getPackageDecorationNumInById(info.id) > 0) {
                    return true;
                }
            }
            return false;
        }
        private createOptInfo(mapItemInfo: MapItemInfo, opt: 'sure' | 'cancle' | 'pushToPack'): pb.mapItem {
            let changeInfo = new pb.mapItem();
            changeInfo.buildId = mapItemInfo.id;
            changeInfo.getTime = mapItemInfo.getTime;
            changeInfo.pos = { x: mapItemInfo.mapPosRow, y: mapItemInfo.mapPosCol };
            changeInfo.isReverse = mapItemInfo.isReverse ? 1 : 0;
            changeInfo.opt = opt == 'pushToPack' ? 1 : 0;//0是添加，1是移除
            return changeInfo;
        }

        private async waitGetReward(mapItemInfo: MapItemInfo) {
            try {
                await this.alertSurePutBack().catch(() => {
                    return false;
                });
                if (mapItemInfo.produceCompleteNum > MaterialBagManager.getCanStoreNum()) {
                    alert.showFWords('仓库已满，无法收取');
                    if (clientCore.LocalInfo.userLv >= 8)
                        clientCore.LittleRechargManager.instacne.activeWindowById(4);
                    return false;
                }
                EventManager.event(globalEvent.PRODUCE_START_GET_PRODUCTION, mapItemInfo.getTime);
                return new Promise<boolean>((ok) => {
                    EventManager.once(globalEvent.PRODUCE_GET_PRODUCTION_SUCC, this, (data) => {
                        ok(data ? true : false);
                    });
                })
            } catch (error) {
                return false
            }
        }

        private alertSurePutBack() {
            return new Promise((ok, fail) => {
                alert.showSmall('你正要回收一座生产小屋，回收后将不会返还已进行生产的原料。是否确认？', { callBack: { caller: this, funArr: [ok, fail] } })
            });
        }
        /**
         * 对于不是从主UI布置按钮开始的编辑，点击确定之后，保存逻辑放到这里面
         * 对于直接长按的情况，因为只有新放进去的，才有连续摆放逻辑
         * 所以在获取下一个摆放信息那边过滤了
         * 这里面保存完之后，判断有没有下一个摆放信息，如果有就继续摆放，没有就退出
         */
        private saveDirect(opt: 'sure' | 'cancle' | 'pushToPack') {
            if (opt == "sure" || opt == "pushToPack") {
                net.sendAndWait(new pb.cs_map_build_opt({ itemInfo: this.parseOptInfoArr(), reset: this._resetArr }))
                    .then((data: pb.sc_map_build_opt) => {
                        MapItemsInfoManager.instance.refreshAllMapItems(data.builds);
                        this._optHash.clear();
                    })
                    .then(() => {
                        if (this._lastAddMapItemInfo) {
                            this.putNextOneIntoMap();
                        }
                        else {
                            this.hideUI();
                            MapItemsInfoManager.instance.checkBuildingsInPackage();
                        }
                        if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitDirectSaveSucc") {
                            Laya.timer.frameOnce(2, this, () => {
                                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                            });

                        }
                    });
            }
            else {
                this.hideUI()
            }
        }
        /**
         * 地图编辑保存逻辑
         * 1、点击UI布置按钮进入编辑模式，这个时候，保存，就是正常保存
         * 2、长按地图建筑进入编辑模式，这个时候，保存，也是正常保存
         * 3、从商店购买或者从生产面板进入编辑模式，这个情况，进入保存
         *   （1）保存的loading不能那么久，所有保存流程需要优化
         *   （2）不能保存完就去后台拉取背包信息，因为只保存一个的情况，能够保证背包的数据正确
         *   （3）保存完，需要判断这个活动或者装饰不是有多个，如果有多个可以进入下一轮编辑
         * 
         */
        private onSaveClick() {
            if (this._tempSkinId != clientCore.LocalInfo.srvUserInfo.homeSkin) {
                net.sendAndWait(new pb.cs_change_user_home_skin({ itemId: this._tempSkinId })).then(() => {
                    clientCore.LocalInfo.srvUserInfo.homeSkin = this._tempSkinId;
                })
            }
            //只有从地图进来的时候 需要提示是否有更改
            if (this._optHash.length == 0 && this._whereFrom == 'ui') {
                if (this._tempSkinId == clientCore.LocalInfo.srvUserInfo.homeSkin) {
                    alert.showFWords('没有任何更改');
                }
                this.hideUI();
                return;
            }
            LoadingManager.showSmall('保存中，请稍等。。。');
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickMapEditSaveBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            if (MapInfo.isSelfHome) {
                if (this._whereFrom == "produce") {

                }
                let change = this.parseOptInfoArr();
                net.sendAndWait(new pb.cs_map_build_opt({ itemInfo: change, reset: this._resetArr }))
                    .then((data: pb.sc_map_build_opt) => {
                        this.checkLog(change);
                        MapItemsInfoManager.instance.refreshAllMapItems(data.builds);
                    }).then(() => {
                        return MapItemsInfoManager.instance.checkBuildingsInPackage();
                    })
                    .then(() => {
                        return LoadingManager.hideSmall()
                    })
                    .then(() => { this.hideUI() })
                    .then(() => {
                        if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitMapEditSaveComplete") {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    })
                    .catch(() => {
                        LoadingManager.hideSmall(true);
                        this.hideUI();
                    });
            }
            else if (MapInfo.isSelfFamily) {
                net.sendAndWait(new pb.cs_family_map_build_opt({ fmlId: FamilyMgr.ins.familyId, items: this.parseOptInfoArr() }))
                    .then((data: pb.sc_family_map_build_opt) => {
                        MapItemsInfoManager.instance.refreshAllMapItems(data.builds);

                    })
                    .then(() => {
                        return MapItemsInfoManager.instance.checkBuildingsInPackage();
                    })
                    .then(() => {
                        return LoadingManager.hideSmall()
                    })
                    .then(() => { this.hideUI() })
                    .then(() => {
                        if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitMapEditSaveComplete") {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    });
            }

        }

        private checkLog(change: pb.ImapItem[]) {
            for (let i: number = 0; i < change.length; i++) {
                if (change[i].buildId >= 3700107 && change[i].buildId >= 3700114) {
                    clientCore.Logger.sendLog('2020年12月4日活动', '【主活动】幸运竹', '在家园放置幸运竹家园装饰');
                    return;
                }
            }
        }
        /**
         * 操作列表需要做的处理
         * 1、对于从背包里面拿出来的花朵跟装饰，临时生产的getTime需要再提交给后台的时候，把getTime置0
         * 2、添加跟移动操作拆成两个。对于操作类型为0（添加），如果之前这个建筑已经在地图，那么需要把类型改成2
         * 3、返回背包的操作需要放到数组的前面
         */
        private parseOptInfoArr(): pb.ImapItem[] {
            let arr = this._optHash.getValues();
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].getTime < MapItemInfo.MAX_UNIQUE_GET_TIME) {
                    arr[i].getTime = 0;
                }
                let isOnMap = _.find(MapItemsInfoManager.instance.mapSrvData, { 'getTime': arr[i].getTime });
                if (isOnMap && arr[i].opt == 0) {
                    arr[i].opt = 2;
                }
                if (arr[i].opt == 1) {
                    let tmpOptInfo = arr.splice(i, 1);
                    arr.unshift(...tmpOptInfo);
                }
            }
            return arr;
        }

        private onUndoClick() {
            if (this._optHash.length > 0 || this._tempSkinId != clientCore.LocalInfo.srvUserInfo.homeSkin)
                alert.showSmall('是否撤销本次的全部操作？', { callBack: { caller: this, funArr: [this.undo] } });
            else
                this.hideUI();
        }

        private onCloseClick() {
            if (this._optHash.length > 0) {
                alert.showSmall('你还有更改没有保存，确认退出吗？', { callBack: { caller: this, funArr: [this.sureClose] } });
            }
            else {
                this.hideUI();
            }
        }

        private sureClose() {
            this.undo();
            this.hideUI();
        }

        private undo() {
            if (this._optHash.length > 0) {
                if (MapInfo.isSelfHome) {
                    net.sendAndWait(new pb.cs_map_build_opt({ itemInfo: [], reset: [] }))
                        .then((data: pb.sc_map_build_opt) => {
                            MapItemsInfoManager.instance.refreshAllMapItems(data.builds);
                            this._mcOperateItem.hideOperateMapItem();
                            this._optHash.clear();
                            this._resetArr = [];
                        }).then(() => {
                            return MapItemsInfoManager.instance.checkBuildingsInPackage();
                        })
                        .then(() => {
                            this.refreshItemList();
                            MapManager.refreshMapOccupyState();
                        });
                }
                else if (MapInfo.isSelfFamily) {
                    net.sendAndWait(new pb.cs_family_map_build_opt({ fmlId: FamilyMgr.ins.familyId, items: [] }))
                        .then((data: pb.sc_family_map_build_opt) => {
                            MapItemsInfoManager.instance.refreshAllMapItems(data.builds);
                            this._mcOperateItem.hideOperateMapItem();
                            this._optHash.clear();
                            this._resetArr = [];
                        }).then(() => {
                            return MapItemsInfoManager.instance.checkBuildingsInPackage();
                        })
                        .then(() => {
                            this.refreshItemList();
                            MapManager.refreshMapOccupyState();
                        });
                }
            }
            if (this._tempSkinId != clientCore.LocalInfo.srvUserInfo.homeSkin) {
                this._tempSkinId = clientCore.LocalInfo.srvUserInfo.homeSkin;
                MapObjectTouchManager.changeObjSkin(9, clientCore.LocalInfo.srvUserInfo.homeSkin);
            }
        }

        private onSearch() {
            if (this._mainUI.txtSearch.text.length > 0) {
                this.updateSearchView();
            }
        }

        get isSearching() {
            return this._mainUI.txtSearch.text.length > 0;
        }

        private updateSearchView() {
            let isSearch = this.isSearching;
            this._mainUI.mcHomeTab.alpha = isSearch ? 0.5 : 1;
            this._mainUI.mcHomeTab.mouseEnabled = !isSearch;
            this._mainUI.btnSearch.filters = isSearch ? util.DisplayUtil.darkFilter : [];
            this.refreshItemList();
        }

        private onCancleSearch() {
            this._mainUI.txtSearch.text = '';
            this.updateSearchView();
        }

        private addEventListeners() {
            this._mainUI.btnHide.on(Laya.Event.CLICK, this, this.onCloseClick);
            for (let i = 0; i < this.TAB_NUM; i++) {
                this._mainUI["mcTab_" + i].on(Laya.Event.CLICK, this, this.onTabClick);
            }
            this._mainUI.btnClearAllDesc.on(Laya.Event.CLICK, this, this.clearAllMapItem);
            this._mainUI.btnShop.on(Laya.Event.CLICK, this, this.showShop);
            this._mainUI.btnSave.on(Laya.Event.CLICK, this, this.onSaveClick);
            this._mainUI.btnUndo.on(Laya.Event.CLICK, this, this.onUndoClick);
            this._mainUI.btnCancel.on(Laya.Event.CLICK, this, this.onOpreateEditClick, ['cancle']);
            this._mainUI.btnSure.on(Laya.Event.CLICK, this, this.onOpreateEditClick, ['sure']);
            this._mainUI.btnMoveToPackage.on(Laya.Event.CLICK, this, this.onOpreateEditClick, ['pushToPack']);
            this._mainUI.btnReverse.on(Laya.Event.CLICK, this, this.onReverseClick);
            this._mainUI.btnShowGrid.on(Laya.Event.CLICK, this, this.showGrid);
            this._mainUI.btnHideGrid.on(Laya.Event.CLICK, this, this.hideGrid);
            this._mainUI.btnSearch.on(Laya.Event.CLICK, this, this.onSearch);
            this._mainUI.btnCancle.on(Laya.Event.CLICK, this, this.onCancleSearch);

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo)

        }
        private onReverseClick(e: Laya.Event) {
            this._mcOperateItem.reverseMapItem();
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "mapEdit") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "btnSure") {
                    var obj: any;
                    Laya.timer.frameOnce(2, this, () => {
                        obj = this._mainUI.btnSure;
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    });
                }
                else if (objName == "tabDec") {
                    var obj: any;
                    obj = this._mainUI.mcTab_2;
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "firstDec") {
                    var obj: any;
                    obj = this._mainUI.itemList.getCell(0);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "btnSave") {
                    var obj: any;
                    obj = this._mainUI.btnSave;
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "watering") {
                    let mapItemArr = MapItemsInfoManager.instance.getAllMapItems();
                    for (let i = 0; i < mapItemArr.length; i++) {
                        if (mapItemArr[i].mapItemInfo.type == 2 && mapItemArr[i].mapItemInfo.flowerBeginTime == 0) {
                            var obj: any;
                            obj = mapItemArr[i].mcReward;
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                        }
                    }
                }
                else if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                }
            }
        }

        private clearAllMapItem(e: Laya.Event) {
            alert.showSmall('是否收起场景中所有装饰建筑', { callBack: { caller: this, funArr: [this.sureClearAll] } });
        }
        /** 确定把地图中所有装饰收进背包 */
        private sureClearAll() {
            let allDescInMap = MapItemsInfoManager.instance.getDecorationInMap();
            for (const info of allDescInMap) {
                if (info.id == 300161) {
                    continue;
                }
                let optInfo = this.createOptInfo(info, 'pushToPack');
                this._optHash.add(optInfo.getTime, optInfo);
                MapItemsInfoManager.instance.addOneDecToPackage(info.id);
                info.putState = 0;
                MapItemsInfoManager.instance.changeMapItemState(info);
                if (optInfo.getTime < MapItemInfo.MAX_UNIQUE_GET_TIME) {/**之前就不是在地图里面的 */
                    this._optHash.remove(optInfo.getTime);
                }
            }
            MapEditorManager.getInstance().refreshItemList();//刷新下面的列表
            this._mcOperateItem.hideOperateMapItem();//影藏UI
        }

        private async showShop(e: Laya.Event) {
            let shopMode = await ModuleManager.open('shop.ShopModule');
            shopMode.once(Laya.Event.CLOSE, this, this.refreshItemList);
        }

        private showGrid(e: Laya.Event) {
            let mapItemInfo: MapItemInfo = this._mcOperateItem.getOperateMapItemInfo();
            let type: number = mapItemInfo ? mapItemInfo.putType : 1;
            MapManager.refreshGridState(type);
            this.showGridBtnsState(true);
            MapManager.setGridLayerVisible(true);
        }

        private hideGrid(e: Laya.Event) {
            this.showGridBtnsState(false);
            MapManager.setGridLayerVisible(false);
        }

        public showGridBtnsState(show: boolean) {
            this._mainUI.btnShowGrid.visible = !show;
            this._mainUI.btnHideGrid.visible = show;
        }

        private onTabClick(e: Laya.Event) {
            if ((e.currentTarget as Laya.Clip).index == 0) {
                return;
            }
            let index = parseInt(e.currentTarget.name.split("_")[1]);
            this.showInfoByIndex(index);

            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickMapEditTab") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private showInfoByIndex(index: number) {
            this._curShowType = index;
            for (let i = 0; i < this.TAB_NUM; i++) {
                this._mainUI["mcTab_" + i].index = 1;
            }
            if (index < 4)
                this._mainUI["mcTab_" + index].index = 0;
            let arr: unionType[] = [];
            if (this.isSearching) {
                arr = MapItemsInfoManager.instance.getBuildingsInPackage();
                arr = arr.concat(MapItemsInfoManager.instance.getSeedInPackage())
                arr = arr.concat(MapItemsInfoManager.instance.getSeedInPackage());
                arr = arr.concat(MapItemsInfoManager.instance.getDecorationInPackage())
                arr = arr.concat(MapItemsInfoManager.instance.getHouseSkinInPackage())
                let searchStr = this._mainUI.txtSearch.text;
                arr = _.filter(arr, o => o.name.indexOf(searchStr) > -1);
            }
            else {
                if (index == 0) {
                    arr = MapItemsInfoManager.instance.getBuildingsInPackage();
                }
                else if (index == 1) {
                    arr = MapItemsInfoManager.instance.getSeedInPackage();
                }
                else if (index == 2) {
                    arr = MapItemsInfoManager.instance.getDecorationInPackage();
                }
                else if (index == 3) {
                    this._tempSkinId = clientCore.LocalInfo.srvUserInfo.homeSkin;
                    arr = MapItemsInfoManager.instance.getHouseSkinInPackage();
                }
            }
            this._mainUI.itemList.dataSource = arr;
            this._mainUI.imgNone.visible = this._mainUI.itemList.length == 0 && !this.isSearching;
            this._mainUI.imgNotFind.visible = this.isSearching && this._mainUI.itemList.length == 0;
        }

        public refreshItemList() {
            this.showInfoByIndex(this._curShowType);
        }
        // private removeEventListeners(){

        // }
        //如果是从上一个操作对象跳过来，那么上一个对象的信息需要还原下
        public showOperateMapItem(info: MapItemInfo, pos: { row: number, col: number } = { row: -1, col: -1 }, newAddFlag: boolean = true, autoFind: boolean = false) {
            this._newAddFlag = newAddFlag;
            this.resumePreMapItem();
            this._mcOperateItem.hideOperateMapItem();
            this._mcOperateItem.showMapItem(info, pos, autoFind);
            this._mainUI.btnReverse.visible = info.canReverse;
            this._mainUI.btnMoveToPackage.x = info.canReverse ? 106 : 57;
            this._mainUI.btnCancel.x = info.canReverse ? 171 : 141;
            this._mainUI.btnSure.x = info.canReverse ? 237 : 225;
            MapManager.refreshGridState(this._mcOperateItem.getOperateMapItemInfo().putType);
            if (newAddFlag) {/**过滤长按地图建筑物的情况 */
                if (info.type == 2) {
                    MapItemsInfoManager.instance.reduceSeed(SeedFlowerRelateConf.getRelateID(info.id));
                }
                else if (info.type == 3 || info.type == 6) {
                    MapItemsInfoManager.instance.reduceDeco(info.id);
                }
            }
        }

        /**
         * 撤销上一步操作，可以使点击取消，也可以使拖动的时候，点击了其他的建筑
         */
        public resumePreMapItem() {
            let preBuildingInfo = this._mcOperateItem.getOperateMapItemInfo();
            if (preBuildingInfo) {
                if (preBuildingInfo.type == 1 || preBuildingInfo.type == 5) {/**小屋 */
                    MapItemsInfoManager.instance.changeMapItemState(preBuildingInfo);
                }
                else if (preBuildingInfo.type == 2) {/**花种 */
                    if (preBuildingInfo.putState == 0) {
                        MapItemsInfoManager.instance.addSeedToPackage(SeedFlowerRelateConf.getRelateID(preBuildingInfo.id), 1);
                    }
                    else {
                        MapItemsInfoManager.instance.changeMapItemState(preBuildingInfo);
                    }
                }
                else if (preBuildingInfo.type == 3 || preBuildingInfo.type == 6) {/**装饰 */
                    if (preBuildingInfo.putState == 0) {
                        MapItemsInfoManager.instance.addOneDecToPackage(preBuildingInfo.id);
                    }
                    else {
                        MapItemsInfoManager.instance.changeMapItemState(preBuildingInfo);
                    }
                }
            }
        }
        public mapItemChangePos(x: number, y: number) {
            this._mcOperateItem.pos(x, y);
        }
        public startDragOperateMapItem() {
            this._mcOperateItem.startDragInit();
        }
        /**打开type:0建筑 1花种 2  */
        public showUI(type: number, where: 'ui' | 'produce' | 'map') {
            this.onCancleSearch();
            this._whereFrom = where;
            this._tempSkinId = clientCore.LocalInfo.srvUserInfo.homeSkin;
            clientCore.LayerManager.uiLayer.addChild(this._mainUI);
            this._mainUI.boxBottom.visible = this._mainUI.boxRight.visible = where == 'ui';
            this._mainUI.btnShop.visible = (MapInfo.isSelfHome);//家族编辑不显示商店按钮
            this._mainUI.mcTab_3.visible = this._mainUI.imgTab_3.visible = MapObjectTouchManager.checkHouseShow();
            if (!type)
                type = 0;
            if (MapInfo.isSelfHome) {
                this._mainUI.mcHomeTab.visible = true;
                this._mainUI.mcFamilyTab.visible = false;
            }
            else {
                this._mainUI.mcHomeTab.visible = false;
                this._mainUI.mcFamilyTab.visible = true;
            }
            this.showInfoByIndex(type);
            MapInfo.mapEditState = true;
            this._optHash.clear();
            this._resetArr = [];
            MapManager.refreshMapOccupyState();
            MapManager.enterEditMode();
            this.showGridBtnsState(false);
        }
        public hideUI(e: Laya.Event = null) {
            MapManager.setGridLayerVisible(false);
            this._mainUI.removeSelf();
            this.resumePreMapItem();
            this._mcOperateItem.hideOperateMapItem();
            MapInfo.mapEditState = false;
            MapManager.exitEditMode();
            if (this._onBackOpenModule) {
                ModuleManager.open(this._onBackOpenModule.mod, this._onBackOpenModule.data);
                this._onBackOpenModule = null;
            }
            if (MapInfo.isSelfFamily) {
                net.sendAndWait(new pb.cs_family_build_opt_status({ opt: 1, fmlId: FamilyMgr.ins.familyId })).then((data: pb.sc_family_build_opt_status) => {
                    console.log("family exit edit！！！");
                });
            }
        }
        /**标记编辑模式下 点击返回时打开的模块 （只生效一次） */
        public markReturnModule(mod: { mod: string, data: any }) {
            this._onBackOpenModule = mod;
        }
        public checkHaveOperateTarget(): boolean {
            return this._mcOperateItem.getOperateMapItemInfo() != null;
        }
        public getCurOperateItem(): MapOperateItem {
            return this._mcOperateItem;
        }

        public showEditBox(flag: boolean) {
            this._mainUI.mcEditPanel.visible = flag;
            if (flag)
                Laya.timer.frameLoop(1, this, this.displayEditBox);
            else
                Laya.timer.clear(this, this.displayEditBox);
        }

        /**每一帧跟踪显示编辑框UI（缩放，位移） */
        private displayEditBox() {
            let globalPos = MapManager.mapItemsLayer.localToGlobal(new Laya.Point(this._mcOperateItem.x, this._mcOperateItem.y));
            this._mainUI.mcEditPanel.pos(globalPos.x, globalPos.y, true);

            let height: number = this._mainUI.mcEditPanel.height;
            let fz: boolean = globalPos.y + height > Laya.stage.height;
            let scale: number = Math.abs(this._mainUI.imgArrow.scaleY);
            this._mainUI.mcEditPanel.y = fz ? globalPos.y - height : globalPos.y;
            this._mainUI.imgArrow.scaleY = fz ? -scale : scale;
            this._mainUI.imgArrow.y = fz ? 91 : -10;
        }

        /**当前手上是否拿了一个建筑 */
        public get isDraging() {
            return this._mcOperateItem.isDraging;
        }
    }
}