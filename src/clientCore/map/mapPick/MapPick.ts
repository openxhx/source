namespace clientCore {
    /**
     * 家族地图
     */
    export class MapPick {
        private _mapPickItemsArr: MapPickItem[];
        private _itemsInfoArr: pb.IPickItem[];
        constructor() {
            this._mapPickItemsArr = [];
        }
        public initMapItems(data: pb.Isc_enter_map) {
            this._itemsInfoArr = data.itms;
        }
        public startLoadItems() {
            this.addItemsToMap(this._itemsInfoArr);
            this.addEvents();
        }
        private addItemsToMap(itemsArr: pb.IPickItem[]) {
            for (let i = 0; i < itemsArr.length; i++) {
                if (itemsArr[i].remain > 0) {
                    let pickItem = new MapPickItem(itemsArr[i]);
                    MapManager.curMap.pickLayer.addChild(pickItem);
                    this._mapPickItemsArr.push(pickItem);
                    BC.addEvent(this, pickItem, Laya.Event.CLICK, this, this.onMapItemClick);
                }
            }
        }
        /**隐藏指定特殊采集对象**/
        public hideLocalObject(obj: any): void {
            for (let i = 0; i < this._mapPickItemsArr.length; i++) {
                let info = this._mapPickItemsArr[i].info;
                if (info.posId == obj.id && info.pos.x == obj.itemPos.x && info.pos.y == obj.itemPos.y) {
                    this._mapPickItemsArr[i].visible = false;
                }
            }
        }

        /** 隐藏某类采集物*/
        public hidePicks(type: number): void {
            _.forEach(this._mapPickItemsArr, (element: MapPickItem) => {
                let pickType = xls.get(xls.mapObject).get(element.info.posId).pickExtent;
                if (pickType == type) {
                    element.visible = false;
                }
            })
        }

        private onMapItemClick(e: Laya.Event) {
            if (LocalInfo.onLimit) {
                // alert.showFWords("雪人状态禁止移动~");
                return;
            }
            let clickItem = e.currentTarget as MapPickItem;
            console.log(`click item info ${clickItem.info.posId}  x:${clickItem.info.pos.x}  y:${clickItem.info.pos.y}`);
            let pickType = xls.get(xls.mapObject).get(clickItem.info.posId).pickExtent;
            switch (pickType) {
                case 0:
                    if (MapManager.isPickingMapItem) {
                        return;
                    }
                    net.sendAndWait(new pb.cs_start_map_pick_item({ posId: clickItem.info.posId })).then(() => {
                        // UserPickManager.ins.startPick(clickItem.info.posId, new Laya.Point(clickItem.x, clickItem.y));
                        UserPickManager.ins.startPick(clickItem);
                    });
                    break;
                case 38://端午节特殊采集
                    if (MapManager.isPickingMapItem) {
                        UserPickManager.ins.stopPick();
                    }
                    clickItem.mouseEnabled = false;
                    net.sendAndWait(new pb.cs_trigger_food_material_event({ id: xls.get(xls.mapObject).get(clickItem.info.posId).mapObjId })).then((msg) => {
                        clientCore.ModuleManager.open("dbfPick.DbfPickModule", msg);
                        clickItem.mouseEnabled = true;
                    }).catch(() => {
                        clickItem.mouseEnabled = true;
                    });
                    break;
                case 216://圣诞祝福交互
                    if (MapManager.isPickingMapItem) {
                        UserPickManager.ins.stopPick();
                    }
                    LocalInfo.onLimit = true;
                    clickItem.playAni();
                    break;
                case 64://特殊采集
                case 118:
                case 199:
                case 207:
                    if (MapManager.isPickingMapItem) {
                        UserPickManager.ins.stopPick();
                    }
                    // net.sendAndWait(new pb.cs_start_map_pick_item({ posId: clickItem.info.posId })).then(() => {
                    // UserPickManager.ins.startPick(clickItem.info.posId, new Laya.Point(clickItem.x, clickItem.y), pickType);
                    UserPickManager.ins.startPick(clickItem, pickType);
                    // });
                    break;
            }
            let aimPos = new Laya.Point();
            if (clickItem.x > PeopleManager.getInstance().player.x) {
                aimPos.x = clickItem.x - 30;
                aimPos.y = clickItem.y + clickItem.height / 2;
            }
            else {
                aimPos.x = clickItem.x + clickItem.width + 30;
                aimPos.y = clickItem.y + clickItem.height / 2;
            }
            PeopleManager.getInstance().flyTo(aimPos);
        }
        private addEvents() {
            net.listen(pb.sc_notify_map_pick_item, this, this.pickItemChangeNotify);
        }
        private clearAllMapItems() {
            for (let i = 0; i < this._mapPickItemsArr.length; i++) {
                BC.removeEvent(this, this._mapPickItemsArr[i], Laya.Event.CLICK, this, this.onMapItemClick);
                this._mapPickItemsArr[i].destroy();
            }
        }
        private pickItemChangeNotify(data: pb.sc_notify_map_pick_item) {
            this.clearAllMapItems();
            this.addItemsToMap(data.pickItms);
        }
        private removeEvents() {
            net.unListen(pb.sc_notify_map_pick_item, this, this.pickItemChangeNotify);
            BC.removeEvent(this);
        }
        public destroy() {
            this.removeEvents();
            for (let i = 0; i < this._mapPickItemsArr.length; i++) {
                this._mapPickItemsArr[i].destroy();
            }
            this._mapPickItemsArr = null;
            this._itemsInfoArr = null;
        }
    }
}