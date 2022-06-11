
namespace util {
    /**
     * 带下拉的处理的列表
     */
    export class HuaList2 extends Laya.List {

        private _startY: number = 0;

        /** 下拉回调*/
        public dropHanlder: Laya.Handler;

        constructor(x: number, y: number, w?: number, h?: number) {
            super();
            this.pos(x, y);
            this.width = w;
            this.height = h;
        }

        private onMouseDown(): void {
            if (this.scrollBar.value == 0) {
                this._startY = Laya.stage.mouseY;
                this.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
                this.once(Laya.Event.MOUSE_UP, this, this.onMouseEnd);
                this.once(Laya.Event.MOUSE_OUT, this, this.onMouseEnd);
            }
        }

        private onMouseMove(): void {
            if (Laya.stage.mouseY - this._startY > 0) {
                this.scrollBar.min = Math.max(this.scrollBar.min - 5, -this.height / 6);
            }
        }

        private onMouseEnd(): void {
            this.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.off(Laya.Event.MOUSE_UP, this, this.onMouseEnd);
            this.off(Laya.Event.MOUSE_OUT, this, this.onMouseEnd);
            if (!this.dropHanlder) {
                this.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
                return;
            }
            if (Laya.stage.mouseY - this._startY > 0) {
                Laya.timer.once(net.PendingReqItem.defaultTimeOut, this, this.reScrollBar);
                this.dropHanlder.run();
            }
        }

        public get array(): Array<any> {
            return this._array;
        }

        public set array(value: Array<any>) {
            Laya.timer.clear(this, this.reScrollBar);
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

        public reScrollBar(): void {
            this.scrollBar.value = this.scrollBar.min = 0;
            Laya.timer.clear(this, this.reScrollBar);
        }

        public setScrollBarSkin(value?: string): void {
            this.vScrollBarSkin = value == void 0 ? "" : value;
            this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }

        public destroy(): void {
            super.destroy();
            Laya.timer.clear(this, this.reScrollBar);
            this.dropHanlder = null;
            this.off(Laya.Event.MOUSE_MOVE, this, this.onMouseDown);
        }
    }
}