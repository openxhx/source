namespace clientCore {
    /**
     * 地图可编辑对象在实际编辑时候的操作对象
     */
    export class MapOperateItem extends Laya.Sprite {
        private _mcOperateUI: MapOperateUI;
        private _mapItemInfo: MapItemInfo = null;
        private _mapItemPreRow: number;
        private _mapItemPreCol: number;
        private _isReverse: boolean;
        private _buildingCanPutFlag: boolean = false;
        private _draging: boolean = false;

        // private _testBlockArr:Laya.Image[];
        constructor() {
            super();
            this._mcOperateUI = new MapOperateUI();
            this.addEVentListeners();
            this.addChild(this._mcOperateUI);
            this.mouseThrough = true;

            // this.initTestBlocks();
        }
        // private initTestBlocks(){
        //     this._testBlockArr = [];
        //     for(let i = 0;i<20;i++){
        //         let block = new Laya.Image();
        //         block.anchorX = 0.5;
        //         block.anchorY = 0.5;
        //         block.alpha = 0.5;
        //         block.mouseEnabled = false;
        //         block.skin = "commonUI/gray.png";
        //         this._testBlockArr.push(block);
        //     }
        // }
        /**当前是否正在拖拽物体 */
        public get isDraging() {
            return this._draging;
        }
        private addEVentListeners() {
            this._mcOperateUI.img.on(Laya.Event.MOUSE_DOWN, this, this.startDragClick);
            // this._mcOperateUI.on(Laya.Event.MOUSE_DOWN, this, this.stopEventBubble);
        }
        // private stopEventBubble(e: Laya.Event) {
        //     e.stopPropagation();
        // }
        private startDragClick(e: Laya.Event) {
            e.stopPropagation();
            this.startDragInit();
        }
        public startDragInit() {
            this._draging = true;
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.stopMove);
            Laya.stage.on(Laya.Event.ROLL_OUT, this, this.stopMove);
            Laya.timer.frameLoop(1, this, this.mouseMove);
            let rcInfo = MapInfo.calRowAndColByPosition(this.x, this.y);
            this._mapItemPreCol = rcInfo.col;
            this._mapItemPreRow = rcInfo.row;
            this.showPutState();
            MapEditorManager.getInstance().showEditBox(true);
        }
        private mouseMove(): void {
            let curTouchPos = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
            let globalPoint = LayerManager.mapLayer.globalToLocal(curTouchPos, false);
            let mouseRowCol = MapInfo.calRowAndColByPosition(globalPoint.x, globalPoint.y);
            if (this._mapItemPreCol != mouseRowCol.col || this._mapItemPreRow != mouseRowCol.row) {
                this._mapItemPreRow = mouseRowCol.row;
                this._mapItemPreCol = mouseRowCol.col;
                let gridPos = MapInfo.calPositionByRowAndCol(this._mapItemPreRow, this._mapItemPreCol);
                this.x = gridPos.x;
                this.y = gridPos.y;
                console.log(`当前鼠标所在的行:${this._mapItemPreRow} 列:${this._mapItemPreCol}`);
                this.showPutState();
            }
        }
        private stopMove(): void {
            this._draging = false;
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.stopMove);
            Laya.stage.off(Laya.Event.ROLL_OUT, this, this.stopMove);
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            Laya.timer.clear(this, this.mouseMove);
        }

        public get buildingCanPutFlag(): boolean {
            return this._buildingCanPutFlag;
        }
        public get mapItemPreRow(): number {
            return this._mapItemPreRow;
        }
        public get mapitemPreCol(): number {
            return this._mapItemPreCol;
        }
        public get isReverse(): boolean {
            return this._isReverse;
        }

        /**
         * 显示操作建筑
         * @param info 
         */
        public showMapItem(info: MapItemInfo, rowColInfo: { row: number, col: number }, autoFind: boolean) {
            this._mapItemInfo = info;
            if (this._mapItemInfo.type == 1) {
                this._mcOperateUI.img.skin = pathConfig.getBuildingPath(this._mapItemInfo.id, this._mapItemInfo.level);
            }
            else if (this._mapItemInfo.type == 2) {
                this._mcOperateUI.img.skin = pathConfig.getSeedPath(this._mapItemInfo.id, this._mapItemInfo.flowerCurStage);
            }
            else if (this._mapItemInfo.type == 3 || this._mapItemInfo.type == 6) {
                this._mcOperateUI.img.skin = ItemsInfo.getItemUIUrl(this._mapItemInfo.id);
            }
            else if (this._mapItemInfo.type == 5) {
                this._mcOperateUI.img.skin = pathConfig.getBuildingPath(this._mapItemInfo.id);
            }
            //这里判断其他类型的
            this._mcOperateUI.putType = this._mapItemInfo.putType;
            this._mcOperateUI.img.scaleX = this._mapItemInfo.isReverse ? -1 : 1;
            this._mcOperateUI.img.pos(this._mapItemInfo.offsetPos.x, this._mapItemInfo.offsetPos.y);
            this._isReverse = this._mapItemInfo.isReverse;
            this._mcOperateUI.showBlocks(this._mapItemInfo.blockPosArr);

            this._mcOperateUI.img.x = this._mapItemInfo.offsetPos.x;
            this._mcOperateUI.img.y = this._mapItemInfo.offsetPos.y;
            MapManager.mapItemsLayer.addChild(this);

            //先找出对应的屏幕中心点
            this.findCorrectPos(rowColInfo);
            let needTween: boolean = false;//是否需要缓动镜头
            if (autoFind) {
                //自动寻找一个最近的
                let arr = MapManager.curMap.mapGridData.mapGridInfoArr;
                let canPutArr = [];
                for (let i = 0; i < arr.length; i++) {
                    for (let j = 0; j < arr[i].length; j++) {
                        if (arr[i][j].oriData != 0 && MapInfo.checkMapItemCanPut(i, j, this._mapItemInfo.blockPosArr, this._mapItemInfo.putType)) {
                            canPutArr.push({ row: i, col: j })
                        }
                    }
                }
                let nearstObj = _.sortBy(canPutArr, (o) => {
                    o.dis = Math.abs(o.row - this._mapItemPreRow) * Math.abs(o.row - this._mapItemPreRow) + Math.abs(o.col - this._mapItemPreCol) * Math.abs(o.col - this._mapItemPreCol);
                    return o.dis;
                })[0];
                if (nearstObj) {
                    console.log('find near')
                    this._mapItemPreRow = nearstObj.row;
                    this._mapItemPreCol = nearstObj.col;
                    needTween = nearstObj.dis > 0;
                }
            }
            let pos = MapInfo.calPositionByRowAndCol(this._mapItemPreRow, this._mapItemPreCol);
            this.pos(pos.x, pos.y);
            this.showPutState();
            if (autoFind) {
                if (needTween)
                    MapManager.tweenCameraCenterTo(pos.x, pos.y, 300);
                else
                    MapManager.setSelfBodyPos(pos.x, pos.y);
            }
            MapEditorManager.getInstance().showEditBox(true);
        }

        /**
         * 显示摆放状态，方块表示这里能否摆放
         */
        private showPutState() {
            this._buildingCanPutFlag = true;
            let r = 0;
            let c = 0;
            let blockPosArr = this._mcOperateUI.blockPosArr;
            for (let i = 0; i < blockPosArr.length; i++) {
                var putFlag: boolean;
                if (this._mapItemPreCol % 2 == 0) {
                    r = this._mapItemPreRow + blockPosArr[i].v1;
                    c = this._mapItemPreCol + blockPosArr[i].v2;
                    putFlag = MapManager.checkCanPut(r, c, this._mcOperateUI.putType);
                }
                else {
                    if (blockPosArr[i].v2 % 2 == 0) {
                        r = this._mapItemPreRow + blockPosArr[i].v1;
                        c = this._mapItemPreCol + blockPosArr[i].v2;
                        putFlag = MapManager.checkCanPut(r, c, this._mcOperateUI.putType);
                    }
                    else {
                        r = this._mapItemPreRow + blockPosArr[i].v1 + 1;
                        c = this._mapItemPreCol + blockPosArr[i].v2;
                        putFlag = MapManager.checkCanPut(r, c, this._mcOperateUI.putType);
                    }
                }
                this._mcOperateUI.blockArr[i].showPutState(putFlag);
                if (!putFlag)
                    this._buildingCanPutFlag = false;
                console.log('edit ' + putFlag);
            }
        }

        // private removeAllTestBlocks(){
        //     for(let i = 0;i<this._testBlockArr.length;i++){
        //         this._testBlockArr[i].removeSelf();
        //     }
        // }
        // private getOneTestBlock():Laya.Image{
        //     for(let i = 0;i<this._testBlockArr.length;i++){
        //         if(!this._testBlockArr[i].parent){
        //             return this._testBlockArr[i];
        //         }
        //     }
        // }
        /**
         * 在屏幕中央找一个对应的点
         */
        private findCorrectPos(rowColInfo: { row: number, col: number }) {
            if (this._mapItemInfo.putState > 0)//表示当前要摆放的建筑是在地图中的
            {
                let pos = MapInfo.calPositionByRowAndCol(this._mapItemInfo.mapPosRow, this._mapItemInfo.mapPosCol);
                this.pos(pos.x, pos.y);
                this._mapItemPreCol = this._mapItemInfo.mapPosCol;
                this._mapItemPreRow = this._mapItemInfo.mapPosRow;
            }
            else if (rowColInfo.row > -1 && rowColInfo.col > -1)/**这个是连续编辑用的 */ {
                this._mapItemPreCol = rowColInfo.col;
                this._mapItemPreRow = rowColInfo.row;
                let pos = MapInfo.calPositionByRowAndCol(this._mapItemPreRow, this._mapItemPreCol);
                this.pos(pos.x, pos.y);
            }
            else {
                let mapOffsetPos = new Laya.Point(LayerManager.mapLayer.x, LayerManager.mapLayer.y);
                let startRow = Math.floor(Math.abs(mapOffsetPos.y) / MapInfo.mapScale / MapInfo.MAP_BLOCK_HEIGHT);
                let startCol = Math.floor(Math.abs(mapOffsetPos.x) / MapInfo.mapScale / MapInfo.MAP_GRID_WIDTH);
                let stageTotalRow = Math.floor((MapEditorManager.getInstance().whereFrom != "ui" ? Laya.stage.height : (Laya.stage.height - 170)) / MapInfo.mapScale / MapInfo.MAP_BLOCK_HEIGHT);/**高减170，使得布置的时候， */
                let stageTotalCol = Math.floor(Laya.stage.width / MapInfo.mapScale / MapInfo.MAP_GRID_WIDTH);
                this._mapItemPreRow = startRow + Math.floor(stageTotalRow / 2);
                this._mapItemPreCol = startCol + Math.floor(stageTotalCol / 2);

                // //对于新手引导的
                if (GuideMainManager.instance.isGuideAction) {
                    let mainID = GuideMainManager.instance.curGuideInfo.mainID;
                    if (mainID == 7) {
                        let putPos = this.autoPutFindPos();
                        this._mapItemPreRow = putPos.row;
                        this._mapItemPreCol = putPos.col;
                        let pos = MapInfo.calPositionByRowAndCol(this._mapItemPreRow, this._mapItemPreCol);
                        MapManager.setSelfBodyPos(pos.x + 200, pos.y);
                    }
                }
                let pos = MapInfo.calPositionByRowAndCol(this._mapItemPreRow, this._mapItemPreCol);
                this.pos(pos.x, pos.y);
            }
        }

        private autoPutFindPos(): { row: number, col: number } {
            let arr = MapManager.curMap.mapGridData.mapGridInfoArr;
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                    if (arr[i][j].oriData == 104) {
                        // console.log("check row:"+i+"  col:"+j);
                        if (MapInfo.checkMapItemCanPut(i, j, this._mapItemInfo.blockPosArr, this._mapItemInfo.putType)) {
                            return { row: i, col: j };
                        }
                    }
                }
            }
            return { row: 0, col: 0 };
        }
        public reverseMapItem() {
            if (!this._mapItemInfo.canReverse) {
                return;
            }
            this._isReverse = !this._isReverse;
            this._mcOperateUI.img.scaleX = this._isReverse ? -1 : 1;
            let offsetPos = this._isReverse ? this._mapItemInfo._reverseOffserPos : this._mapItemInfo._offsetPos;
            this._mcOperateUI.img.pos(offsetPos.x, offsetPos.y);
            let blocksArr = this._isReverse ? this._mapItemInfo._reverseBlockPosArr : this._mapItemInfo._oriBlockPosArr;
            this._mcOperateUI.showBlocks(blocksArr);
            this.showPutState();
        }
        public getOperateMapItemInfo(): MapItemInfo {
            return this._mapItemInfo;
        }
        public hideOperateMapItem() {
            this._mapItemInfo = null;
            this.removeSelf();
            MapEditorManager.getInstance().showEditBox(false);
        }
        public destroy() {
        }
    }
}