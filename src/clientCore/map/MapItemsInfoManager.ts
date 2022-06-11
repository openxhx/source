namespace clientCore {
    /**
     * 存放所有建设信息以及建筑在地图里面的对象信息
     */
    export class MapItemsInfoManager {
        private static _instance: MapItemsInfoManager;

        //当前地图里面的建筑
        private _allBuildingInfoArr: util.HashMap<MapItemInfo>;

        private _packageSeedInfoArr: SeedInfo[];
        private _packageDecorationInfoArr: DecorationInfo[];
        private _packageHouseSkinInfoArr: SkinInfo[];

        private _mapItemsArr: MapItemBase[];//正真在地图里面显示的对象
        /**暂存一份服务器数据，用来编辑模式下判断是列表里拿出来的还是原来就就在地图上的*/
        private _mapSrvData: pb.IBuild[];

        //#region 活动可成长装饰相关
        /**地图上种植时间信息 */
        private _growDecorationSetTimeArr: util.HashMap<number>;
        /**暂存背包信息，用于编辑模式校验 */

        //#endregion

        private onListen: boolean;
        public get mapSrvData() {
            return this._mapSrvData;
        }

        public getGrowDecorationSetTime(getTime: number) {
            if(!this._growDecorationSetTimeArr.has(getTime)) return 0;
            return this._growDecorationSetTimeArr.get(getTime);
        }

        public static get instance(): MapItemsInfoManager {
            if (!MapItemsInfoManager._instance) {
                MapItemsInfoManager._instance = new MapItemsInfoManager();
            }
            return MapItemsInfoManager._instance;
        }

        public constructor() {
            this._allBuildingInfoArr = new util.HashMap();
            this._mapItemsArr = [];
            this._packageDecorationInfoArr = [];
            this._packageHouseSkinInfoArr = [];
            this._packageSeedInfoArr = [];
        }
        public initMapItemsInfo(data: pb.Isc_enter_map) {
            this.checkGrowDecoration(data.builds);
            this.addAllMapItems(data.builds);
            this.addEvents();
            if (MapInfo.isSelfHome || MapInfo.isSelfFamily) {
                this.checkBuildingsInPackage();
                this._mapSrvData = data.builds.slice();
            }
            if (MapInfo.isSelfHome) {
                this.checkHouseSkinInPackage();
            }
            MapManager.sortMapItems();
        }
        private addEvents() {
            if (MapInfo.isSelfHome) {
                EventManager.on(globalEvent.PRODUCE_SPEED_UP_SUCC, this, this.refreshRewardState);
                EventManager.on(globalEvent.GET_ONE_PRODUCT_IN_MODULE, this, this.refreshRewardState);
                EventManager.on(globalEvent.PRODUCE_START_GET_PRODUCTION, this, this.getProduction);
                EventManager.on(globalEvent.PRODUCE_GET_ALL_PRODUCTION, this, this.getAllProduction);
                net.listen(pb.sc_add_build_notify, this, this.buyMapItemNotify);
                EventManager.on("shop_buy_succ", this, this.shopItemBuySucc);
            }
            else if (MapInfo.isSelfFamily) {

            }
            if (!this.onListen) {
                net.listen(pb.sc_notify_user_build_change, this, this.mapItemsChangeNotify);
                Laya.timer.loop(1000, this, this.onTime);
                this.onListen = true;
            }
        }
        private removeEvents() {
            if (MapInfo.isSelfHome) {
                EventManager.off(globalEvent.PRODUCE_SPEED_UP_SUCC, this, this.refreshRewardState);
                EventManager.off(globalEvent.GET_ONE_PRODUCT_IN_MODULE, this, this.refreshRewardState);
                EventManager.off(globalEvent.PRODUCE_START_GET_PRODUCTION, this, this.getProduction);
                EventManager.off(globalEvent.PRODUCE_GET_ALL_PRODUCTION, this, this.getAllProduction);
                net.unListen(pb.sc_add_build_notify, this, this.buyMapItemNotify);
                EventManager.off("shop_buy_succ", this, this.shopItemBuySucc);
            }
            else if (MapInfo.isSelfFamily) {

            }
            net.unListen(pb.sc_notify_user_build_change, this, this.mapItemsChangeNotify);
            Laya.timer.clear(this, this.onTime);
            this.onListen = false;
        }

        /**
         * 地图摆放同步，自己家园不需要这个同步，所有需要排除
         * @param data 
         */
        private mapItemsChangeNotify(data: pb.sc_notify_user_build_change) {
            /** 只有在好友的家园才同步，这样做，防止出了家园到世界地图，后台也广播 */
            if (MapInfo.isOthersHome) {
                let buildsArr = data.builds;
                for (let i = 0; i < buildsArr.length; i++) {
                    let itemInfo = MapItemInfo.createMapItemInfoByIBuild(buildsArr[i]);
                    this.changeMapItemState(itemInfo);
                    this.refreshOneProducingState(buildsArr[i]);
                }
            }
            else if (MapInfo.isSelfFamily) {/**家族装饰同步 */
                if (this._mapItemsArr) {
                    for (let i = this._mapItemsArr.length - 1; i >= 0; i--) {
                        this._mapItemsArr[i].destroy();
                    }
                }
                this._mapItemsArr = [];

                let buildsArr = data.builds;
                for (let i = 0; i < buildsArr.length; i++) {
                    let itemInfo = MapItemInfo.createMapItemInfoByIBuild(buildsArr[i]);
                    this.changeMapItemState(itemInfo);
                    this.refreshOneProducingState(buildsArr[i]);
                }

                this.checkBuildingsInPackage();
            }
            else if (MapInfo.isSelfHome) {
                /**
                 * 正在生产的建筑，在放回背包里面的时候，正在生产的数据是不会清掉的
                 * 因为没有到保存的那步，都是不确定最后有没有收回背包的。
                 * ，所有在这个差异广播这里，如果是建筑被收回背包，则需要把生产的数据清一下
                 */
                let buildsArr = data.builds;
                for (let i = 0; i < buildsArr.length; i++) {
                    let itemInfo = MapItemInfo.createMapItemInfoByIBuild(buildsArr[i]);
                    if (itemInfo.type == 1 && itemInfo.putState == 0) {
                        let buildInfo = this._allBuildingInfoArr.get(itemInfo.getTime);
                        buildInfo.produceTotalNum = 0;
                        buildInfo.produceOneNeedTime = 0;
                        buildInfo.produceRestTime = 0;
                    }
                }
            }
        }
        public clearData() {
            this.removeEvents();
            if (this._mapItemsArr) {
                for (let i = this._mapItemsArr.length - 1; i >= 0; i--) {
                    this._mapItemsArr[i].destroy();
                }
            }
            this._mapItemsArr = [];
            this._allBuildingInfoArr.clear();
            this._packageSeedInfoArr = [];
            this._packageDecorationInfoArr = [];
            this._packageHouseSkinInfoArr = [];
            this._mapSrvData = [];
        }
        /**
         * 添加地图建筑信息
         */
        private addAllMapItems(arr: pb.IBuild[]) {
            if (!this._allBuildingInfoArr)
                this._allBuildingInfoArr = new util.HashMap();
            for (const info of arr) {
                let itemType = xls.get(xls.manageBuildingId).get(info.buildId).type;
                let itemInfo = MapItemInfo.createMapItemInfoByIBuild(info);
                if (itemType == 1) {
                    this._allBuildingInfoArr.add(itemInfo.getTime, itemInfo);
                }
                else if (itemType == 2) {
                }
                else if (itemType == 3) {
                    //生产相关信息
                }
                else if (itemType == 5) {
                    //家族地图建筑  建筑常驻地图，不用保存到数组
                }
                else if (itemType == 6) {
                    // this._mapDecorationInfoArr.push(itemInfo);
                }
                this.addOneMapItem(itemInfo);
            }
        }

        /**
         * 检查活动可成长装饰
         */
        private checkGrowDecoration(arr: pb.IBuild[]) {
            if (!this._growDecorationSetTimeArr)
                this._growDecorationSetTimeArr = new util.HashMap();
            let getTimeArr = _.filter(arr, (o) => { return o.buildId == 300161 }).map((o) => { return o.getTime });
            if (getTimeArr.length > 0) {
                net.sendAndWait(new pb.cs_mushroom_mobilozation_get_time({ getTime: getTimeArr, uid: LocalInfo.uid }))
                    .then((msg: pb.sc_mushroom_mobilozation_get_time) => {
                        for (let i = 0; i < getTimeArr.length; i++) {
                            this._growDecorationSetTimeArr.add(getTimeArr[i], msg.plantTime[i]);
                        }
                    })
            }
        }

        public checkHouseSkinInPackage() {
            this._packageHouseSkinInfoArr = [SkinInfo.createSkinInfo(3400001)];
            if (MapInfo.isSelfHome) {
                let items = clientCore.ItemBagManager.getItemsByKind(34);
                for (const info of items) {
                    this._packageHouseSkinInfoArr.push(SkinInfo.createSkinInfo(info.xlsInfo.itemId));
                }
            }
        }
        public async checkBuildingsInPackage(): Promise<any> {
            this._packageDecorationInfoArr = [];
            this._packageSeedInfoArr = [];
            if (MapInfo.isSelfHome) {
                const data = await net.sendAndWait(new pb.cs_get_all_builds_info({}));
                let arr = data.builds;
                for (const info of arr) {
                    let itemInfo = MapItemInfo.createMapItemInfoByIBuild(info);
                    if (!this._allBuildingInfoArr.has(itemInfo.getTime)) {
                        this._allBuildingInfoArr.add(itemInfo.getTime, itemInfo);
                    }
                    this._allBuildingInfoArr.get(itemInfo.getTime).putState = 0;
                }
                let decArr = data.decs;
                for (const decInfo of decArr) {
                    let itemInfo_1 = DecorationInfo.createDecorationInfo(decInfo.buildId, decInfo.buildNum);
                    this._packageDecorationInfoArr.push(itemInfo_1);
                }
                let seedArr = data.seeds;
                for (const seedInfo of seedArr) {
                    let itemInfo_2 = SeedInfo.createSeedInfo(seedInfo.SeedId, seedInfo.seedNum);
                    this._packageSeedInfoArr.push(itemInfo_2);
                }
            }
            else if (MapInfo.isSelfFamily) {
                const data_1 = await net.sendAndWait(new pb.cs_get_family_build_list({ fmlId: FamilyMgr.ins.familyId }));
                let decArr_1 = data_1.decs;
                for (const decInfo_1 of decArr_1) {
                    let itemInfo_3 = DecorationInfo.createDecorationInfo(decInfo_1.buildId, decInfo_1.buildNum);
                    this._packageDecorationInfoArr.push(itemInfo_3);
                }
            }
        }
        /**
         * 这里只有种子用这个商店购买成功的通知
         * 而小屋跟装饰用其他通知
         * 因为种子购买成功走背包通知，如果不想在背包里面做处理，就需要监听商店的购买成功事件，然后把种子加进来
         * @param id 
         * @param e 
         */
        private shopItemBuySucc(id: number, num: number, e: Laya.Event) {
            if (SeedFlowerRelateConf.isSeed(id)) {
                this.addSeedToPackage(id, num);
            }
        }
        public buyMapItemNotify(info: pb.sc_add_build_notify) {
            let arr = info.builds;
            for (const info of arr) {
                let itemType = xls.get(xls.manageBuildingId).get(info.buildId).type;
                let itemInfo = MapItemInfo.createMapItemInfoByIBuild(info);
                if (itemInfo.putState == 0) {
                    if (itemType == 1) {
                        if (!this._allBuildingInfoArr.has(itemInfo.getTime)) {
                            this._allBuildingInfoArr.add(itemInfo.getTime, itemInfo);
                        }
                    }
                    else if (itemType == 2) {
                        this.addSeedToPackage(info.buildId, 1);
                    }
                    else if (itemType == 3) {
                        this.addOneDecToPackage(info.buildId);
                    }
                }
                else if (itemInfo.putState == 1) {
                    this.changeMapItemState(itemInfo);
                }
            }
        }
        public addOneDecToPackage(id: number) {
            var haveFlag: boolean = false;
            for (let i = 0; i < this._packageDecorationInfoArr.length; i++) {
                if (this._packageDecorationInfoArr[i].decoID == id) {
                    this._packageDecorationInfoArr[i].num++;
                    haveFlag = true;
                    break;
                }
            }
            if (!haveFlag) {
                let decInfo = DecorationInfo.createDecorationInfo(id, 1);
                this._packageDecorationInfoArr.push(decInfo);
            }
        }
        public addSeedToPackage(id: number, num: number) {
            var haveFlag: boolean = false;
            for (let i = 0; i < this._packageSeedInfoArr.length; i++) {
                if (this._packageSeedInfoArr[i].seedID == id) {
                    this._packageSeedInfoArr[i].num += num;
                    haveFlag = true;
                    break;
                }
            }
            if (!haveFlag) {
                let seedInfo = SeedInfo.createSeedInfo(id, num);
                this._packageSeedInfoArr.push(seedInfo);
            }
        }
        private getAllProduction() {
            net.sendAndWait(new pb.cs_one_click_get_output({}))
                .then((data: pb.sc_one_click_get_output) => {
                    for (let info of data.builds) {
                        this.refreshOneProducingState(info);
                    }

                    let rewards = GoodsInfo.createArray(data.items as pb.Item[], true);
                    for (let i = 0; i < rewards.length; i++) {
                        alert.showFWords("获得：" + clientCore.ItemsInfo.getItemName(rewards[i].itemID) + " x" + rewards[i].itemNum);
                    }

                    // 珍稀道具展现效果
                    if (data.rareItems.length > 0) {
                        _.forEach(data.rareItems, (element: pb.IItem) => {
                            alert.showSpecialItem(element.id, element.cnt, new Laya.Point(Laya.stage.width / 2, Laya.stage.height / 2), 2);
                        })
                    }

                    EventManager.event(globalEvent.PRODUCE_GET_ALL_PRODUCTION_SUCC);
                })
                .catch(() => {

                });
        }
        private refreshOneProducingState(data: pb.IBuild) {
            for (let i = this._mapItemsArr.length - 1; i >= 0; i--) {
                let mapItem = this._mapItemsArr[i];
                if (mapItem.mapItemInfo.getTime == data.getTime) {
                    mapItem.mapItemInfo.refreshItemInfo(data);
                    mapItem.showCompleteReward();
                    if (mapItem.mapItemInfo.type == 2 && mapItem.mapItemInfo.putState == 0) {
                        EventManager.event(globalEvent.HARVEST_ONE_FLOWER, mapItem.mapItemInfo.id);
                        mapItem.removeSelf();
                        mapItem.destroy();
                        this._mapItemsArr.splice(i, 1);
                    }
                    if (mapItem.mapItemInfo.type == 1) {
                        this._allBuildingInfoArr.add(mapItem.getTime, mapItem.mapItemInfo);
                    }
                }
            }
        }

        private producingTimeCount() {
            for (let mapItem of this._mapItemsArr) {
                if (mapItem instanceof BuildingMapItem || mapItem instanceof FlowerMapItem) {
                    mapItem.refreshRestTime();
                }
                //活动可成长装饰
                if (mapItem instanceof DecorationMapItem && mapItem.mapItemInfo.id == 300161) {
                    mapItem.refreshRestTime();
                }
            }
            EventManager.event(globalEvent.PRODUCE_TIME_REFRESH);
        }

        private onTime(){
            if(MapInfo.isSelfHome) this.producingTimeCount();
            this.checkMapItemsHide();
        }

        private checkMapItemsHide() {
            let count = 0;
            let curOperateItemInfo = MapEditorManager.getInstance().getCurOperateItem()?.getOperateMapItemInfo();
            for (let mapItem of this._mapItemsArr) {
                let img = mapItem.img;
                let posx = img.x + mapItem.x;
                let posy = img.y + mapItem.y;
                let conPosx = LayerManager.mapLayer.x;
                let conPosy = LayerManager.mapLayer.y;
                if (curOperateItemInfo && curOperateItemInfo.getTime == mapItem.getTime) {/** 当前这个正在编辑，这跳过 */
                    continue;
                }
                mapItem.visible = MapInfo.mapEditState || !this.checkOutRange(posx, posy, img, conPosx, conPosy);
                // if (!mapItem.visible) {
                //     count++;
                // }
            }
            // console.log("隐藏地图物品数量：" + count);
        }
        private checkOutRange(imgPosx: number, imgPosy: number, img: Laya.Image, conPosx: number, conPosy: number): boolean {
            if (((imgPosx + img.width) * MapInfo.mapScale + conPosx) < 0) {/** 图片整体在屏幕左边 */
                return true;
            }
            if (((imgPosy + img.height) * MapInfo.mapScale + conPosy) < 0) {/** 图片整体在屏幕上边 */
                return true;
            }
            if ((imgPosx * MapInfo.mapScale + conPosx) > Laya.stage.width) {/** 图片整体在屏幕右边 */
                return true;
            }
            if ((imgPosy * MapInfo.mapScale + conPosy) > Laya.stage.height) {/** 图片整体在屏幕下边 */
                return true;
            }
        }

        private refreshRewardState(getTime: number) {
            for (let mapItem of this._mapItemsArr) {
                if (mapItem.mapItemInfo.getTime == getTime) {
                    mapItem.getOrProduceOneProduct();
                }
            }
        }
        private getProduction(getTime: number) {
            for (let mapItem of this._mapItemsArr) {
                if (mapItem.mapItemInfo.getTime == getTime) {
                    mapItem.getReward();
                }
            }
        }
        /**
         * 执行奇妙花宝一键浇水、施肥、锄草
         */
        public optOneKey() {
            let needClear = false;
            for (let item of this._mapItemsArr) {
                let itemInfo = item.mapItemInfo;
                if (itemInfo.type == 2) {
                    if (itemInfo.flowerNeedFertilizer > 0 || itemInfo.flowerNeedWater > 0) {
                        needClear = true;
                        break;
                    }
                    if (itemInfo.flowerWeedAppearStage > 0 && itemInfo.flowerCurStage == itemInfo.flowerWeedAppearStage) {
                        needClear = true;
                        break;
                    }
                }
            }
            if (!needClear) {
                alert.showFWords("没有需要照料的花朵哦~");
                return;
            }
            net.sendAndWait(new pb.cs_map_flower_one_click_opt({})).then((data: pb.sc_map_flower_one_click_opt) => {
                for (let info of data.builds) {
                    for (let mapItem of this._mapItemsArr) {
                        if (mapItem.mapItemInfo.getTime == info.getTime) {
                            mapItem.mapItemInfo.refreshItemInfo(info);
                            mapItem.showCompleteReward();
                        }
                    }
                }
                alert.showFWords("家园里面的花朵已经照料完了~");
            });
        }

        public getBuildingsAll() {
            return this._allBuildingInfoArr.getValues();
        }
        public getBuildingsInPackage(): MapItemInfo[] {
            return this.getBuildingInfoByPutState(0);
        }
        public getBuildingsInMap(): MapItemInfo[] {
            return this.getBuildingInfoByPutState(1);
        }
        private getBuildingInfoByPutState(type: number) {
            var arr: MapItemInfo[] = [];
            let tmpArr = this._allBuildingInfoArr.getValues();
            for (let i = 0; i < tmpArr.length; i++) {
                if (tmpArr[i].putState == type) {
                    arr.push(tmpArr[i]);
                }
            }
            return arr;
        }
        public getAllMapItems(): MapItemBase[] {
            return this._mapItemsArr.slice();
        }
        public getSeedInPackage(): SeedInfo[] {
            return this._packageSeedInfoArr;
        }
        public getHouseSkinInPackage(): SkinInfo[] {
            this.checkHouseSkinInPackage();
            return this._packageHouseSkinInfoArr;
        }
        public getAllFlowerInMap(): MapItemInfo[] {
            let arr: MapItemInfo[] = [];
            for (let i = 0; i < this._mapItemsArr.length; i++) {
                if (this._mapItemsArr[i].mapItemInfo.type == 2) {
                    arr.push(this._mapItemsArr[i].mapItemInfo);
                }
            }
            return arr;
        }
        /** 用来查询同ID花朵有多少 */
        public getFlowerInMapByID(id: number): MapItemInfo[] {
            let arr: MapItemInfo[] = [];
            for (let i = 0; i < this._mapItemsArr.length; i++) {
                if (this._mapItemsArr[i].mapItemInfo.id == id) {
                    arr.push(this._mapItemsArr[i].mapItemInfo);
                }
            }
            return arr;
        }
        public getDecorationInPackage(): DecorationInfo[] {
            return this._packageDecorationInfoArr;
        }
        public getPackageDecorationNumInById(id: number): number {
            for (let i = 0; i < this._packageDecorationInfoArr.length; i++) {
                if (this._packageDecorationInfoArr[i].decoID == id) {
                    return this._packageDecorationInfoArr[i].num;
                }
            }
            return 0;
        }
        public getDecorationInMap(): MapItemInfo[] {
            let arr: MapItemInfo[] = [];
            for (let i = 0; i < this._mapItemsArr.length; i++) {
                if (this._mapItemsArr[i].mapItemInfo.type == 3 || this._mapItemsArr[i].mapItemInfo.type == 6) {
                    arr.push(this._mapItemsArr[i].mapItemInfo);
                }
            }
            return arr;
        }
        /**根据id返回所有装饰的数量（无论在背包还是地图上） */
        public getAllDecorationNumByid(id: number): number {
            let count = 0;
            for (let i = 0; i < this._mapItemsArr.length; i++) {
                if (this._mapItemsArr[i].mapItemInfo.id == id) {
                    count++;
                }
            }
            for (let i = 0; i < this._packageDecorationInfoArr.length; i++) {
                if (this._packageDecorationInfoArr[i].decoID == id) {
                    count += this._packageDecorationInfoArr[i].num;
                }
            }
            return count;
        }

        public getPackageSeedNum(seedID: number) {
            for (let info of this._packageSeedInfoArr) {
                if (info.seedID == seedID) {
                    return info.num;
                }
            }
            return 0;
        }
        /**id 为 seedID */
        public reduceSeed(id: number, num: number = 1) {
            for (let i = 0; i < this._packageSeedInfoArr.length; i++) {
                if (this._packageSeedInfoArr[i].seedID == id) {
                    this._packageSeedInfoArr[i].num -= num;
                    if (this._packageSeedInfoArr[i].num <= 0) {
                        this._packageSeedInfoArr.splice(i, 1);
                    }
                    break;
                }
            }
        }
        public reduceDeco(id: number, num: number = 1) {
            for (let i = 0; i < this._packageDecorationInfoArr.length; i++) {
                if (this._packageDecorationInfoArr[i].decoID == id) {
                    this._packageDecorationInfoArr[i].num -= num;
                    if (this._packageDecorationInfoArr[i].num <= 0) {
                        this._packageDecorationInfoArr.splice(i, 1);
                    }
                    break;
                }
            }
        }
        /**
         * 这个方法是在同步地图编辑后调用。
         */
        public refreshAllMapItems(data: pb.IBuild[]) {
            this._mapSrvData = data.slice();
            this.checkGrowDecoration(data);
            this.clearTmpMapItems();
            for (let i = 0; i < this._mapSrvData.length; i++) {
                let tmpMapItemInfo: MapItemInfo = MapItemInfo.createMapItemInfoByIBuild(this._mapSrvData[i]);
                this.changeMapItemState(tmpMapItemInfo);
            }
            MapManager.sortMapItems();
            MapManager.refreshMapOccupyState();
        }
        /**
         * 编辑的时候临时加入的建筑，getTime时间都是小于1亿，在后台回包的时候，这些数据需要移除
         */
        private clearTmpMapItems() {
            for (let i = this._mapItemsArr.length - 1; i >= 0; i--) {
                if (this._mapItemsArr[i].mapItemInfo.getTime < MapItemInfo.MAX_UNIQUE_GET_TIME || _.findIndex(this._mapSrvData, (o) => { return o.buildId == this._mapItemsArr[i].mapItemInfo.buildInfo.buildId }) <= 0) {
                    this._mapItemsArr[i].destroy();
                    this._mapItemsArr.splice(i, 1);
                }
            }
        }

        private addOneMapItem(info: MapItemInfo) {
            var mapItem: MapItemBase;
            if (info.type == 1) {
                mapItem = new BuildingMapItem(info);
            }
            else if (info.type == 2) {
                mapItem = new FlowerMapItem(info);
            }
            else if (info.type == 3) {
                mapItem = new DecorationMapItem(info);
            }
            else if (info.type == 5) {
                mapItem = new FamilyBuildMapItem(info);
            }
            else if (info.type == 6) {
                mapItem = new DecorationMapItem(info);
            }
            this._mapItemsArr.push(mapItem);
            MapManager.mapItemsLayer.addChild(mapItem);
            // MapManager.addItem(mapItem);
            mapItem.mouseThrough = true;
        }
        /**
         * 建筑的增、删、改都通过这个接口。这样方便统一更新地图信息，统一更改场景建筑层级
         * @param info 
         */
        public changeMapItemState(info: MapItemInfo) {
            if (info.putState == 0) {
                this.removeOneMapItem(info.getTime);
            }
            else if (info.putState == 1) {
                var mcMapItem = this.getMapItemInMap(info.getTime);
                if (!mcMapItem) {
                    this.addOneMapItem(info);
                    mcMapItem = this.getMapItemInMap(info.getTime);
                }
                mcMapItem.visible = true;
                mcMapItem.mapItemInfo.mapPosRow = info.mapPosRow;
                mcMapItem.mapItemInfo.mapPosCol = info.mapPosCol;
                mcMapItem.img.scaleX = info.isReverse ? -1 : 1;
                mcMapItem.img.x = info.offsetPos.x;
                mcMapItem.img.y = info.offsetPos.y;
                mcMapItem.setPos();
            }
            else {
                console.log("run changeMapItemState function 'else' command");
            }
            MapManager.sortMapItems();
            MapManager.refreshMapOccupyState();
        }

        public getMapItemInMap(getTime: number): MapItemBase {
            for (let mcBuilding of this._mapItemsArr) {
                if (mcBuilding.getTime == getTime) {
                    return mcBuilding;
                }
            }
            return null;
        }

        public removeOneMapItem(getTime: number) {
            for (let i = 0; i < this._mapItemsArr.length; i++) {
                let mcBuilding = this._mapItemsArr[i];
                if (mcBuilding.getTime == getTime) {
                    mcBuilding.destroy();
                    this._mapItemsArr.splice(i, 1);
                    break;
                }
            }
        }

        public getBuildingInfoByGetTime(getTime: number) {
            return this._allBuildingInfoArr.get(getTime);
        }

        public getBuildingInfoByID(id: number) {
            let tmpArr = this._allBuildingInfoArr.getValues();
            for (let info of tmpArr) {
                if (info.id == id) {
                    return info;
                }
            }
            return null;
        }
        /** 这个接口新手引导用的 */
        public getFlowerInfoByID(id: number) {
            for (let info of this._mapItemsArr) {
                if (info.mapItemInfo.id == id) {
                    return info.mapItemInfo;
                }
            }
            return null;
        }

        /**根据id判断是否已经有了某个建筑,种子,装饰 */
        public checkHasSomeById(id: number) {
            let tmpArr = this._allBuildingInfoArr.getValues();
            let build = _.find(tmpArr, { 'id': id });
            return build;
        }
    }
}