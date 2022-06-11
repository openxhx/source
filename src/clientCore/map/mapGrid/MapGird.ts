namespace clientCore {
    /**
     * 编辑的时候，显示的网格对象
     */
    export class MapGrid {
        private _gridBlockArr: MapGridBlock[][];
        constructor() {

        }
        public addAllGridBlock() {
            this._gridBlockArr = [];
            for (let i = 0; i < MapManager.mapGridInfoArr.length; i++) {
                this._gridBlockArr.push([]);
                for (let j = 0; j < MapManager.mapGridInfoArr[i].length; j++) {
                    let info = MapManager.mapGridInfoArr[i][j];
                    this._gridBlockArr[i].push(this.createBlock(i, j, info.blockType, info.oriData));
                }
            }
        }
        private createBlock(row: number, col: number, type: number, areaId: number): MapGridBlock {
            var block: MapGridBlock;
            if (MapManager.gridBlockPool.length == 0) {
                block = new MapGridBlock();
            }
            else {
                block = MapManager.gridBlockPool.shift();
            }
            block.setInfo(row, col, type);
            block.areaId = areaId;
            MapManager.gridLayer.addChild(block);
            return block;
        }
        public refreshGridState(type: number) {
            for (let i = 0; i < this._gridBlockArr.length; i++) {
                for (let j = 0; j < this._gridBlockArr[i].length; j++) {
                    this._gridBlockArr[i][j].showPutState(MapManager.checkCanPut(i, j, type));
                }
            }
        }

        public destroy() {
            for (let i = 0; i < this._gridBlockArr.length; i++) {
                    MapManager.gridBlockPool.push(...this._gridBlockArr[i]);
                    this._gridBlockArr[i].splice(0,this._gridBlockArr[i].length);
                    this._gridBlockArr[i] = null;
            }
            this._gridBlockArr = null;
        }
    }
}