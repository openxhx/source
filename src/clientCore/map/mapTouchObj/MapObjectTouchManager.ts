namespace clientCore {
    /**
     * 地图触发控制
     * 带有红点逻辑
     * 
     * 
     */
    export class MapObjectTouchManager {
        private static _mapTouchObjHashMap: util.HashMap<xls.mapTouchObj[]>;//存储地图有几个地图触发信息
        private static _mouseDownPos: Laya.Point;
        private static _globalBeanHashMap: util.HashMap<core.IGlobalBean>;//全局bean对象
        private static _globalInfoArr: xls.mapTouchObj[];//全局bean xls信息
        private static _mapObjHashMap: util.HashMap<MapTouchObject>;
        private static _redPointHashMap: util.HashMap<MapTouchObject>
        constructor() {

        }
        public static async loadRes() {
            await Promise.all([
                xls.load(xls.mapTouchObj),
                ModuleManager.loadJs("mapBean")
            ]);
        }
        public static setUp() {
            this._mouseDownPos = new Laya.Point();
            this.parseEventInfo();
            EventManager.on(globalEvent.ENTER_MAP_SUCC, this, this.changeMapSucc);
            EventManager.on(globalEvent.ENTER_MAP_FAIL, this, this.changeMapSucc);
            EventManager.on(globalEvent.USER_LEVEL_UP, this, this.checkOpenByLvUp);
            EventManager.once(globalEvent.ENTER_MAP_SUCC, this, this.startInitGlobalBean);
            EventManager.on(globalEvent.RED_POINT_CHANGED, this, this.redPointChange);
            EventManager.on(globalEvent.RED_POINT_CHANGED_BY_NOTICE, this, this.redPointChangeByNotice);
            EventManager.on(globalEvent.START_CHANGE_MAP, this, this.startChangeMap);
        }

        public static checkHouseShow() {
            return !!this._mapObjHashMap.get(9) && this._mapObjHashMap.get(9).visible;
        }

        public static changeObjSkin(id: number, tempId: number) {
            this._mapObjHashMap.get(id)?.skinChange(tempId);
        }
        private static startChangeMap() {
            if (this._mapObjHashMap) {
                let mapObjArr = this._mapObjHashMap.getValues();
                for (let i = 0; i < mapObjArr.length; i++) {
                    mapObjArr[i].offAll();
                    mapObjArr[i].destroy();
                }
            }
        }
        private static checkOpenByLvUp() {
            let curMapID = this.getCurrMapID();
            if (curMapID > 0 && this._mapTouchObjHashMap.has(curMapID)) {
                let mapObjArr = this._mapTouchObjHashMap.get(curMapID);
                if (!mapObjArr) return;
                for (let i = 0; i < mapObjArr.length; i++) {
                    if (!this._mapObjHashMap.has(mapObjArr[i].ID)) {
                        this.addOneMapObj(mapObjArr[i]);
                    }
                }
            }
        }
        private static redPointChange(id: number) {
            if (this._redPointHashMap) {
                if (this._redPointHashMap.has(id)) {
                    let mapObj = this._redPointHashMap.get(id);
                    mapObj.redPointChange();
                }
            }
        }

        private static redPointChangeByNotice() {
            if (this._redPointHashMap) {
                let arr = this._redPointHashMap.getValues();
                for (let info of arr) {
                    info.redPointChange();
                }
            }
        }

        private static startInitGlobalBean() {
            this._globalBeanHashMap = new util.HashMap();
            for (let i = 0; i < this._globalInfoArr.length; i++) {
                let obj: xls.mapTouchObj = this._globalInfoArr[i];
                let nameArr = obj.moduleName.split(".");
                let cls = window[nameArr[0]][nameArr[1]];
                if (!cls) continue;
                let globalBean: core.IGlobalBean = new cls();
                this._globalBeanHashMap.add(obj.ID, globalBean);
                globalBean.start();
            }
        }
        private static changeMapSucc(e: Laya.Event) {
            this._mapObjHashMap = new util.HashMap();
            this._redPointHashMap = new util.HashMap();
            let curMapID = this.getCurrMapID();
            if (curMapID > 0 && this._mapTouchObjHashMap.has(curMapID)) {
                let mapObjArr = this._mapTouchObjHashMap.get(curMapID);
                if (!mapObjArr) return;
                for (let i = 0; i < mapObjArr.length; i++) {
                    this.addOneMapObj(mapObjArr[i]);
                }
                if (clientCore.MapInfo.isSelfHome) {
                    this.changeObjSkin(9, clientCore.LocalInfo.srvUserInfo.homeSkin);
                }
                else if (clientCore.MapInfo.isOthersHome) {
                    this.changeObjSkin(9, clientCore.FriendHomeInfoMgr.ins.friendBaseInfo.homeSkin);
                }
            }
        }
        private static addOneMapObj(obj: xls.mapTouchObj) {
            if (MapInfo.isOthersHome && obj.otherMapShow <= 0) {/** 如果其他玩家地图不显示，这里直接return掉 */
                return;
            }
            if (this.checkShow(obj.condition)) {
                let touchObj = new MapTouchObject();
                touchObj.init(obj);
                BC.addEvent(this, touchObj, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
                BC.addEvent(this, touchObj, Laya.Event.MOUSE_UP, this, this.onMapObjTouch, [obj]);
                MapManager.mapItemsLayer.addChild(touchObj);
                touchObj.pos(obj.pos.x, obj.pos.y);
                this._mapObjHashMap.add(obj.ID, touchObj);
                if (obj.redPointID > 0) {
                    this._redPointHashMap.add(obj.redPointID, touchObj);
                }
            }
        }

        private static getCurrMapID(): number {
            let curMapID = 0;
            if (MapInfo.isSelfHome || MapInfo.isOthersHome) {
                curMapID = 1;
            }
            else if (MapInfo.isSelfFamily) {
                curMapID = 2;
            }
            else if (MapInfo.type == 5) {
                curMapID = MapInfo.mapID;
            }
            else {
                curMapID = MapInfo.mapID;
            }
            return curMapID;
        }

        private static checkShow(conditionArr: xls.pair[]) {
            for (let i = 0; i < conditionArr.length; i++) {
                if (conditionArr[i].v1 == 1) {
                    let lv = LocalInfo.userLv;
                    if (lv < conditionArr[i].v2) {
                        return false;
                    }
                }
            }
            return true;
        }

        private static onMouseDown(e: Laya.Event) {
            this._mouseDownPos.x = Laya.stage.mouseX;
            this._mouseDownPos.y = Laya.stage.mouseY;
        }

        private static onMapObjTouch(objInfo: xls.mapTouchObj, e: Laya.Event) {
            if (this._mouseDownPos.x != Laya.stage.mouseX || this._mouseDownPos.y != Laya.stage.mouseY)
                return;
            let obj = this._mapObjHashMap.get(objInfo.ID);
            obj.touch();

        }

        private static parseEventInfo() {
            this._mapTouchObjHashMap = new util.HashMap();
            this._globalInfoArr = [];
            let xlsInfoArr = xls.get(xls.mapTouchObj).getValues();
            for (let i = 0; i < xlsInfoArr.length; i++) {
                if (xlsInfoArr[i].activeState > 0) {
                    if (xlsInfoArr[i].mapID > 0) {
                        if (!this._mapTouchObjHashMap.has(xlsInfoArr[i].mapID)) {
                            this._mapTouchObjHashMap.add(xlsInfoArr[i].mapID, []);
                        }
                        this._mapTouchObjHashMap.get(xlsInfoArr[i].mapID).push(xlsInfoArr[i]);
                    }
                    else {
                        this._globalInfoArr.push(xlsInfoArr[i]);
                    }
                }
            }
        }
    }
}