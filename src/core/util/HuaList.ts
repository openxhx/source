namespace util {
    /**
     * 增加移除动画效果的list组件
     */
    export class HuaList extends Laya.List {

        private _scH: number = 0;
        private _times: number = 1;

        private _tween: Laya.Tween;
        private _deleteTarget: Laya.Box;

        constructor() { super(); }

        public async deleteItem(index: number, complete?: Laya.Handler) {
            this._deleteTarget = this.getCell(index);
            let h: number = this._deleteTarget.height;
            let len: number = this._cells.length;
            let y: number = 0;

            this._tween = Laya.Tween.to(this._deleteTarget, { scaleX: 0.5, scaleY: 0.5, alpha: 0.2 }, 200, null, Laya.Handler.create(this, () => {
                function onFrame(): void {
                    let start: number = index + 1 - this.startIndex;
                    for (let i: number = start; i < len; i++) {
                        let ele: Laya.Box = this._cells[i];
                        ele.y -= 5;
                    };
                    y += 5;
                    if (y > h) {
                        Laya.timer.clear(this, onFrame);
                        this.resetTarget();
                        this._array.splice(index, 1);
                        this.setArray(this._array);
                        complete && complete.run();

                        if (this.totalPage > 1) {
                            if (this._times >= this.height / h) {
                                this._scH = 0;
                                this._times = 1;
                            } else {
                                let scrVal: number = this.scrollBar.value + h + this._spaceY;
                                if (scrVal >= this.scrollBar.max) {
                                    this._scH += h;
                                    this._times++;
                                    let val: number = this.scrollBar.max + this._scH + this._spaceY;
                                    this.scrollBar.setScroll(0, val, val);
                                }
                            }
                        }
                    }
                }
                Laya.timer.loop(1, this, onFrame)
            }))
        }

        private resetTarget(): void {
            if (this._deleteTarget) {
                this._deleteTarget.scaleX = this._deleteTarget.scaleY = 1;
                this._deleteTarget.alpha = 1;
            }
        }

        public get array(): Array<any> {
            return this._array;
        }

        public set array(value: Array<any>) {
            this._scH = 0;
            this._times = 1;
            if (this._tween) {
                this._tween.clear();
                this._tween = null;
            }
            Laya.timer.clearAll(this);
            this.resetTarget();
            this.setArray(value);
        }

        private setArray(value: any) {
            this.runCallLater(this.changeCells);
            this._array = value || [];

            var length: number = this._array.length;
            this.totalPage = Math.ceil(length / (this.repeatX * this.repeatY));
            //重设selectedIndex
            this._selectedIndex = this._selectedIndex < length ? this._selectedIndex : length - 1;
            //重设startIndex
            this.startIndex = this._startIndex;
            //重设滚动条
            if (this._scrollBar) {
                this._scrollBar.stopScroll();
                //自动隐藏滚动条
                var numX: number = this._isVertical ? this.repeatX : this.repeatY;
                var numY: number = this._isVertical ? this.repeatY : this.repeatX;
                var lineCount: number = Math.ceil(length / numX);
                var total: number = this._cellOffset > 0 ? this.totalPage + 1 : this.totalPage;
                if (total > 1) {
                    this._scrollBar.scrollSize = this._cellSize;
                    this._scrollBar.thumbPercent = numY / lineCount;
                    this._scrollBar.setScroll(0, (lineCount - numY) * this._cellSize + this._cellOffset, this._scrollBar.value);
                    this._scrollBar.target = this._content;
                } else {
                    this._scrollBar.setScroll(0, 0, 0);
                    this._scrollBar.target = this._content;
                }
            }
        }


        public destroy(): void {
            if (this._tween) {
                this._tween.clear();
                this._tween = null;
            }
            this._deleteTarget = null;
            Laya.timer.clearAll(this);
            super.destroy();
        }

    }
}