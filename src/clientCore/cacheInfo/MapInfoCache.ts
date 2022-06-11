namespace clientCore {
    /**
     * 地图需要缓冲数据
     * 1、地图ID
     * 2、地图网格信息
     * 3、地图建筑信息
     * 4、地图装饰信息
     * 5、地图花种信息
     * 6、地图扩建信息
     * 
     */
    export class MapInfoCache {
        public mapID:number;
        public mapGridInfoArr:MapGridInfo[][];

    }
}