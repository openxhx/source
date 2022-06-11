namespace clientCore {
    /**
     * 这个类包含地图的相关信息，提供接口校验信息
     * 不参与地图逻辑处理
     */
    export class MapInfo {
        //-----------服务器给的数据------------------------------------------
        public static type: number; //地图类型
        /** 地图数据 家园-uid 家族-familyId*/
        public static mapData: string;
        // public static mapOwnerUID: number;
        public static mapID: number;
        /**地图中的活动数据 */
        // public static mapActInfo: pb.IActivity[];
        //------------常量--------------------------------------------------
        public static offsetX: number = 0;
        public static stageScale: number = 1; //地图和舞台的缩放比
        public static mapScale: number = 1;//保存当前地图缩放值
        public static mapMaxScale: number = 2.5;
        public static mapMinScale: number = 0.5;
        public static scaleChangePerFrame: number = 0.03;
        public static MAP_BLOCK_WIDTH: number = 52;
        public static MAP_BLOCK_HEIGHT: number = 45;
        public static MAP_BLOCK_SIDE_LENGTH: number = MapInfo.MAP_BLOCK_WIDTH / 2;
        public static MAP_GRID_WIDTH = MapInfo.MAP_BLOCK_WIDTH * 3 / 4;//这个是每列相隔的距离
        //--------------本地数据--------------------------------------------
        public static mapWidth: number;
        public static mapHeight: number;
        public static mapGridWidth: number;
        public static mapGridHeight: number;
        public static row: number; //图块行
        public static column: number; //图块列
        public static mapEditState: boolean = false;//编辑模式，派对的跟其他地图的共用这个编辑状态。因为编辑模式要么是派对的，要么是其他的，不会同时存在

        private static allMapGridInfoArr: string | any[];//这个数组保存所有地图格子信息,json表里面配的，可以有多个地图


        /**
         * 是否在自己地图中
         */
        public static get isSelfHome() {
            return this.type == 1 && parseInt(this.mapData) == LocalInfo.uid;
        }
        /** 家族ID为2的才是家族，其他的是活动地图 */
        public static get isSelfFamily() {
            return this.type == 2 && this.mapData == FamilyMgr.ins.familyId && this.mapID == 2;
        }
        public static get isSelfFamilyParty() {
            return this.type == 2 && this.mapData == FamilyMgr.ins.familyId && this.mapID == 20;
        }
        public static get isOthersHome() {
            return this.type == 1 && parseInt(this.mapData) != LocalInfo.uid;
        }
        public static checkIsInWorldMap(id: number): boolean {
            if (this.type != 5) {
                return false;
            }
            return this.mapID == id;
        }
        public static get isSelfParty():boolean{
            return this.type == 3 && parseInt(this.mapData) == LocalInfo.uid;
        }
        public static get isOthersParty():boolean{
            return this.type == 3 && parseInt(this.mapData) != LocalInfo.uid;
        }
        public static get isParty():boolean{
            return this.type == 3;
        }

        public static setUp() {
            this.allMapGridInfoArr = res.get(pathConfig.getJsonPath("mapGrid"));
        }


        /**
         * 这里获取的是原始地图网格信息
         */
        public static getGridInfoByMapID(id: number): [][] {
            for (let i = 0; i < this.allMapGridInfoArr.length; i++) {
                if (this.allMapGridInfoArr[i]["mapID"] == id)
                    return this.allMapGridInfoArr[i]["gridInfo"];
            }
        }



        /**
         * 计算原理参考 https://blog.csdn.net/kun1234567/article/details/39058995
         * 切割成矩形的方式
         * @param posX 根据传进来的 x 跟 y ，判断所处的行列位置
         * @param posY 
         */
        public static calRowAndColByPosition(posX: number, posY: number): { row: number, col: number } {
            let row = 0;
            let col = 0;
            posX += this.MAP_BLOCK_WIDTH / 4;
            let oriCol = Math.floor(posX / this.MAP_GRID_WIDTH);
            let oriRow = Math.floor(posY / this.MAP_BLOCK_HEIGHT);
            if (oriCol % 2 == 0) {/** 偶数情况  情况B */
                if ((posX - oriCol * this.MAP_GRID_WIDTH) < this.MAP_BLOCK_SIDE_LENGTH / 2)/**左边三分之一的情况 */ {
                    if (posY - oriRow * this.MAP_BLOCK_HEIGHT < this.MAP_BLOCK_HEIGHT / 2) {/**情况B  黄色 */
                        col = oriCol - 1;
                        row = oriRow - 1;
                    }
                    else {/**情况B  绿色 */
                        col = oriCol - 1;
                        row = oriRow;
                    }
                }
                else if ((posX - oriCol * this.MAP_GRID_WIDTH) > this.MAP_BLOCK_SIDE_LENGTH)/**右边三分之一的情况 */ {/**情况B  粉色 */
                    row = oriRow;
                    col = oriCol;
                }
                else {/**中间三分之一的情况 */
                    let disX = posX - oriCol * this.MAP_GRID_WIDTH - this.MAP_BLOCK_SIDE_LENGTH / 2;
                    let disY = posY - oriRow * this.MAP_BLOCK_HEIGHT;
                    if (disY < this.MAP_BLOCK_HEIGHT / 2) {
                        if ((this.MAP_BLOCK_SIDE_LENGTH / 2 - disX) * Math.sqrt(3) < disY) {/**情况B  粉色 */
                            row = oriRow;
                            col = oriCol;
                        }
                        else {/**情况B  黄色 */
                            row = oriRow - 1;
                            col = oriCol - 1;
                        }
                    }
                    else {
                        disY -= this.MAP_BLOCK_HEIGHT / 2;
                        if (disX * Math.sqrt(3) < disY) {/**情况B  绿色 */
                            row = oriRow;
                            col = oriCol - 1;
                        }
                        else {/**情况B  粉色 */
                            row = oriRow;
                            col = oriCol;
                        }
                    }

                }
            }
            else {/**奇数情况  情况A */
                if ((posX - oriCol * this.MAP_GRID_WIDTH) < this.MAP_BLOCK_SIDE_LENGTH / 2)/**左边三分之一的情况 */ {/**情况A  粉色 */
                    row = oriRow;
                    col = oriCol - 1;
                }
                else if ((posX - oriCol * this.MAP_GRID_WIDTH) > this.MAP_BLOCK_SIDE_LENGTH)/**右边三分之一的情况 */ {
                    if (posY - oriRow * this.MAP_BLOCK_HEIGHT < this.MAP_BLOCK_HEIGHT / 2) {/**情况A  黄色 */
                        row = oriRow - 1;
                        col = oriCol;
                    }
                    else {/**情况A  绿色 */
                        row = oriRow;
                        col = oriCol;
                    }
                }
                else {/**中间三分之一的情况 */
                    let disX = posX - oriCol * this.MAP_GRID_WIDTH - this.MAP_BLOCK_SIDE_LENGTH / 2;
                    let disY = posY - oriRow * this.MAP_BLOCK_HEIGHT;
                    if (disY < this.MAP_BLOCK_HEIGHT / 2) {
                        if (disX * Math.sqrt(3) < disY) {/**情况A  粉色 */
                            row = oriRow;
                            col = oriCol - 1;
                        }
                        else {/**情况A  黄色 */
                            row = oriRow - 1;
                            col = oriCol;
                        }
                    }
                    else {
                        disY -= this.MAP_BLOCK_HEIGHT / 2;
                        if ((this.MAP_BLOCK_SIDE_LENGTH / 2 - disX) * Math.sqrt(3) < disY) {/**情况A  绿色 */
                            row = oriRow;
                            col = oriCol;
                        }
                        else {/**情况A  粉色 */
                            row = oriRow;
                            col = oriCol - 1;

                        }
                    }
                }
            }
            return { row: row, col: col };
        }
        /**
         * 分局传入的行列，算出具体位置
         * @param r 
         * @param c 
         */
        public static calPositionByRowAndCol(r: number, c: number): Laya.Point {
            let p: Laya.Point = new Laya.Point();
            p.x = (c + 1) * clientCore.MapInfo.MAP_BLOCK_WIDTH * 3 / 4 - clientCore.MapInfo.MAP_BLOCK_WIDTH / 4;
            p.y = (r + 1) * clientCore.MapInfo.MAP_BLOCK_HEIGHT - (c % 2 == 0 ? clientCore.MapInfo.MAP_BLOCK_HEIGHT / 2 : 0);
            return p;
        }

        public static findBottomRightPos(row: number, col: number): { row: number, col: number } {
            let tmpRow = (col % 2 == 0 ? row : row + 1);
            let tmpCol = col + 1;
            return { row: tmpRow, col: tmpCol };
        }
        /**
         * 这个接口只用来判断，建筑能否摆放在某个位置
         * @param startRow 
         * @param startCol 
         * @param blockPosArr 
         * @param putType 
         */
        public static checkMapItemCanPut(startRow: number, startCol: number, blockPosArr: xls.pair[], putType: number): boolean {
            let r = 0;
            let c = 0;
            for (let i = 0; i < blockPosArr.length; i++) {
                var putFlag: boolean;
                if (startCol % 2 == 0) {
                    r = startRow + blockPosArr[i].v1;
                    c = startCol + blockPosArr[i].v2;
                    putFlag = MapManager.checkCanPut(r, c, putType);
                }
                else {
                    if (blockPosArr[i].v2 % 2 == 0) {
                        r = startRow + blockPosArr[i].v1;
                        c = startCol + blockPosArr[i].v2;
                        putFlag = MapManager.checkCanPut(r, c, putType);
                    }
                    else {
                        r = startRow + blockPosArr[i].v1 + 1;
                        c = startCol + blockPosArr[i].v2;
                        putFlag = MapManager.checkCanPut(r, c, putType);
                    }
                }
                if (!putFlag) {
                    return false;
                }
            }
            return true;
        }
    }
}