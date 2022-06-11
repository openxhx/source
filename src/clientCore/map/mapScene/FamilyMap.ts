/// <reference path="MapBase.ts" />
namespace clientCore {
    /**
     * 家族地图
     */
    export class FamilyMap extends MapBase {


        constructor() { super(); }

        public async init(): Promise<void> {
            await Promise.all([
                res.load("atlas/main/family.atlas"),
                xls.load(xls.family),
                xls.load(xls.familyPosition),
                xls.load(xls.familyLimit)
            ]);
            UIManager.changeMainUI("family");
            await super.init();
        }

        public initData(data: pb.Isc_enter_map): void {
            super.initData(data);
            if (MapInfo.mapID == 2) {
                FamilyMgr.ins.initBuilds(data.builds);
            }
        }

        protected initMapGridData() {
            if (MapInfo.mapID == 2) {
                this.mapGridData = new MapGridData();
                this.mapGridData.initMapGridInfo();
                this.mapGrid = new MapGrid();
                this.mapGrid.addAllGridBlock();
            }
        }
    }
}