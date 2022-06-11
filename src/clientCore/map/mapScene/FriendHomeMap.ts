/// <reference path="MapBase.ts" />
namespace clientCore {
    /**
     * 主场景地图
     */
    export class FriendHomeMap extends MapBase {

        constructor() {
            super();

        }
        public async init(): Promise<void> {
            await res.load("atlas/main/friendHome.atlas");
            await xls.load(xls.friendLevel);
            await FriendHomeInfoMgr.ins.checkFriendInfo(parseInt(MapInfo.mapData));
            await FriendHomeInfoMgr.ins.getFriendRankInfo();
            UIManager.changeMainUI("friendHome");
            await super.init();
        }
        protected initMapGridData(){
            this.mapGridData = new MapGridData();
            this.mapGridData.initMapGridInfo();
            this.mapGrid = new MapGrid();
            this.mapGrid.addAllGridBlock();
        }
        protected async initMapExpandData(){
            this.mapExpend = new MapExpand(this.mapServerData.map.areaIds);
            await this.mapExpend.setUp();
        }
    }
}