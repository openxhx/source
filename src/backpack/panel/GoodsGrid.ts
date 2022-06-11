namespace backpack.panel {
    /**
     * 道具格
     */
    export class GoodsGrid {

        private _id: number;

        private _data: clientCore.MaterialBagInfo;

        private _board: Laya.Image;
        private _icon: component.HuaButton;
        private _count: Laya.FontClip;

        private _x: number;
        private _y: number;

        public static readonly HEIGHT: number = 107;
        public static readonly WIDTH: number = 108;

        public static create(): GoodsGrid {
            return Laya.Pool.getItemByClass("GoodsGrid", GoodsGrid);
        }

        constructor() { }

        public init(data: clientCore.MaterialBagInfo, bgLayer: Laya.Sprite, iconLayer: Laya.Sprite, zsLayer: Laya.Sprite, textLayer: Laya.Sprite): void {
            this._data = data;
            this._id = data.goodsInfo.itemID;
            this.showBoard(bgLayer);
            this.showIco(iconLayer);
            this.showText(textLayer);
        }

        public get id(): number {
            return this._id;
        }

        public get x(): number {
            return this._x;
        }

        public set x(value: number) {
            this._x = value;

            let _array: Laya.Sprite[] = [this._board, this._icon, this._count];
            _.forEach(_array, (sp: Laya.Sprite) => {
                sp.x = value + sp["offx"] >> 0;
            })
        }

        public get y(): number {
            return this._y;
        }

        public set y(value: number) {
            this._y = value;
            let _array: Laya.Sprite[] = [this._board, this._icon, this._count];
            _.forEach(_array, (sp: Laya.Sprite) => {
                sp.y = value + sp["offy"] >> 0;
            })
        }

        public dispose(): void {
            this._icon.off(Laya.Event.CLICK, this, this.onClick);
            let _array: Laya.Sprite[] = [this._board, this._icon, this._count];
            _.forEach(_array, (sp: Laya.Sprite) => {
                sp.removeSelf();
            })
            this._data = null;
            this._id = 0;
            Laya.Pool.recover("GoodsGrid", this);
        }

        /**
         * 展示底板
         * @param layer 
         */
        private showBoard(layer: Laya.Sprite): void {
            if (!this._board) {
                this._board = new Laya.Image();
                this._board.size(108, 108);
                this._board["offx"] = 0;
                this._board["offy"] = 0;
            }
            this._board.skin = clientCore.ItemsInfo.getItemIconBg(this._id);
            layer.addChild(this._board);
        }

        /**
         * 展示icon
         * @param layer 
         */
        private showIco(layer: Laya.Sprite): void {
            if (!this._icon) {
                this._icon = new component.HuaButton();
                this._icon.isScale = true;
                this._icon["offx"] = 54;
                this._icon["offy"] = 54;
                this._icon.width = this._icon.height = 80;
                this._icon.anchorX = this._icon.anchorY = 0.5;
            }
            this._icon.on(Laya.Event.CLICK, this, this.onClick);
            this._icon.skin = clientCore.ItemsInfo.getItemIconUrl(this._data.goodsInfo.itemID);
            layer.addChild(this._icon);
        }

        /**
         * 展示数量
         * @param layer 
         */
        private showText(layer: Laya.Sprite): void {
            if (!this._count) {
                this._count = new Laya.FontClip();
                this._count.skin = "commonRes/font_num.png";
                this._count.sheet = '0123456789/abcdefghijklmnopqrst+-~';
                this._count.spaceX = -5;
                this._count.align = "right";
                this._count.width = 70;
                this._count["offx"] = 27;
                this._count["offy"] = 73;
            }
            layer.addChild(this._count);
            this._count.value = this._data.goodsInfo.itemNum.toString();
        }

        private onClick(): void {
            EventManager.event(globalEvent.BACKPACK_GOODS_CLICK, this._data);
        }
    }
}