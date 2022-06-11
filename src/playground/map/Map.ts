namespace playground {

    export enum MAP_TYPE {
        MAJOR = 1,
        SECONDARY
    }

    export class Map extends Laya.Sprite {
        public gridWidth: number;
        public gridHeight: number;
        /** 格子坐标集合*/
        private _grids: Laya.Point[] = [];
        /** 当前的地图类型*/
        private _type: number;
        /** 事件层*/
        private _eventLayer: Laya.Sprite;
        /** 事件集合*/
        private _eventMap: Object;

        constructor() { super(); }

        async init(type: number): Promise<void> {
            this.x = -clientCore.LayerManager.OFFSET;
            this._type = type;
            let data_path: string = `res/playground/${type}/data.json`;
            let simple_path: string = `res/playground/${type}/simple.png`;
            await res.load([data_path, simple_path]);
            let data: any = Laya.loader.getRes(data_path);
            this.width = data.size[0];
            this.height = data.size[1];
            this.gridWidth = data.childSize[0];
            this.gridHeight = data.childSize[1];
            //显示缩略图
            this.graphics.drawImage(Laya.loader.getRes(simple_path), 0, 0, this.width, this.height);
            //绘制地图
            this.drawMap(data.row, data.col);
            //载入地图控件
            let view: core.BaseModule = new ui.playground[`Map_${type}UI`]();
            this.addChild(view);
            let box: Laya.Box = view['box'];
            let array: Laya.Sprite[] = box['_children'];
            _.forEach(array, (element) => {
                let point: Laya.Point = Laya.Point.create();
                point.setTo(element.x + element.width / 2 + box.x, element.y + element.height / 2 + box.y);
                this._grids.push(point);
            })
            array = _.sortBy(array, 'y');
            _.forEach(array, (element) => { box.addChild(element); });
            //事件层
            this._eventMap = {};
            this._eventLayer = new Laya.Sprite();
            this.addChild(this._eventLayer);
            this.createEvents();
        }

        private drawMap(row: number, col: number): void {
            let map: Laya.Image = this.addChild(new Laya.Image()) as Laya.Image;
            for (let i: number = 0; i < row; i++) {
                for (let j: number = 0; j < col; j++) {
                    this.drawMapGrid(map, i, j);
                }
            }
        }

        private drawMapGrid(map: Laya.Image, row: number, col: number): void {
            let url: string = `res/playground/${this._type}/${row}_${col}.png`;
            Laya.loader.load(url, Laya.Handler.create(this, (data: Laya.Texture) => {
                map.graphics.drawImage(data, col * this.gridWidth, row * this.gridHeight, this.gridWidth, this.gridHeight);
            }), null, Laya.Loader.IMAGE)
        }

        public gridPos(index: number): Laya.Point {
            return this._grids[index - 1];
        }

        public gridLength(): number {
            return this._grids.length;
        }

        private createEvents(): void {
            let array: xls.flowerGarden[] = xls.get(xls.flowerGarden).getValues();
            array = _.filter(array, (element) => { return element.type == this._type; });
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.flowerGarden = array[i];
                if (element && element.event != 0) {
                    let item: EventItem = EventItem.create();
                    let start: Laya.Point = this._grids[i];
                    item.setEvent(element);
                    item.pos(start.x, start.y);
                    this._eventLayer.addChild(item);
                    this._eventMap[i] = item;
                }
            }
        }

        /**
         * 改变某格子的事件
         * @param index 
         */
        public changeEvent(index: number): void {
            index = index - 1; //因为数组是0开始 而地图的格子是从1开始 所以-1
            let item: EventItem = this._eventMap[index];
            let array: xls.flowerGarden[] = xls.get(xls.flowerGarden).getValues();
            array = _.filter(array, (element) => { return element.type == this._type; });
            item.setEvent(array[index]);
        }

        /**
         * 判断某个格子是否没有事件
         * @param index 
         */
        public checkBlank(index: number): boolean {
            return this._eventMap[index - 1] == void 0;  //因为数组是0开始 而地图的格子是从1开始 所以-1
        }

        get type(): MAP_TYPE {
            return this._type;
        }

        dispose(): void {
            let len: number = this._eventLayer.numChildren;
            for (let i: number = 0; i < len; i++) {
                let element: Laya.Node = this._eventLayer.getChildAt(i);
                element && element instanceof EventItem && element.dispose();
            }
            this._eventLayer.destroy();
            this._grids.length = 0;
            this._eventMap = this._eventLayer = this._grids = null;
            this.destroy();
        }
    }
}