
namespace clientCore {
    /**
     * 地图建筑，装饰，花种的点击控制。解决透明不能穿透问题
     */
    export class MapTouchManager {
        private static _instance: MapTouchManager;
        private _mapLayer: core.BaseLayer;
        private _curClickItem: any;
        private HOLD_TRIGGER_TIME: number = 1000;
        private _drawUI: ui.mapEditor.OpeningViewUI;
        private _mouseDownTime: number;
        private _hasDrawUIShowed: boolean;//本次mouseDown之后 holdUI是否出现过 如果没出现 不处理点击事件
        private _decoMusiceChannel: Laya.SoundChannel;
        private _stageClickPos: Laya.Point;
        private DRAG_DISTANCE: number = 20;
        private _mapLayerCliclPos: Laya.Point;

        public static getInstance(): MapTouchManager {
            if (!MapTouchManager._instance) {
                MapTouchManager._instance = new MapTouchManager();
            }
            return MapTouchManager._instance;
        }
        public constructor() {

        }
        public setUp() {
            this._drawUI = new ui.mapEditor.OpeningViewUI();
            this._drawUI.mouseEnabled = false;
            this._mapLayer = LayerManager.mapLayer;
            this._mapLayer.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this._mapLayer.on(Laya.Event.CLICK, this, this.onMouseClick);
            EventManager.on(globalEvent.JOY_STICK_START, this, this.onMapJoyChange);
        }

        private onMapJoyChange() {
            if (this._curClickItem) {
                this._curClickItem = null;
            }
        }

        private expandOneArea(pos: Laya.Point) {
            if (!MapInfo.isSelfHome) {
                alert.showFWords('在别人家园不能操作!');
                return;
            }
            pos = this._mapLayer.localToGlobal(pos, true);
            MapManager.curMap.mapExpend.expandArea(this._curClickItem.areaId, pos);
        }

        private onPlayDragMove() {
            let tmpPos = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
            if ((tmpPos.x - this._stageClickPos.x) * (tmpPos.x - this._stageClickPos.x) + (tmpPos.y - this._stageClickPos.y) * (tmpPos.y - this._stageClickPos.y) > this.DRAG_DISTANCE * this.DRAG_DISTANCE) {
                //进入拖动模式
                this._curClickItem = null;
                this.onBuildingRelease(null);
            }
        }

        private onMouseDown(e: Laya.Event) {
            this._hasDrawUIShowed = false;
            let clickMapItemFlag = false;
            this._curClickItem = null;
            this._mapLayerCliclPos = new Laya.Point(this._mapLayer.mouseX, this._mapLayer.mouseY);
            this._stageClickPos = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
            console.log('x:' + this._mapLayerCliclPos.x + ' y:' + this._mapLayerCliclPos.y);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onPlayDragMove);
            let mapNum = this._mapLayer.numChildren;
            if (!clientCore.FunnyToyManager.isAimingMode) {
                for (let i = mapNum - 1; i >= 0; i--) {
                    let layer = this._mapLayer.getChildAt(i);
                    if (layer == MapManager.mapItemsLayer || layer == MapManager.mapExpandLayer) {
                        if (this.findTouchTarget(layer as Laya.Sprite, this._mapLayerCliclPos)) {
                            clickMapItemFlag = true;
                            if (MapInfo.mapEditState) {//编辑模式
                                if (this._curClickItem instanceof MapItemBase && this._curClickItem.mapItemInfo.id != 499995) {
                                    this.mapItemsEnterEditMode();
                                }
                                else if (this._curClickItem instanceof PartyMapItem) {
                                    this.partyItemsEnterEditMode();
                                }
                                else if (this._curClickItem instanceof MapExpandBtn) {
                                    clickMapItemFlag = false;
                                }
                            }
                            else {
                                if ((this._curClickItem instanceof MapItemBase && this._curClickItem.mapItemInfo.id != 499995) || this._curClickItem instanceof PartyMapItem) {
                                    Laya.timer.once(300, this, this.showHoldUI);
                                    Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onBuildingRelease);
                                }
                            }
                            break;
                        }
                    }
                }
            }
            //如果当前点击区域是空的并且当前有编辑对象，那么直接把这个编辑对象位置变过去
            if (!clickMapItemFlag && MapInfo.mapEditState) {
                if (MapEditorManager.getInstance().checkHaveOperateTarget()) {
                    let rowColInfo = MapInfo.calRowAndColByPosition(this._mapLayerCliclPos.x, this._mapLayerCliclPos.y);
                    let realPos = MapInfo.calPositionByRowAndCol(rowColInfo.row, rowColInfo.col);
                    MapEditorManager.getInstance().mapItemChangePos(realPos.x, realPos.y);
                    MapEditorManager.getInstance().startDragOperateMapItem();
                    return;
                }
                else if (PartyEditorManager.ins.checkHaveOperateTarget()) {
                    let rowColInfo = MapInfo.calRowAndColByPosition(this._mapLayerCliclPos.x, this._mapLayerCliclPos.y);
                    let realPos = MapInfo.calPositionByRowAndCol(rowColInfo.row, rowColInfo.col);
                    PartyEditorManager.ins.mapItemChangePos(realPos.x, realPos.y);
                    PartyEditorManager.ins.startDragOperateMapItem();
                    return;
                }
            }
            if (!MapInfo.mapEditState || this._curClickItem == null) {
                MapManager.onMouseDown(e);
            }
        }
        private showHoldUI() {
            this._mouseDownTime = Date.now();
            this._hasDrawUIShowed = true;
            this._drawUI.pos(Laya.stage.mouseX, Laya.stage.mouseY, true);
            LayerManager.uiLayer.addChild(this._drawUI);
            Laya.timer.frameLoop(1, this, this.updateHoldUI);
        }
        private updateHoldUI() {
            let per = (Date.now() - this._mouseDownTime) / this.HOLD_TRIGGER_TIME;
            if (per <= 1) {
                this._drawUI.spMask.graphics.clear();
                this._drawUI.spMask.graphics.drawPie(0, 0, 53, -90, 360 * per - 90, '0xff0000');
            }
            else {
                this.triggerHold();
            }
        }
        private triggerHold() {
            if (!(MapInfo.isSelfHome || MapInfo.isSelfParty)) {
                return;
            }
            this.onBuildingRelease(null);
            if (!this._curClickItem) {
                return;
            }
            // 判断不同类型，如果是建筑，进入编辑模式
            if (this._curClickItem instanceof PartyMapItem) {
                PartyEditorManager.ins.showUI(this._curClickItem.itemInfo.type);
                this.partyItemsEnterEditMode();
            }
            else {
                MapEditorManager.getInstance().showUI(0, 'map');
                this.mapItemsEnterEditMode();
            }

            UIManager.close();
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onBuildingRelease);

        }
        /**这个接口是地图中长按，进入编辑状态，或者编辑状态下，点击地图中的建筑，所有行列应该是当前建筑所在的行列 */
        private mapItemsEnterEditMode() {
            if (this._curClickItem instanceof MapItemBase) {
                this._curClickItem.hideMapItem();
            }
            MapManager.refreshMapOccupyState();
            let info = (this._curClickItem as MapItemBase).mapItemInfo;
            MapEditorManager.getInstance().showOperateMapItem(info, { row: info.mapPosRow, col: info.mapPosRow }, false);
            MapEditorManager.getInstance().startDragOperateMapItem();

        }
        private partyItemsEnterEditMode() {
            this._curClickItem.hideMapItem();
            MapManager.refreshMapOccupyState();
            let info = (this._curClickItem as PartyMapItem).itemInfo;
            PartyEditorManager.ins.showOperateMapItem(info, { row: info.row, col: info.col }, false);
            PartyEditorManager.ins.startDragOperateMapItem();
        }
        private onBuildingRelease(e: Laya.Event) {
            this._drawUI.removeSelf();
            Laya.timer.clear(this, this.updateHoldUI);
            Laya.timer.clear(this, this.showHoldUI);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onBuildingRelease);
        }
        private findTouchTarget(layer: Laya.Sprite, clickPos: Laya.Point): boolean {
            let itemsNum = layer.numChildren;
            for (let i = itemsNum - 1; i >= 0; i--) {
                let item = layer.getChildAt(i);
                if ((item instanceof MapItemBase || item instanceof PartyMapItem) && item.visible) {
                    let imgMousePos = new Laya.Point();
                    let isReverse = item instanceof MapItemBase ? item.mapItemInfo.isReverse : item.itemInfo.isReverse;
                    if (isReverse) {
                        imgMousePos.x = -(clickPos.x - item.x - item.img.x);
                        imgMousePos.y = clickPos.y - item.y - item.img.y
                    }
                    else {
                        imgMousePos.x = clickPos.x - item.x - item.img.x;
                        imgMousePos.y = clickPos.y - item.y - item.img.y
                    }
                    // let imgMousePos = new Laya.Point(clickPos.x - item.x - item.img.x, clickPos.y - item.y - item.img.y);
                    if (imgMousePos.x > 0 && imgMousePos.x < item.img.width && imgMousePos.y > 0 && imgMousePos.y < item.img.height) {
                        if (!this.checkImgClickAlpha(item.img, imgMousePos))//点击位置非透明
                        {
                            this._curClickItem = item;
                            return true;
                        }
                    }
                }
                //按理说，这个扩建的类也应该继承自MapItemBase类，这样可以统一处理，但是MapItemBase里面有些属性是扩建类没有的
                else if (item instanceof MapExpandBtn) {
                    let rect = item.getBounds();
                    if (item.canExpandFlag && _.inRange(clickPos.x, rect.x, rect.x + rect.width) && _.inRange(clickPos.y, rect.y, rect.y + rect.height)) {
                        this._curClickItem = item;
                        return true;
                    }
                }
            }
            return false;
        }
        private checkImgClickAlpha(img: Laya.Image, pos: Laya.Point): boolean {
            let arr = img.source.getPixels(Math.round(pos.x), Math.round(pos.y), 1, 1); //像素点取整
            if (arr && arr.length > 0) {
                let count = 0;
                for (let num of arr) {
                    count += num;
                }
                return count == 0;
            }
            return true;
        }
        private onMouseClick(e: Laya.Event) {
            if (this._curClickItem && !this._hasDrawUIShowed && !MapInfo.mapEditState) {
                if (this._curClickItem instanceof FamilyBuildMapItem) {
                    this._curClickItem.openModule();
                }
                else if (this._curClickItem instanceof MapExpandBtn) {
                    this.expandOneArea(this._mapLayerCliclPos);
                }
                else if (this._curClickItem instanceof BuildingMapItem || this._curClickItem instanceof FlowerMapItem) {
                    if (this._curClickItem.checkCanGet()) {
                        this._curClickItem.onRewardClick(e);
                    }
                    else {
                        if (MapInfo.isSelfHome) {
                            ModuleManager.open("produce.ProduceModule", this._curClickItem.mapItemInfo.id);
                        }
                    }
                }
                else if (this._curClickItem instanceof DecorationMapItem) {
                    //幸运竹
                    if (this._curClickItem.mapItemInfo.id >= 300107 && this._curClickItem.mapItemInfo.id <= 300114) {
                        if (parseInt(MapInfo.mapData) != LocalInfo.uid && !FriendManager.instance.checkIsFriend(parseInt(MapInfo.mapData))) {
                            alert.showFWords("与该玩家还不是好友！");
                        } else {
                            ModuleManager.open("luckyBamboo.LuckyBambooInfoModule", parseInt(MapInfo.mapData));
                        }
                        return;
                    }
                    //元宵食盒
                    if (this._curClickItem.mapItemInfo.id == 300156 && !SystemOpenManager.ins.checkActOver(228)) {
                        if (parseInt(MapInfo.mapData) == LocalInfo.uid) {
                            ModuleManager.open("allGoesWell.AllGoesWellModule");
                        } else {
                            clientCore.Logger.sendLog('2022年2月11日活动','【主活动】顺心如意·元宵','在别人家园点击食盒');
                            ModuleManager.open("eatTangyuan.EatTangyuanModule", parseInt(MapInfo.mapData));
                        }
                        return;
                    }
                    let xlsInfo = xls.get(xls.manageBuildingId).get(this._curClickItem.mapItemInfo.id);
                    if (xlsInfo?.interact) {
                        let placeOk = this.checkPlaceOk(xlsInfo);
                        if (placeOk) {
                            this.actionDecoInteract(xlsInfo);
                        }
                        else {
                            console.log(xlsInfo.buildingId + '触发限定区域错误');
                        }
                    }
                }
                this.onBuildingRelease(null);
            }
            //因为在点击奖励那边，对mouse_down事件进行了冒泡中断，所以响应click事件的时候，如果前面点击过建筑，如果this._curClickItem没有置空
            //点击水滴，会打开生产面板，所以这里置空
            this._curClickItem = null;
        }

        private checkPlaceOk(info: xls.manageBuildingId) {
            let place = info.interact.v2
            switch (place) {
                case 0:
                    return MapInfo.isSelfHome;
                case 1:
                    return parseInt(MapInfo.mapData) != LocalInfo.uid && FriendManager.instance.checkIsFriend(parseInt(MapInfo.mapData));
                case 2:
                    return true;
                default:
                    break;
            }
        }

        private actionDecoInteract(info: xls.manageBuildingId) {
            let actionType = info.interact.v1;
            let actionValue = info.interact.v3;
            switch (actionType) {
                case 1:
                    this._decoMusiceChannel?.stop();
                    this._decoMusiceChannel = core.SoundManager.instance.playSound(`res/sound/decoration/${actionValue}.ogg`);
                    break;
                case 2:
                    clientCore.ToolTip.gotoMod(actionValue);
                    break;
                default:
                    break;
            }
        }
    }
}