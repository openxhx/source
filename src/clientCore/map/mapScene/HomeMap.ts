/// <reference path="MapBase.ts" />
namespace clientCore {
    /**
     * 主场景地图
     */
    export class HomeMap extends MapBase {

        constructor() {
            super();

        }
        public async init(): Promise<void> {
            UIManager.changeMainUI(clientCore.GlobalConfig.isSamsungGy ? "samsung" : "home");
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