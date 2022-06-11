/// <reference path="MapBase.ts" />
namespace clientCore {
    /**
     * 派对地图
     */
    export class WorldMap extends MapBase {
        constructor() { super(); }

        public async init(): Promise<void> {
            await res.load("atlas/main/worldMap.atlas");
            await xls.load(xls.mapObject);
            await MapPickAnimate.loadBgAnimate();
            UIManager.changeMainUI("worldMap");
            await super.init();

            this.mapPick.startLoadItems();
        }

        public initData(data: pb.Isc_enter_map): void {
            super.initData(data);
            this.mapPick = new MapPick();
            this.mapPick.initMapItems(data);
        }

        protected initMapGridData() {

        }

        /**隐藏指定特殊采集对象**/
        public hideLocalObject(obj: any): void {
            this.mapPick.hideLocalObject(obj);
        }
    }
}