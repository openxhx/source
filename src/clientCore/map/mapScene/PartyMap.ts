/// <reference path="MapBase.ts" />
namespace clientCore {
    /**
     * 派对地图
     */
    export class PartyMap extends MapBase {

        async init():Promise<void>{
            await Promise.all([
                res.load("atlas/main/party.atlas"),
                xls.load(xls.partyHouse)
            ]);
            UIManager.changeMainUI('party');
            await super.init();
            
            PartyMapManager.setUp();
        }
        protected initMapGridData(){
            this.mapGridData = new MapGridData();
            this.mapGridData.initMapGridInfo();
            this.mapGrid = new MapGrid();
            this.mapGrid.addAllGridBlock();
        }
    }
}