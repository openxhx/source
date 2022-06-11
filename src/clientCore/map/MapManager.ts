namespace clientCore {
    const BOUND_MOVE_MAP_SPEED: number = 12;
    /**
     * 地图类，包含地图的所有层级，地图操作控制
     */
    export class MapManager {
        public static boundRect: Laya.Rectangle = new Laya.Rectangle(); //布置模式下 触及方框移动屏幕
        // //移动操作实现
        private static moveImp: BaseMoveImp;
        public static curMap: MapBase;//所有地图分层信息
        public static gridBlockPool: MapGridBlock[] = [];
        public static isPickingMapItem: boolean = false;

        public constructor() {
        }

        public static setGridLayerVisible(b: boolean) {
            let gridLayer: Laya.Sprite = MapManager.curMap.gridLayer;
            gridLayer.active = b;
            if (b) {
                clientCore.LayerManager.mapLayer.addChildAt(gridLayer, 4);
            }
            else {
                gridLayer.removeSelf();
            }
        }

        public static setUp() {
            clientCore.LayerManager.mapLayer.on(Laya.Event.MOUSE_UP, this, this.onMouseUpOrOut);
            clientCore.LayerManager.mapLayer.on(Laya.Event.ROLL_OUT, this, this.onMouseUpOrOut);
            clientCore.LayerManager.mapLayer.on(Laya.Event.MOUSE_WHEEL, this, this.onWheel);
            net.listen(pb.sc_svr_down_notify, this, this.onMapSrvDown);
            this.onReSize();
            Laya.stage.on(Laya.Event.RESIZE, this, this.onReSize);
            this.moveImp = new MobileImp();
        }

        /**服务器挂了，重新进一次家园 */
        private static async onMapSrvDown(data: pb.sc_svr_down_notify) {
            clientCore.ModuleManager.closeAllOpenModule();
            if (data.svrType == 'home' && (MapInfo.isOthersHome || MapInfo.isSelfHome)) {
                LoadingManager.showSmall('家园修葺中，正在重新进入……');
                await util.TimeUtil.awaitTime(5000);
                LoadingManager.hideSmall(true);
                let uid = parseInt(MapInfo.mapData);
                this.enterHome(uid, null, { force: true });
            }
            if (data.svrType == 'family' && MapInfo.isSelfFamily) {
                LoadingManager.showSmall('家族领地维护中，正在返回家园……');
                await util.TimeUtil.awaitTime(5000);
                LoadingManager.hideSmall(true);
                this.enterHome(LocalInfo.uid, null, { force: true });
            }
        }

        private static getChangeMapLoadingInfo(type: number, mapID: number): string {
            if (type == 1) {
                return "正在前往家园……";
            }
            else if (type == 2) {
                return "正在前往家族……";
            }
            else if (type == 3) {
                return '正在前往派对……'
            }
            else if (type == 4) {
                return "正在前往 " + xls.get(xls.map).get(mapID).name + "……";
            }
            else if (type == 5) {
                return "正在前往 " + xls.get(xls.map).get(mapID).name + "……";
            }
            else if (type == 6) {
                return '正在前往结缘礼……';
            }
            else if (type == 7) {
                return '正在前往' + xls.get(xls.map).get(mapID).name + "……";
            }
        }

        /**
         * 切换地图，切换完成后会刷新MapInfo数据再返回promise
         * 需要catch，以防切换地图失败
         * @param uid 地图所有者uid
         */
        private static async startChangeMap(info: pb.cs_enter_map, needLoading: boolean = true, isGameStart: boolean = false) {
            console.log("start send change map command!");
            EventManager.event(globalEvent.START_CHANGE_MAP);
            if (needLoading) {
                console.log("enter map loading show!");
                LoadingManager.show(this.getChangeMapLoadingInfo(info.type, info.mapId));
                await LoadingManager.setLoading("", 1);
            }
            let mapdata = await this.reqChangeMap(info);
            if (mapdata) {
                ModuleManager.closeAllOpenModule();
                if (MapInfo.mapID == 24) OnsenRyokanManager.ins.outOnsenRyokan();//温泉会馆
                if (mapdata.map.mapId == 12) {
                    SearchClubsMapManager.ins.addEvent();
                }
                await LoadingManager.setLoading("", 40);
                this.clearMap();
                MapInfo.type = info.type;
                MapInfo.mapData = info.mapData;
                MapInfo.mapID = mapdata.map.mapId;
                await this.mapChangeOver(mapdata, info.xy);
                await LoadingManager.setLoading("", 100);
                EventManager.event(globalEvent.ENTER_MAP_SUCC);
            }
            else {
                //错误的话 也等待一下
                await LoadingManager.setLoading("", 40);
                await LoadingManager.setLoading("", 80);
                EventManager.event(globalEvent.ENTER_MAP_FAIL);
            }
            await LoadingManager.hide();
            if (!isGameStart && mapdata && mapdata.map.mapId == 1) {
                EventManager.event(globalEvent.FULL_SCREEN_CLOSE_OR_BACK_HOME);
            }
        }

        private static reqChangeMap(info: pb.cs_enter_map): Promise<pb.Isc_enter_map> {
            return net.sendAndWait(info).then((data: pb.sc_enter_map) => {
                return Promise.resolve(data);
            }).catch(e => {
                return Promise.resolve(null)
            })
        }

        /**
         * 切换地图，需要对当前地图进行销毁
         */
        public static clearMap() {
            if (this.curMap) {
                AvatarManager.ins.clear();
                PeopleManager.getInstance().removeAllPeople();
                if (MapInfo.type == 1 || MapInfo.type == 2) {
                    MapItemsInfoManager.instance.clearData();
                }
                else if (MapInfo.type == 3) {
                    PartyItemManager.clearData();
                }
                this.curMap.destroy();
            }
            // //复苏之春，之后删掉
            // AwakeSpringManager.ins.removeAllAni();
        }

        private static async mapChangeOver(data: pb.Isc_enter_map, pos: pb.IPoint) {
            //地图数据
            console.log("start create map!");
            // this.curMap = new HomeMap();
            this.curMap = this.getMap();
            this.curMap.initData(this.getLocalObject(data));
            // //复苏之春交互，之后删掉
            // this.checkAwakeSpring(data.map.mapId);
            /////////////////////////////////
            await this.curMap.init();
            //渲染地图
            this.curMap.drawMap();
            /**初始化地图建筑信息，派对的跟其他的要分开 */
            if (MapInfo.type == 3) {
                PartyItemManager.initPartyMapInfo(data);
            }
            else {
                MapItemsInfoManager.instance.initMapItemsInfo(data);
            }
            //设置默认视角大小
            MapInfo.mapScale = 1.5;
            LayerManager.mapLayer.scale(MapInfo.mapScale, MapInfo.mapScale);
            //温泉会馆，活动结束删掉
            let player: Player = PeopleManager.getInstance().player;
            player.checkOnsenRyokan();
            //添加地图人物
            this.setSelfBodyPos(pos.x, pos.y);
            PeopleManager.getInstance().addMapPeople(data.users);
            this.setGridLayerVisible(false);
            this.resizeMap();
            console.log("enter map run complete!!!");
        }

        public static resizeMap(): void {
            let offx: number = Math.max(0, Laya.stage.width - MapInfo.mapWidth * MapInfo.mapScale);
            if (MapInfo.offsetX != offx) { //超过了最大值
                MapInfo.offsetX = offx / 2;
                this.clampMap();
            }
        }

        /**复苏之春特殊交互 */
        private static checkAwakeSpring(mapid: number) {
            if (!this.checkActitity(121)) return;
            if (mapid != 11 && mapid != 18) return;
            AwakeSpringManager.ins.addAnimalToMap(mapid);
        }

        /**获取特殊采集对象 */
        private static getLocalObject(data: pb.Isc_enter_map) {
            let configs = xls.get(xls.mapObject).getValues();
            let mapId = data.map.mapId;
            let objects = _.filter(configs, (o) => {
                return o.mapId == mapId && o.pickExtent > 0
            });
            for (let i: number = 0; i < objects.length; i++) {
                // if (!this.judgeShowTime(objects[i].beginDate, objects[i].endDate)) continue;
                if (!this.checkActitity(objects[i].pickExtent)) continue;
                for (let j = 0; j < objects[i].pos.length; j++) {
                    let item = new pb.PickItem();
                    item.pos = new pb.Point();
                    item.pos.x = objects[i].pos[j].v1;
                    item.pos.y = objects[i].pos[j].v2;
                    item.posId = objects[i].id;
                    item.rTime = 0;
                    item.remain = 100;
                    data.itms.push(item);
                }
            }
            return data;
        }

        /**判断采集对象是否在可采集时间 */
        private static judgeShowTime(start: string, end: string) {
            let cur = new Date(clientCore.ServerManager.curServerTime);
            let startInfo = start.split("/");
            if (cur.getFullYear() < parseInt(startInfo[0]) || cur.getMonth() + 1 < parseInt(startInfo[1]) || cur.getDate() < parseInt(startInfo[2])) return false;
            let endInfo = end.split("/");
            if (cur.getFullYear() > parseInt(endInfo[0]) || cur.getMonth() + 1 > parseInt(endInfo[1]) || cur.getDate() > parseInt(endInfo[2])) return false;
            return true;
        }

        /** 检查对应活动是否在时间内*/
        private static checkActitity(id: number): boolean {
            let ct: number = clientCore.ServerManager.curServerTime;
            let event: xls.eventControl = xls.get(xls.eventControl).get(id);
            let arr: string[] = event.eventTime.split("_");
            let dst: number = util.TimeUtil.formatTimeStrToSec(arr[0]);
            let det: number = util.TimeUtil.formatTimeStrToSec(arr[1]);
            return ct >= dst && ct <= det;
        }

        /**通过这个接口直接把自己的人模放到地图的某个位置 */
        public static setSelfBodyPos(x: number, y: number) {
            let player: Player = PeopleManager.getInstance().player;
            player.pos(x, y);
            player.resetScale();
            player.creFlowerPet(FlowerPetInfo.select.big, FlowerPetInfo.select.little, x, y);
            player.showFlowerPet(FlowerPetInfo.followStatus == 1);
            LayerManager.mapLayer.x = -(x * MapInfo.mapScale - Laya.stage.width / 2);
            LayerManager.mapLayer.y = -(y * MapInfo.mapScale - Laya.stage.height / 2);
            this.clampMap();
        }

        /**移动地图使屏幕中心对准传入的坐标（相对于屏幕） */
        public static tweenCameraCenterTo(x: number, y: number, time: number) {
            let targetX = -(x * MapInfo.mapScale - Laya.stage.width / 2);
            let targetY = -(y * MapInfo.mapScale - Laya.stage.height / 2);
            targetX = _.clamp(targetX, -(MapInfo.mapWidth * MapInfo.mapScale - Laya.stage.width), 0);
            targetY = _.clamp(targetY, -(MapInfo.mapHeight * MapInfo.mapScale - Laya.stage.height), 0);
            if (targetY != LayerManager.mapLayer.y || targetX != LayerManager.mapLayer.x) {
                LayerManager.mapLayer.mouseEnabled = false;
                Laya.Tween.to(LayerManager.mapLayer, {
                    x: targetX,
                    y: targetY
                }, time, Laya.Ease.cubicOut, new Laya.Handler(this, () => {
                    LayerManager.mapLayer.mouseEnabled = true;
                }));
            }
        }

        private static getMap(): MapBase {
            switch (MapInfo.type) {
                case 1: //家园
                    if (MapInfo.isSelfHome) {
                        return new HomeMap();
                    }
                    else if (MapInfo.isOthersHome) {
                        return new FriendHomeMap();
                    }
                case 2: //家族
                    return new FamilyMap();
                case 3:
                    return new PartyMap();
                case 4:
                    return new BossMap();
                case 5://世界地图
                    return new WorldMap();
                case 6:
                    return new WeddingMap();
                case 7:
                    switch (MapInfo.mapID) {
                        case 23:
                            return new AnswerMap();
                        case 24:
                            return new OnsenRyokanMap();
                        case 25:
                            return new OrchardMap();
                    }

                default:
                    return null;
            }
        }

        private static onReSize() {
            //碰到左右边距100 上80 下150区域开始移动地图
            MapManager.boundRect.x = 100;
            MapManager.boundRect.width = Laya.stage.width - 100 * 2;
            MapManager.boundRect.y = 80;
            MapManager.boundRect.height = Laya.stage.height - 150;
        }

        /**
         * 留给touchManager的接口
         * @param e
         */
        public static onMouseDown(e: Laya.Event) {

            if (!GuideMainManager.instance.isGuideAction) {
                this.moveImp.mouseDown(e);
                clientCore.LayerManager.mapLayer.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            }
        }

        private static onMouseUpOrOut(e: Laya.Event) {
            this.moveImp.mouseUpOrOut(e);
            clientCore.LayerManager.mapLayer.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }

        private static onMouseMove(e: Laya.Event) {
            this.moveImp.mouseMove(e);
        }

        private static onWheel(e: Laya.Event) {
            this.moveImp.mouseWheel(e);
        }

        /**固定地图范围*/
        public static clampMap() {
            clientCore.LayerManager.mapLayer.y = _.clamp(clientCore.LayerManager.mapLayer.y, -(MapInfo.mapHeight * MapInfo.mapScale - Laya.stage.height), 0);
            if (MapInfo.offsetX > 0) {
                clientCore.LayerManager.mapLayer.x = MapInfo.offsetX;
                return;
            }
            clientCore.LayerManager.mapLayer.x = _.clamp(clientCore.LayerManager.mapLayer.x, -(MapInfo.mapWidth * MapInfo.mapScale - Laya.stage.width), 0);
            // clientCore.LayerManager.mapLayer.y = _.clamp(clientCore.LayerManager.mapLayer.y, -(MapInfo.mapHeight * MapInfo.mapScale - Laya.stage.height), 0);
        }

        /**
         * 缩放地图
         * @param x 缩放中心x
         * @param y 缩放中心y
         * @param delta 只判断正负 大于0放大
         */
        public static zoom(x: number, y: number, delta: number) {
            let bgX = clientCore.LayerManager.mapLayer.x;
            let bgY = clientCore.LayerManager.mapLayer.y;
            let tmpScale: number = MapInfo.mapScale + (delta > 0 ? MapInfo.scaleChangePerFrame : -MapInfo.scaleChangePerFrame);
            if (_.inRange(tmpScale, MapInfo.mapMinScale, MapInfo.mapMaxScale)) {
                bgX -= (x - bgX) * (tmpScale - MapInfo.mapScale) / (MapInfo.mapScale);
                bgY -= (y - bgY) * (tmpScale - MapInfo.mapScale) / (MapInfo.mapScale);
                if (!this.checkScale(tmpScale)) return;
                MapInfo.mapScale = tmpScale;
                clientCore.LayerManager.mapLayer.pos(bgX, bgY);
                clientCore.LayerManager.mapLayer.scale(MapInfo.mapScale, MapInfo.mapScale);
                this.clampMap();
                EventManager.event(globalEvent.MAP_SCALE, tmpScale);
            }
        }

        public static initRect(x: number, y: number, value: number): void {
            let bgX = clientCore.LayerManager.mapLayer.x;
            let bgY = clientCore.LayerManager.mapLayer.y;
            let tmpScale: number = value;
            if (_.inRange(tmpScale, MapInfo.mapMinScale, MapInfo.mapMaxScale)) {
                bgX -= (x - bgX) * (tmpScale - MapInfo.mapScale) / (MapInfo.mapScale);
                bgY -= (y - bgY) * (tmpScale - MapInfo.mapScale) / (MapInfo.mapScale);
                if (!this.checkScale(tmpScale)) return;
                MapInfo.mapScale = tmpScale;
                clientCore.LayerManager.mapLayer.pos(bgX, bgY);
                clientCore.LayerManager.mapLayer.scale(MapInfo.mapScale, MapInfo.mapScale);
                this.clampMap();
                EventManager.event(globalEvent.MAP_SCALE, tmpScale);
            }
        }

        /**
         * 检查地图缩放是否合法
         * @param scale
         */
        public static checkScale(scale: number): boolean {
            return MapInfo.mapWidth * scale - Laya.stage.width >= 0 && MapInfo.mapHeight * scale - Laya.stage.height >= 0;
        }

        public static enterEditMode() {
            MapManager.curMap.peopleLayer.visible = false;
            this.moveImp.disableMove();
            UIManager.close();
            Laya.timer.frameLoop(1, this, this.moveMapWhenBound);
        }

        public static exitEditMode() {
            MapManager.curMap.peopleLayer.visible = true;
            this.moveImp.enableMove();
            UIManager.open();
            Laya.timer.clear(this, this.moveMapWhenBound);
        }

        public static get _moveImp() {
            return this.moveImp;
        }

        private static moveMapWhenBound() {
            if (!(MapEditorManager.getInstance().isDraging || PartyEditorManager.ins.isPartyItemDraging))
                return;
            if (!_.inRange(Laya.stage.mouseX, MapManager.boundRect.x, MapManager.boundRect.right)) {
                clientCore.LayerManager.mapLayer.x += (Laya.stage.mouseX < MapManager.boundRect.x) ? BOUND_MOVE_MAP_SPEED : -BOUND_MOVE_MAP_SPEED;
            }
            if (!_.inRange(Laya.stage.mouseY, MapManager.boundRect.y, MapManager.boundRect.bottom)) {
                clientCore.LayerManager.mapLayer.y += (Laya.stage.mouseY < MapManager.boundRect.y) ? BOUND_MOVE_MAP_SPEED : -BOUND_MOVE_MAP_SPEED;
            }
            this.clampMap();
        }

        /**
         * 刷新网格信息
         * @param type
         */
        public static refreshGridState(type: number) {
            this.curMap.mapGrid.refreshGridState(type);
        }

        /**
         * 是否显示花园
         * @param isShow
         */
        public static showGarden(isShow: boolean): void {
            this.curMap.setAllLayerShowState(isShow);
            isShow ? UIManager.open() : UIManager.close();
        }

        public static get downLayer(): Laya.Sprite {
            return this.curMap.downLayer;
        }

        public static get peopleLayer(): Laya.Sprite {
            return this.curMap.peopleLayer;
        }

        public static get mapItemsLayer(): Laya.Sprite {
            return this.curMap.mapItemsLayer;
        }

        public static get avatarLayer(): Laya.Sprite {
            return this.curMap.avatarLayer;
        }

        public static get effectLayer(): Laya.Sprite {
            return this.curMap.effectLayer;
        }

        public static get upLayer(): Laya.Sprite {
            return this.curMap.upLayer;
        }

        /**
         * 把建筑添加到场景中 会自动把资源相同的放到相邻位置 减少drawcall
         * @param item
         */
        public static addItem(item: MapItemBase): void {
            let len: number = this.curMap.mapItemsLayer.numChildren;
            let index: number = len;
            if (item.url) {
                for (let i: number = 0; i < len; i++) {
                    let node: Laya.Node = this.curMap.mapItemsLayer.getChildAt(i);
                    if (node instanceof MapItemBase && item.url == node.url) {
                        index = i;
                        break;
                    }
                }
            }
            this.curMap.mapItemsLayer.addChildAt(item, index);
        }

        /**扩建按钮层 */
        public static get mapExpandLayer(): Laya.Sprite {
            return this.curMap.mapExpandLayer;
        }

        public static get gridLayer(): Laya.Sprite {
            return this.curMap.gridLayer;
        }

        public static get mapUpLayer(): Laya.Sprite {
            return this.curMap.mapUpLayer;
        }

        public static hideAllPeople() {
            if (this.curMap) {
                this.curMap.peopleLayer.visible = false;
            }
        }

        public static showAllPeople() {
            if (this.curMap) {
                this.curMap.peopleLayer.visible = true;
            }
        }

        public static checkCanPut(r: number, c: number, t: number): boolean {
            return this.curMap.mapGridData.checkCanPut(r, c, t);
        }

        public static refreshMapOccupyState() {
            if (!this.curMap.mapGridData) {
                return;
            }
            this.curMap.mapGridData.refreshOccupyState();
        }

        public static get mapGridInfoArr() {
            return this.curMap.mapGridData.mapGridInfoArr;
        }

        public static sortMapItems() {
            let mapItemsLayer = MapManager.mapItemsLayer;
            let itemsNum = mapItemsLayer.numChildren;
            let mapItemsArr = [];
            let rewardArr = [];
            let partyItemArr = [];
            for (let i = itemsNum - 1; i >= 0; i--) {
                let item = mapItemsLayer.getChildAt(i);
                if (item instanceof MapItemBase) {
                    mapItemsArr.push(item);
                }
                else if (item instanceof ui.commonUI.item.mapRewardItemUI) {
                    rewardArr.push(item);
                }
                else if (item instanceof PartyMapItem) {
                    partyItemArr.push(item);
                }
            }
            mapItemsArr.sort(this.mapItemsCompare);
            rewardArr.sort(this.mapItemsCompare);
            partyItemArr.sort(this.partyItemCompare);
            for (let i = 0; i < mapItemsArr.length; i++) {
                mapItemsLayer.addChild(mapItemsArr[i]);
            }
            for (let i = 0; i < rewardArr.length; i++) {
                mapItemsLayer.addChild(rewardArr[i]);
            }
            for (let i = 0; i < partyItemArr.length; i++) {
                mapItemsLayer.addChild(partyItemArr[i]);
            }

        }

        private static partyItemCompare(item1: PartyMapItem, item2: PartyMapItem): number {
            if (item1.itemInfo.putType == item2.itemInfo.putType) {
                if (item1.lowBoundPos > item2.lowBoundPos) {
                    return 1;
                }
                else if (item1.lowBoundPos == item2.lowBoundPos) {
                    if (item1.x > item2.x) {
                        return 1;
                    }
                    else if (item1.x == item2.x) {
                        return 0;
                    }
                    else {
                        return -1;
                    }
                }
                else {
                    return -1;
                }
            }
            if (item1.itemInfo.putType == 1) {/** 不等的情况 */
                return -1;
            }
            else if (item1.itemInfo.putType == 2) {
                return 1;
            }
            else if (item1.itemInfo.putType == 3) {
                if (item2.itemInfo.putType == 1) {
                    return 1;
                }
                else if (item2.itemInfo.putType == 2) {
                    return -1;
                }
            }
        }

        /**
         * 地图建筑跟物品排序比较函数
         * 规则，先行后列，数值大的在上层
         * @param item1
         * @param item2
         */
        private static mapItemsCompare(item1: Laya.Sprite, item2: Laya.Sprite): number {
            if (item1.y > item2.y) {
                return 1;
            }
            else if (item1.y == item2.y) {
                if (item1.x > item2.x) {
                    return 1;
                }
                else if (item1.x == item2.x) {
                    return 0;
                }
                else {
                    return -1;
                }
            }
            else {
                return -1;
            }
        }

        public static async enterHome(uid: number, pos?: Laya.Point, param?: { force: boolean }) {
            let checkCanEnter = true;
            if (param && param.force)
                checkCanEnter = false;
            if (checkCanEnter) {
                if(LocalInfo.onLimit){
                    // alert.showFWords("雪人状态禁止移动~");
                    return Promise.resolve(false);
                }
                if (MapManager.isPickingMapItem) {
                    alert.showSmall("采集期间不能回家园，是否退出采集？", {
                        callBack: {
                            caller: this, funArr: [() => {
                                UserPickManager.ins.stopPick();
                                this.enterHome(uid, pos)
                            }]
                        },
                        btnType: alert.Btn_Type.SURE_AND_CANCLE,
                        needMask: true,
                        clickMaskClose: true
                    });
                    return Promise.resolve(false);
                }
                if (MapInfo.type == 1 && parseInt(MapInfo.mapData) == uid) {
                    alert.showFWords("已经在玩家家园里面！");
                    return Promise.resolve(false);
                }
            }
            let isGameStart: boolean = true;
            if (!pos) {
                isGameStart = false;
                pos = new Laya.Point(Laya.Browser.clientWidth / 2 + (Math.random() * 600 - 300), Laya.Browser.clientHeight / 2 + (Math.random() * 400 - 200));
            }
            await this.startChangeMap(new pb.cs_enter_map({
                mapData: uid + "",
                mapId: 1,
                type: 1,
                xy: { x: pos.x, y: pos.y }
            }), true, isGameStart);
            return Promise.resolve(true);
        }

        public static async enterWorldMap(mapID: number, pos?: Laya.Point) {
            if(LocalInfo.onLimit){
                // alert.showFWords("雪人状态禁止移动~");
                return;
            }
            if (MapManager.isPickingMapItem) {
                alert.showSmall("采集期间不能切换地图，是否退出采集？", {
                    callBack: {
                        caller: this,
                        funArr: [() => {
                            UserPickManager.ins.stopPick();
                            this.enterWorldMap(mapID, pos)
                        }]
                    },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true
                });
                return;
            }
            if (!pos) {
                pos = new Laya.Point();
                let tmpPos = xls.get(xls.map).get(mapID).bornPos;
                pos.x = tmpPos.v1;
                pos.y = tmpPos.v2;
            }
            await this.startChangeMap(new pb.cs_enter_map({
                mapData: "",
                mapId: mapID,
                type: 5,
                xy: { x: pos.x, y: pos.y }
            }), true);
        }

        public static async enterFamily(familyID: string, mapID: number, pos?: Laya.Point) {
            if(LocalInfo.onLimit){
                // alert.showFWords("雪人状态禁止移动~");
                return;
            }
            if (MapManager.isPickingMapItem) {
                alert.showSmall("采集期间不能进家族，是否退出采集？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            UserPickManager.ins.stopPick();
                            this.enterFamily(familyID, mapID, pos)
                        }]
                    },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true
                });
                return;
            }
            if (!pos) {
                pos = new Laya.Point(Laya.Browser.clientWidth / 2 + Math.floor((Math.random() * 600 - 300)), Laya.Browser.clientHeight / 2 + Math.floor((Math.random() * 400 - 200)));
            }
            await this.startChangeMap(new pb.cs_enter_map({
                mapData: familyID + "",
                mapId: mapID,
                type: 2,
                xy: { x: pos.x, y: pos.y }
            }), true);
        }

        public static async enterBossMap(mapID: number, pos?: Laya.Point) {
            if(LocalInfo.onLimit){
                // alert.showFWords("雪人状态禁止移动~");
                return;
            }
            if (MapManager.isPickingMapItem) {
                alert.showSmall("采集期间不能切换地图，是否退出采集？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            UserPickManager.ins.stopPick();
                            this.enterBossMap(mapID, pos)
                        }]
                    },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true
                });
                return;
            }
            if (!pos) {
                pos = new Laya.Point();
                let tmpPos = xls.get(xls.map).get(mapID).bornPos;
                pos.x = tmpPos.v1;
                pos.y = tmpPos.v2;
            }
            await this.startChangeMap(new pb.cs_enter_map({
                mapData: "",
                mapId: mapID,
                type: 4,
                xy: { x: pos.x, y: pos.y }
            }), true);
        }

        public static async enterParty(uid: number, pos?: Laya.Point) {
            if(LocalInfo.onLimit){
                // alert.showFWords("雪人状态禁止移动~");
                return;
            }
            if (MapManager.isPickingMapItem) {
                alert.showSmall("采集期间不能切换地图，是否退出采集？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            UserPickManager.ins.stopPick();
                            this.enterParty(uid, pos)
                        }]
                    },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true
                });
                return;
            }
            if (!pos) {
                pos = new Laya.Point(Math.floor((Math.random() * 3000 + 300)), Math.floor((Math.random() * 600 + 565)));
            }
            await this.startChangeMap(new pb.cs_enter_map({
                mapData: uid + "",
                mapId: 3,
                type: 3,
                xy: { x: pos.x, y: pos.y }
            }), true);
        }

        public static async enterWedding(weddingInfo: pb.IWeddingInfo) {
            if(LocalInfo.onLimit){
                // alert.showFWords("雪人状态禁止移动~");
                return;
            }
            if (MapManager.isPickingMapItem) {
                alert.showSmall("采集期间不能切换地图，是否退出采集？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            UserPickManager.ins.stopPick();
                            this.enterWedding(weddingInfo)
                        }]
                    },
                    needMask: true,
                    clickMaskClose: true
                });
                return;
            }
            if (MapInfo.mapID == weddingInfo.mapId && MapInfo.mapData == weddingInfo.weddingId) {
                alert.showFWords('已经在该结缘礼现场')
                return;
            }
            let pos = new Laya.Point(_.random(500, 2500), _.random(300, 1500));
            await this.startChangeMap(new pb.cs_enter_map({
                mapData: weddingInfo.weddingId,
                mapId: weddingInfo.mapId,
                type: 6,
                xy: { x: pos.x, y: pos.y }
            }), true);
        }

        public static async enterActivityMap(mapID: number, pos?: Laya.Point) {
            if(LocalInfo.onLimit){
                // alert.showFWords("雪人状态禁止移动~");
                return;
            }
            if (MapManager.isPickingMapItem) {
                alert.showSmall("采集期间不能切换地图，是否退出采集？", {
                    callBack: {
                        caller: this, funArr: [() => {
                            UserPickManager.ins.stopPick();
                            this.enterBossMap(mapID, pos)
                        }]
                    },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true
                });
                return;
            }
            if (!pos) {
                pos = new Laya.Point();
                let tmpPos = xls.get(xls.map).get(mapID).bornPos;
                pos.x = tmpPos.v1;
                pos.y = tmpPos.v2;
            }
            await this.startChangeMap(new pb.cs_enter_map({ mapId: mapID, type: 7, xy: { x: pos.x, y: pos.y } }), true);
        }

        public destroy() {
        }
    }
}


