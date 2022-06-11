namespace backpack.panel {
    /**
     * 道具显示面板
     */
    export class GoodsPanel {

        /** 底板层*/
        private _bgLayer: Laya.Sprite;
        /** icon层*/
        private _iconLayer: Laya.Sprite;
        /** 装饰层*/
        private _zsLayer: Laya.Sprite;
        /** 文字层*/
        private _textLayer: Laya.Sprite;

        private _goodsMap: util.HashMap<GoodsGrid>;
        private _repeatX: number;
        private _spaceX: number;
        private _spaceY: number;

        private _panel: Laya.Panel;


        constructor() { }

        /**
         * 面板初始化
         * @param parent 
         * @param repeatX x方向的数量
         * @param spaceX x方向的间隔 
         * @param spaceY y方向的间隔
         */
        public init(parent: Laya.Panel, repeatX: number, spaceX: number, spaceY: number): void {
            this._panel = parent;
            this._repeatX = repeatX;
            this._spaceX = spaceX;
            this._spaceY = spaceY;
            this._goodsMap = new util.HashMap<GoodsGrid>();
            this._bgLayer = new Laya.Sprite();
            parent.addChild(this._bgLayer);
            this._iconLayer = new Laya.Sprite();
            parent.addChild(this._iconLayer);
            this._zsLayer = new Laya.Sprite();
            parent.addChild(this._zsLayer);
            this._textLayer = new Laya.Sprite();
            parent.addChild(this._textLayer);
        }

        public createGoods(info: clientCore.MaterialBagInfo): void {
            if (info) {
                this.addGoods(info);
                this.addOver();
            }
        }

        public removeGoods(id: number): void {
            let goods: GoodsGrid = this._goodsMap.get(id);
            if (goods) {
                goods.dispose();
                this._goodsMap.remove(id);
                this.addOver();
            }
        }

        /**
         * 生成界面内容
         * @param infos 
         */
        public generate(infos: clientCore.MaterialBagInfo[]): void {
            _.forEach(infos, (element: clientCore.MaterialBagInfo) => {
                this.addGoods(element);
            })
            this.addOver();
        }

        public addOver(): void {
            let len: number = this._goodsMap.length;
            let row: number = Math.floor(len / this._repeatX);
            let h: number = row * (GoodsGrid.HEIGHT + this._spaceY) + GoodsGrid.HEIGHT;
            this._zsLayer.height = this._bgLayer.height = this._iconLayer.height = this._textLayer.height = h;
            this._panel.vScrollBar.max = Math.max(h - this._panel.height, 0);

        }

        public get length(): number {
            return this._goodsMap.length;
        }

        public clear(): void {
            if (this._goodsMap.length <= 0) {
                return;
            }
            _.forEach(this._goodsMap.getValues(), (element: GoodsGrid) => {
                element && element.dispose();
            })
            this._panel.vScrollBar.max = 0;
            this._goodsMap.clear();
        }

        public dispose(): void {
            this.clear();
            this._panel = this._goodsMap = null;
        }

        private addGoods(info: clientCore.MaterialBagInfo): void {
            let goods: GoodsGrid = GoodsGrid.create();
            let len: number = this._goodsMap.length;
            goods.init(info, this._bgLayer, this._iconLayer, this._zsLayer, this._textLayer);
            this._goodsMap.add(info.goodsInfo.itemID, goods);
            let row: number = Math.floor(len / this._repeatX);
            let col: number = len % this._repeatX;
            let x: number = col * (GoodsGrid.WIDTH + this._spaceX);
            let y: number = row * (GoodsGrid.HEIGHT + this._spaceY);
            goods.x = x;
            goods.y = y;
        }
    }
}