

namespace component {
    /**
     * 圆弧列表 (暂时废弃)
     */
    export class HuaArc extends Laya.List {

        private _moveing: boolean;
        /** x方向偏移值*/
        private _arcx: number = 0;
        /** Y方向偏移值*/
        private _arcy: number = 0;
        /** 最大缩放值*/
        private _maxArcs: number = 1;
        /** 最小缩放值*/
        private _minArcs: number = 1;

        constructor() { super(); }

        /**
         * 初始化
         * @param w 列表宽度 
         * @param h 列表长度
         * @param maxArcs 最大缩放值 默认1
         * @param minArcs 最小缩放值 默认1
         * @param arcx x偏移值 默认0
         * @param arcy y:偏移值 默认0
         */
        public init(w: number, h: number, maxArcs?: number, minArcs?: number, arcx?: number, arcy?: number): void {
            this.width = w;
            this.height = h;
            this._maxArcs = maxArcs == void 0 ? 1 : maxArcs;
            this._minArcs = minArcs == void 0 ? 1 : minArcs;
            this._arcx = arcx == void 0 ? 0 : arcx;
            this._arcy = arcy == void 0 ? 0 : arcy;
        }


        public set scrollBar(value: Laya.ScrollBar) {
            if (this._scrollBar != value) {
                this._scrollBar = value;
                if (value) {
                    this._isVertical = this._scrollBar.isVertical;
                    this.addChild(this._scrollBar);
                    this._scrollBar.on(Laya.Event.CHANGE, this, this.onScrollBarChange);
                    // this._scrollBar.on(Laya.Event.END, this, this.onEnd);
                    //  TODO 是否设置 context
                }
            }
        }

        public setArray(values: any): void {
            this.array = values;
            let v: number = (this._isVertical ? this.height / 2 : this.width / 2) - this._cellSize / 2;
            this._scrollBar.min -= v;
            this._scrollBar.max += v;
            this._isVertical ? (this._content.height += v) : (this._content.width += v);
        }

        protected onScrollBarChange(): void {
            super.onScrollBarChange();
            this.updateArc();
        }

        protected createItem(): Laya.Box {
            let box: Laya.Box = super.createItem();
            box.anchorX = box.anchorY = 0.5;
            box.x += box.width / 2;
            box.y += box.height / 2;
            return box;
        }

        /** 更新*/
        private updateArc(): void {
            !this._moveing && this._scrollBar.once(Laya.Event.END, this, this.onEnd);
            this._moveing = true;
            // let max: number = 
            let line: number = this._isVertical ? this.height : this.width;
            let max: number = Math.ceil(line / this._cellSize);
            let startI: number = this._startIndex;
            let len: number = startI + max;
            let item: Laya.Box;
            let w: number = line / 2;
            for (let i: number = startI; i < len; i++) {
                item = this.getCell(i);
                if (item) {
                    let iv: number = this._isVertical ? item.height : item.width;
                    let p: number = this._isVertical ? item.y : item.x;
                    let r: number = 1 - Math.abs(p + (iv / 2) - this._scrollBar.value - w) / w; //0-1 1表示中点位置
                    let s: number = (this._maxArcs - this._minArcs) * r + this._minArcs;
                    item.x = item.x + r * this._arcx;
                    item.y = item.y + r * this._arcy;
                    item.scale(s, s);
                }
            }
        }

        /**
         * 滑条停止
         */
        private onEnd(): void {
            if (!this._moveing) return;
            this._moveing = false;
            let line: number = this._isVertical ? this.height : this.width;
            let len: number = this._startIndex + Math.ceil((line / this._cellSize) / 2);
            let item: Laya.Box;
            let w: number = line / 2;
            let maxR: number = -10000;
            let index: number = 0;
            for (let i: number = this._startIndex; i < len; i++) {
                item = this.getCell(i);
                if (item) {
                    let iv: number = this._isVertical ? item.height : item.width;
                    let p: number = this._isVertical ? item.y : item.x;
                    let r: number = 1 - Math.abs(p + iv / 2 - this._scrollBar.value - w) / w;
                    if (r > maxR) {
                        maxR = r;
                        index = i;
                    }
                }
            }
            this.go(index);
        }

        public go(index: number): void {
            let item: Laya.Box = this._cells[0];
            if (item) {
                let v: number = this._isVertical ? item.height : item.width;
                let n: number = Math.round(this._scrollBar.min / v);
                console.log("go: ", index + n);
                this.tweenTo(index + n);
            }
        }
    }
}