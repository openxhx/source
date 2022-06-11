
namespace component {
    /**
     * 圆弧列表工具
     */
    export class HuaArc2 {

        /** 当前中心显示项*/
        public showHandler: Laya.Handler;

        private _list: Laya.List;
        private _scrollBar: Laya.ScrollBar;

        private _moveing: boolean;
        /** x方向偏移值*/
        private _arcx: number = 0;
        /** Y方向偏移值*/
        private _arcy: number = 0;
        /** 最大缩放值*/
        private _maxArcs: number = 1;
        /** 最小缩放值*/
        private _minArcs: number = 1;
        /** 是否垂直滚动*/
        private _isVertical: boolean;

        /** 当前显示项索引*/
        private _showIndex: number;

        private _startX: number = 0;
        private _startY: number = 0;

        private _anchor: number = 0;

        /**
         * 初始化
         * @param w 列表宽度 
         * @param h 列表长度
         * @param maxArcs 最大缩放值 默认1
         * @param minArcs 最小缩放值 默认1
         * @param arcx x偏移值 默认0
         * @param arcy y:偏移值 默认0
         */
        constructor(w: number, h: number, maxArcs?: number, minArcs?: number, arcx?: number, arcy?: number) {
            this._list = new Laya.List();
            this._list.width = w;
            this._list.height = h;
            this._maxArcs = maxArcs == void 0 ? 1 : maxArcs;
            this._minArcs = minArcs == void 0 ? 1 : minArcs;
            this._arcx = arcx == void 0 ? 0 : arcx;
            this._arcy = arcy == void 0 ? 0 : arcy;

            this._list.mouseHandler = Laya.Handler.create(this, this.onMouse, null, false);
        }

        private onMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.CLICK) {
                this.showIndex = index;
            }
        }

        public set vScrollBarSkin(value: string) {
            this._list.repeatX = 1;
            this._isVertical = true;
            this._list.vScrollBarSkin = value;
            this.setScroll();
        }

        public set hScrollBarSkin(value: string) {
            this._list.repeatY = 1;
            this._isVertical = false;
            this._list.hScrollBarSkin = value;
            this.setScroll();
        }

        public setScroll(): void {
            this._scrollBar = this._list.scrollBar;
            this._scrollBar.rollRatio = 0.8;
            this._scrollBar.on(Laya.Event.CHANGE, this, this.onChange);
            this._scrollBar.on(Laya.Event.END, this, this.onEnd);
            this._list.content.on(Laya.Event.MOUSE_DOWN, this, this.onContentMouseDown);
        }

        /** 设置滚动阻尼*/
        public setRollRation(value: number): void {
            this._scrollBar && (this._scrollBar.rollRatio = value);
        }

        public get array(): any[] {
            return this._list.array;
        }

        public set array(value: any[]) {
            this._list.array = value;
            let v: number = this._isVertical ? this._list.height : this._list.width;
            let item: Laya.Box = this._list.cells[0];
            if (item) {
                let i: number = this._isVertical ? item.height : item.width;
                this._anchor = this._isVertical ? item.anchorY : item.anchorX;
                let d: number = Math.floor(v / 2 - this._anchor * i) >> 0;
                this._scrollBar.min -= d;
                this._scrollBar.max += d;
                // this._isVertical ? (this._list.content.height += 2 * v) : (this._list.content.width += 2 * v);
                this._startX = item.x;
                this._startY = item.y;
                // this._list.renderHandler = Laya.Handler.create(this,this.);
            }
        }

        public set itemRender(value: any) {
            this._list.itemRender = value;
        }

        public set renderHandler(handler: Laya.Handler) {
            this._list.renderHandler = handler;
        }

        public set mouseHanlder(handler: Laya.Handler) {
            this._list.mouseHandler = handler;
        }

        private _count: number = 0;
        private onContentMouseDown(): void {
            this._moveing = false;
            this._count = 0;
        }

        private onChange(): void {
            this._moveing = true;
            let startI: number = this._list.startIndex;
            let lineV: number = this._isVertical ? this._list.height : this._list.width;
            let item: Laya.Box = this._list.cells[0];
            if (!item) return;
            let lineV1: number = this._isVertical ? item.height : item.width;
            let len: number = Math.abs(startI) + Math.ceil(lineV / lineV1) + 1; // +1防止边缘值
            let w: number = lineV / 2;
            for (let i: number = startI; i < len; i++) {
                item = this._list.getCell(i);
                if (item && item.visible) {
                    let v: number = this._isVertical ? item.y : item.x;
                    let size: number = this._isVertical ? item.height : item.width;
                    let r: number = 1 - Math.abs(v + size * this._anchor - this._scrollBar.value - w) / w;
                    let s: number = this._minArcs + (this._maxArcs - this._minArcs) * r;
                    if (this._isVertical) {
                        item.x = this._startX + r * this._arcx;
                    } else {
                        item.y = this._startY + r * this._arcy;
                    }
                    item.scale(s, s);
                }
            }

        }

        private onEnd(): void {
            if (!this._moveing) return;
            this._moveing = false;
            let startI: number = this._list.startIndex;
            let lineV: number = this._isVertical ? this._list.height : this._list.width;
            let item: Laya.Box = this._list.cells[0];
            if (!item) return;
            let lineV1: number = this._isVertical ? item.height : item.width;
            let len: number = Math.abs(startI) + Math.ceil(lineV / lineV1) + 1;
            let w: number = lineV / 2;
            let minW: number = 1000000;
            let index: number = 0;
            for (let i: number = startI; i < len; i++) {
                item = this._list.getCell(i);
                if (item && item.visible) {
                    let v: number = this._isVertical ? item.y : item.x;
                    let size: number = this._isVertical ? item.height : item.width;
                    let d: number = Math.abs(v + size * this._anchor - this._scrollBar.value - w);
                    if (d < minW) {
                        minW = d;
                        index = i;
                    }
                }
            }
            this.showIndex = index;
        }

        public set showIndex(index: number) {
            if (index < 0 || index >= this._list.array.length) return;
            this._showIndex = index;
            this.go(index);
        }

        /**当前选中 */
        public get showIndex(): number {
            return this._showIndex;
        }

        private go(index: number): void {
            let item: Laya.Box = this._list.cells[0];
            if (item) {
                let lineV: number = this._isVertical ? item.height : item.width;
                let n: number = Math.round(this._list.scrollBar.min / lineV);
                this._list.tweenTo(index + n);
                this.showHandler && this.showHandler.runWith(index);
            }
        }

        public get list(): Laya.List {
            return this._list;
        }

        public refresh(): void{
            this.array = this.array;
            this.showIndex = this.showIndex;
        }

        public dispose(): void {
            this._list.destroy();
            this._list = null;
            this.showHandler = null;
        }
    }
}