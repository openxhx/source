namespace clientCore {
    /**
     * 格子对应的信息
     */
    export class MapGridData {
        private _mapOriGridInfoArr: [][];//当前地图格子原始信息，json表里的数据
        public mapGridInfoArr: MapGridInfo[][];//当前地图格子信息
        constructor() {

        }
        public initMapGridInfo() {
            this._mapOriGridInfoArr = MapInfo.getGridInfoByMapID(MapInfo.mapID);
            this.mapGridInfoArr = [];
            for (let i = 0; i < this._mapOriGridInfoArr.length; i++) {
                this.mapGridInfoArr.push([]);
                for (let j = 0; j < this._mapOriGridInfoArr[i].length; j++) {
                    let gridInfo = new MapGridInfo();
                    gridInfo.oriData = this._mapOriGridInfoArr[i][j];
                    gridInfo.occupyState = false;
                    gridInfo.lockState = false;
                    gridInfo.blockType = 0;
                    if (gridInfo.oriData >= 100) {
                        gridInfo.blockType = Math.floor(gridInfo.oriData / 100);
                        gridInfo.lockState = true;
                    }
                    else if (gridInfo.oriData > 0 && gridInfo.oriData <= 3) {
                        gridInfo.blockType = gridInfo.oriData;
                        gridInfo.lockState = false;
                    }
                    this.mapGridInfoArr[i].push(gridInfo);
                }
            }
        }
        //判断格子是否能放 未开垦、被占用、类型不对、不能放 都返回false
        public checkCanPut(row: number, col: number, type: number): boolean {
            if (row < 0 || col < 0 || row >= this.mapGridInfoArr.length || col >= this.mapGridInfoArr[0].length)
                return false;
            if (this.mapGridInfoArr[row][col].lockState)
                return false;
            if (this.mapGridInfoArr[row][col].occupyState || this.mapGridInfoArr[row][col].blockType < 1)
                return false;
            if (this.mapGridInfoArr[row][col].blockType == type)
                return true;
            return false;
        }
        /**
       * 清除占位  在建筑、装饰、花种等场景摆放物 添加、移动的时候，需要把这个占位加上
       * @param startRow 
       * @param startCol 
       * @param rowLength 
       * @param colLength 
       */
        private setOccupyState(startRow: number, startCol: number, gridArr: xls.pair[]): boolean {
            var r: number, c: number;
            for (let i = 0; i < gridArr.length; i++) {
                if (startCol % 2 == 0) {
                    r = startRow + gridArr[i].v1;
                    c = startCol + gridArr[i].v2;
                }
                else {
                    if (gridArr[i].v2 % 2 == 0) {
                        r = startRow + gridArr[i].v1;
                        c = startCol + gridArr[i].v2;
                    }
                    else {
                        r = startRow + gridArr[i].v1 + 1;
                        c = startCol + gridArr[i].v2;
                    }
                }
                if(!this.mapGridInfoArr[r] || !this.mapGridInfoArr[r][c]){
                    console.log("r:" + r + "  c:" + c);
                    return false;
                }
                let mapGridInfo: MapGridInfo = this.mapGridInfoArr[r][c];
                mapGridInfo.occupyState = true; //有可能是null的 TODO
            }
            return true;
        }
        private clearAllOccupyState() {
            for (let rowArr of this.mapGridInfoArr) {
                for (let gridInfo of rowArr) {
                    gridInfo.occupyState = false;
                }
            }
        }
        public refreshOccupyState() {
            this.clearAllOccupyState();
            //根据场景里面现有的物品，从新更新占位信息
            let mapItemsLayer = MapManager.mapItemsLayer;
            let itemsNum = mapItemsLayer.numChildren;
            for (let i = 0; i < itemsNum; i++) {
                let mapItem = mapItemsLayer.getChildAt(i);
                if (mapItem instanceof MapItemBase) {
                    //占的格子信息应该根据当前地图物品占格子信息重新更新
                    // if (mapItem.visible) {
                        if (!this.setOccupyState(mapItem.row, mapItem.col, mapItem.mapItemInfo.blockPosArr)) {
                            console.log("建筑ID：" + mapItem.mapItemInfo.id + "  row:" + mapItem.row + "  col:" + mapItem.col);
                        }
                    // }
                }
                else if(mapItem instanceof PartyMapItem){
                    // if (mapItem.visible) {
                        if (!this.setOccupyState(mapItem.itemInfo.row, mapItem.itemInfo.col, mapItem.itemInfo.blockPosArr)) {
                            console.log("建筑ID：" + mapItem.itemInfo.ID + "  row:" + mapItem.itemInfo.row + "  col:" + mapItem.itemInfo.col);
                        }
                    // }
                }
            }
        }
        /**
         * 解锁区域，把二维数据里面锁定状态置掉
         * @param idArr 
         */
        public expandAreas(idArr: number[]) {
            for (let i = 0; i < this.mapGridInfoArr.length; i++) {
                for (let j = 0; j < this.mapGridInfoArr[i].length; j++) {
                    if (idArr.indexOf(this.mapGridInfoArr[i][j].oriData) > -1) {
                        this.mapGridInfoArr[i][j].lockState = false;
                    }
                }
            }
        }
        public destroy() {
            this._mapOriGridInfoArr = null;
            for (let i = 0; i < this.mapGridInfoArr.length; i++) {
                this.mapGridInfoArr[i].splice(0, this.mapGridInfoArr.length);
            }
            this.mapGridInfoArr = null;
        }
    }
}