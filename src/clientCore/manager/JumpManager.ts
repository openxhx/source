namespace clientCore {
    /**
     * 处理游戏内所有的现在就去逻辑
     */
    export class JumpManager {
        private static _mapXlsObjHashMap: util.HashMap<number[]>;
        private static _buildingProduceHashMap: util.HashMap<number>;
        public static async setUp() {
            // await Promise.all([
            //     xls.load(xls.mapObject),
            //     xls.load(xls.manageBuildingId),
            //     xls.load(xls.manageBuildingFormula)
            // ]);
            this.parseMapObjXlsInfo();
            this.parseBuildingProduce();
        }
        private static parseMapObjXlsInfo() {
            this._mapXlsObjHashMap = new util.HashMap();
            let mapObjArr = xls.get(xls.mapObject).getValues();
            for (let xlsInfo of mapObjArr) {
                if (!this._mapXlsObjHashMap.has(xlsInfo.mapObjId)) {
                    this._mapXlsObjHashMap.add(xlsInfo.mapObjId, []);
                }
                let tArr = this._mapXlsObjHashMap.get(xlsInfo.mapObjId);
                if (tArr.indexOf(xlsInfo.mapId) < 0) {
                    tArr.push(xlsInfo.mapId);
                }
            }
        }
        private static parseBuildingProduce() {
            this._buildingProduceHashMap = new util.HashMap();
            let formulaArr = xls.get(xls.manageBuildingFormula).getValues();
            let buildingArr = xls.get(xls.manageBuildingId).getValues();
            for (let formulaInfo of formulaArr) {
                for (let buildingInfo of buildingArr) {
                    if (formulaInfo.formulaId == buildingInfo.unlock1Formula) {
                        this._buildingProduceHashMap.add(formulaInfo.outputItem, buildingInfo.buildingId);
                    }
                }
            }
        }
        /**
         * 根据物品ID跳转到物品产出的地方
         * 现在只支持 小屋跟花朵产出  地图拾取  如果有其他需求，可以继续扩展
         * @param itemID 
         */
        public static async jumpByItemID(itemID: number):Promise<boolean> {

            if (this._mapXlsObjHashMap.has(itemID)) {/**物品是地图拾取物 */
                
                let tmpMapArr = this._mapXlsObjHashMap.get(itemID);
                /**地图有这个拾取物的所有地图里面随机一个地图 */
                if (tmpMapArr.length > 0) {
                    let mapID = 0;/**寻找未解锁的地图 */
                    for(let id of tmpMapArr){
                        if(LocalInfo.userLv >=  xls.get(xls.map).get(id).mapLevel){
                            mapID = id;
                            break;
                        }
                    }
                    if(mapID == 0){
                        alert.showFWords("地图暂未开启！");
                        return true;
                    }
                    if(mapID == clientCore.MapInfo.mapID){
                        alert.showFWords("当前已在地图中！");
                        return true;
                    }
                    if(LocalInfo.onLimit){
                        // alert.showFWords("雪人状态禁止移动~");
                        return;
                    }
                    
                    if (MapManager.isPickingMapItem) {
                        UserPickManager.ins.stopPick();
                    }
                    //先关闭全部模块
                    clientCore.ModuleManager.closeAllOpenModule();
                    //关闭所有弹窗
                    clientCore.DialogMgr.ins.closeAllDialog();

                    clientCore.MapManager.enterWorldMap(mapID);
                }
                else {
                    //先关闭全部模块
                    clientCore.ModuleManager.closeAllOpenModule();
                    //关闭所有弹窗
                    clientCore.DialogMgr.ins.closeAllDialog();
                    clientCore.ModuleManager.open("worldMap.WorldMapModule");
                }
                return true;
            }
            else if (this._buildingProduceHashMap.has(itemID)) {
                if (clientCore.ModuleManager.checkModuleOpen("produce")) {
                    // alert.showFWords("已经在生产面板上！");
                    EventManager.event(globalEvent.CHANGE_PRODUCR_ID,this._buildingProduceHashMap.get(itemID));
                    return true;
                }
                //先关闭全部模块
                clientCore.ModuleManager.closeAllOpenModule();
                //关闭所有弹窗
                clientCore.DialogMgr.ins.closeAllDialog();
                if (!clientCore.MapInfo.isSelfHome) {
                    clientCore.UserPickManager.ins.stopPick()
                    await clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);
                }
                clientCore.ModuleManager.open("produce.ProduceModule", this._buildingProduceHashMap.get(itemID));
                return true;
            }
            return false;
        }
        /**
         * 根据模块ID打开模块，并带入相应参数
         * @param moduleID 
         */
        public static JumpByModuleID(moduleID: number) {

        }
    }
}