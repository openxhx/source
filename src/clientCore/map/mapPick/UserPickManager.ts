namespace clientCore {
    /**
     * 家族地图
     */
    export class UserPickManager {
        private static _ins: UserPickManager;
        private _startSystemTime: number;
        private _oneNeedTime: number;
        private _getCount: number;
        private _totalTime: number;
        private _pickPosID: number;
        private _type: number;
        private _pickProgress: PickProgress;
        private _itemPos: Laya.Point;
        private _item: MapPickItem;
        constructor() {
            this._pickProgress = new PickProgress();
        }
        public static get ins(): UserPickManager {
            return this._ins || (this._ins = new UserPickManager());
        }
        // public startPick(id: number, itemPos: Laya.Point, type: number = 0) {
        public startPick(item: MapPickItem, type: number = 0): void {
            this._item = item;
            this._item.showTips();
            this._pickPosID = item.info.posId;
            this._itemPos = new Laya.Point(item.x, item.y);
            this._type = type;
            MapManager.isPickingMapItem = true;
            this._startSystemTime = new Date().getTime();
            let pickTime = xls.get(xls.mapObject).get(this._pickPosID).reapTime;
            this._oneNeedTime = pickTime.v1 * 1000;
            this._totalTime = pickTime.v2 * 1000;
            this._getCount = 0;
            Laya.timer.frameLoop(1, this, this.updatePicking);
            this._pickProgress.showProgress(0, this._totalTime);
            PeopleManager.getInstance().player.showProgress(this._pickProgress);
        }
        private updatePicking() {
            let curSysTime = new Date().getTime();
            let disTime = curSysTime - this._startSystemTime;
            let curGetCount = Math.floor(disTime / this._oneNeedTime);
            if (curGetCount > this._getCount) {
                this._getCount = curGetCount;
                this.pickOneReward();
            }
            if (disTime >= this._totalTime) {
                if (this._type == 118 || this._type == 199) {
                    let waitTime = xls.get(xls.mapObject).get(this._pickPosID).refresh * 1000;
                    this._item.enterWait(waitTime);
                }
                this.stopPick();
                if (this._type == 64) {
                    (MapManager.curMap as WorldMap).hideLocalObject({ id: this._pickPosID, itemPos: this._itemPos });
                    //先关闭全部模块
                    clientCore.ModuleManager.closeAllOpenModule();
                    //关闭所有弹窗
                    clientCore.DialogMgr.ins.closeAllDialog();
                    clientCore.ModuleManager.open("homeworkAsPoetry.EmergencyPanel");
                }
            }
            this._pickProgress.showProgress(disTime, this._totalTime);
        }
        private pickOneReward() {
            if (this._type == 0) {
                net.sendAndWait(new pb.cs_once_map_pick_item({ posId: this._pickPosID })).then((data: pb.sc_once_map_pick_item) => {
                    if (data.isOver == 0) {
                        for (let i = 0; i < data.items.length; i++) {
                            alert.showFWords("获得：" + clientCore.ItemsInfo.getItemName(data.items[i].id) + " x" + data.items[i].cnt);
                            EventManager.event(globalEvent.MAP_ITEM_PICK, [data.items[i], this._itemPos]);
                        }
                    }
                    else if (data.isOver == 1) {
                        alert.showFWords("当前物品已经全部领完！");
                        this.stopPick();
                    }
                    else if (data.isOver == 2) {
                        let itemID = xls.get(xls.mapObject).get(this._pickPosID).mapObjId;
                        if (xls.get(xls.itemBag).has(itemID)) {
                            let max = xls.get(xls.itemBag).get(itemID).dailyMax;
                            alert.showFWords(`已达到今日获得上限${max}个`);
                        }
                        else {
                            alert.showFWords("当前物品已到领取上限！");
                        }
                        // alert.showFWords("当前物品已到领取上限！");
                        this.stopPick();
                    }
                });
            } else if (this._type == 64) {
                net.sendAndWait(new pb.cs_pick_up_items({ id: this._pickPosID })).then((data: pb.sc_pick_up_items) => {
                    for (let i = 0; i < data.items.length; i++) {
                        alert.showFWords("获得：" + clientCore.ItemsInfo.getItemName(data.items[i].id) + " x" + data.items[i].cnt);
                    }
                });
            } else if (this._type == 118) {
                net.sendAndWait(new pb.cs_new_year_active_pick_item({ id: this._pickPosID })).then((data: pb.sc_new_year_active_pick_item) => {
                    for (let i = 0; i < data.items.length; i++) {
                        alert.showFWords("获得：" + clientCore.ItemsInfo.getItemName(data.items[i].id) + " x" + data.items[i].cnt);
                    }
                });
            } else if (this._type == 199) {
                net.sendAndWait(new pb.cs_once_map_active_pick_item({ posId: this._pickPosID })).then((data: pb.sc_once_map_active_pick_item) => {
                    for (let i = 0; i < data.item.length; i++) {
                        alert.showFWords("获得：" + clientCore.ItemsInfo.getItemName(data.item[i].id) + " x" + data.item[i].cnt);
                    }
                });
            } else if (this._type == 207) {
                net.sendAndWait(new pb.cs_once_map_active_pick_item({ posId: this._pickPosID })).then((data: pb.sc_once_map_active_pick_item) => {
                    for (let i = 0; i < data.item.length; i++) {
                        alert.showFWords("获得：" + clientCore.ItemsInfo.getItemName(data.item[i].id) + " x" + data.item[i].cnt);
                    }
                });
            }
        }
        public stopPick() {
            this._item?.hideTips();
            this._item = null;
            MapManager.isPickingMapItem = false;
            Laya.timer.clear(this, this.updatePicking);
            this._pickProgress.removeSelf();
        }
    }
}