namespace clientCore {
    export class MapBase {
        private _layerArr: Laya.Sprite[];
        //扩建信息
        public mapExpend: MapExpand;
        public mapGridData: MapGridData;
        public mapGrid: MapGrid;//地图网格信息
        public mapPick: MapPick;
        private _mapImgArr: string[];


        protected mapServerData: pb.Isc_enter_map;

        /**
         * for 循环新建7层 从下到上  
         * backMap 
         * middleMap 
         * mapExpandLayer 
         * mapItemsLayer 
         * gridLayer 
         * peopleLayer 
         * pickLayer
         * frontMap
         */
        constructor() {
            this._layerArr = [];
            for (let i = 0; i < 13; i++) {
                this._layerArr.push(new Laya.Sprite());
                clientCore.LayerManager.mapLayer.addChild(this._layerArr[i]);
            }
        }
        public get backMap(): Laya.Sprite {
            return this._layerArr[0];
        }
        public get middleMap(): Laya.Sprite {
            return this._layerArr[1];
        }
        public get mapExpandLayer(): Laya.Sprite {
            return this._layerArr[2];
        }
        public get mapItemsLayer(): Laya.Sprite {
            return this._layerArr[3];
        }
        public get mapUpLayer(): Laya.Sprite {
            return this._layerArr[4];
        }
        public get gridLayer(): Laya.Sprite {
            return this._layerArr[5];
        }
        public get downLayer(): Laya.Sprite{
            return this._layerArr[6];
        }
        public get peopleLayer(): Laya.Sprite {
            return this._layerArr[7];
        }
        public get pickLayer(): Laya.Sprite {
            return this._layerArr[8];
        }
        public get giftLayer(): Laya.Sprite {
            return this._layerArr[9];
        }
        public get avatarLayer(): Laya.Sprite {
            return this._layerArr[10];
        }
        public get effectLayer(): Laya.Sprite {
            return this._layerArr[11];
        }
        public get upLayer(): Laya.Sprite {
            return this._layerArr[12];
        }

        public initData(data: pb.Isc_enter_map) {
            this.mapServerData = data;
        }

        /**
         * 创建地图的所有工作从这里开始
         * 1、加载地图
         * 2、加载网格信息
         * 3、加载地图建筑信息
         */
        public async init() {
            this.initMapGridData();
            this.initMapExpandData();
            //加载地图
            console.log("start load map UI");
            let path: string = pathConfig.getMapData(MapInfo.mapID);
            let t: number = Laya.Browser.now();
            //载入地图数据
            await new Promise((suc) => {
                Laya.loader.load(path, Laya.Handler.create(this, () => {
                    console.log("map data time: ", Laya.Browser.now() - t);
                    suc();
                }));
            })
            //载入简略地图
            path = pathConfig.getSimpleMap(MapInfo.mapID);
            await new Promise((suc) => {
                Laya.loader.load(path, Laya.Handler.create(this, () => {
                    console.log("map simple time: ", Laya.Browser.now() - t);
                    suc();
                }))
            })
            await LoadingManager.setLoading("", 80);
            this.initMap();
        }
        protected initMapGridData() {

        }
        protected async initMapExpandData() {

        }

        private initMap() {
            this.middleMap.graphics.clear();
            let data: any = Laya.loader.getRes(pathConfig.getMapData(MapInfo.mapID));
            this.backMap.loadImage(pathConfig.getSimpleMap(MapInfo.mapID)); //显示模糊图
            MapInfo.mapGridWidth = data.childSize[0];
            MapInfo.mapGridHeight = data.childSize[1];
            MapInfo.row = data.row;
            MapInfo.column = data.col;
            MapInfo.mapWidth = this.backMap.width = this.middleMap.width = data.size[0];
            MapInfo.mapHeight = this.backMap.height = this.middleMap.height = data.size[1];
            clientCore.LayerManager.mapLayer.mouseEnabled = true;
            this.middleMap.mouseEnabled = true;
            MapInfo.mapScale = 1;
            clientCore.LayerManager.mapLayer.scale(1, 1);
            clientCore.LayerManager.mapLayer.pos(0, 0);
            clientCore.PersonLayer.ins.setup();
            clientCore.AvatarLayer.ins.setup();
            let mapXls = xls.get(xls.map).get(MapInfo.mapID)
            if (mapXls)
                core.SoundManager.instance.playBgm(pathConfig.getBgmUrl(mapXls.Bgm))
            console.log("map init complete!");
        }

        public drawMap(): void {
            for (let i: number = 0; i < MapInfo.row; i++) {
                for (let j: number = 0; j < MapInfo.column; j++) {
                    this.drawMapGrid(i, j);
                }
            }
        }

        public async drawMapGrid(row: number, col: number): Promise<void> {
            let url: string = pathConfig.getMapGrid(MapInfo.mapID, row, col);
            Laya.loader.load(url, Laya.Handler.create(this, (data: Laya.Texture) => {
                if (this.middleMap)
                    this.middleMap.graphics.drawImage(data, col * MapInfo.mapGridWidth, row * MapInfo.mapGridHeight, MapInfo.mapGridWidth, MapInfo.mapGridHeight);
            }), null, Laya.Loader.IMAGE)
        }

        public setAllLayerShowState(f: boolean) {
            this._layerArr.forEach(sp => {
                sp.visible = f;
            });
        }

        public destroy() {
            Laya.loader.clearUnLoaded();
            this._layerArr.forEach(sp => {
                sp.removeChildren();
                sp.removeSelf();
            });
            this._layerArr.splice(0);
            if (this.mapExpend) {
                this.mapExpend.destroy();
            }
            this.mapExpend = null;
            if (this.mapGrid) {
                this.mapGrid.destroy();
            }
            this.mapGrid = null;
            if (this.mapGridData) {
                this.mapGridData.destroy();
            }
            this.mapGridData = null;
            if (this.mapPick) {
                this.mapPick.destroy();
            }
            this.mapPick = null;
            if (this._mapImgArr && this._mapImgArr.length > 0) {
                for (let i = 0; i < this._mapImgArr.length; i++) {
                    Laya.loader.clearRes(this._mapImgArr[i]);
                }
            }
        }
    }
}