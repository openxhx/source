/// <reference path="MapBase.ts" />
namespace clientCore {
    /**
     * 派对地图
     */
    export class WeddingMap extends MapBase {
        constructor() { super(); }

        public async init(): Promise<void> {
            await res.load("atlas/main/wedding.atlas");
            await xls.load(xls.cpPick);
            await xls.load(xls.mapObject);
            await MapPickAnimate.loadBgAnimate();
            UIManager.changeMainUI("wedding");
            await super.init();

            this.mapPick.startLoadItems();
        }

        public initData(data: pb.Isc_enter_map): void {
            super.initData(data);
            this.mapPick = new MapPick();
            this.mapPick.initMapItems(data);
        }
    }
}