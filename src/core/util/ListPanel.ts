namespace util {
    /**
     * 横向渲染列表
     */
    export class ListPanel extends Laya.Panel {

        /** render*/
        public renderHandler: Laya.Handler;
        /** select*/
        public selectHandler: Laya.Handler;
        /** 滑条停止*/
        public scrollEnd: Laya.Handler;
        /** 共多少页*/
        public totalPage: number;
        /** X方向数量*/
        public repeatX: number;
        /** Y方向数量*/
        public repeatY: number;
        /** X方向间隔*/
        public spaceX: number;
        /** Y方向间隔*/
        public spaceY: number;

        /** 数据源*/
        private _array: Array<any>;
        /** 渲染格单元*/
        private _itemRender: any;
        /** 当前页*/
        private _page: number = 0;
        /** 单元容器*/
        private _box: Laya.Box;
        /** 开始滑动的滑条位置*/
        private _startScrVal: number;

        private _cells: Laya.Box[] = [];

        /**是否需要长按 */
        public needHold: boolean;
        /**hold */
        public holdHandle: Laya.Handler;
        /**是否触发 */

        constructor(x: number, y: number, w: number, h: number) {
            super();
            this.pos(x, y);
            this.width = w;
            this.height = h;
            this._box = new Laya.Box();
            this.addChild(this._box);
        }

        public set hScrollBarSkin(value: string) {
            if (this._hScrollBar == null) {
                super.addChild(this._hScrollBar = new Laya.HScrollBar());
                this._hScrollBar.on(Laya.Event.CHANGE, this, this.onScrollBarChange, [this._hScrollBar]);
                this._hScrollBar.on(Laya.Event.START, this, this.onScrollBarStart, [this._hScrollBar]);
                this._hScrollBar.target = this._content;
                this._hScrollBar.rollRatio = 0.9;
                this._setScrollChanged();
            }
            this._hScrollBar.skin = value;
        }

        private onScrollBarStart(scrollBar: Laya.ScrollBar): void {
            this._hScrollBar.once(Laya.Event.END, this, this.onScrollBarEnd, [this._hScrollBar]);
            let len: number = this._cells.length;
            for (let i: number = 0; i < len; i++) {
                this._cells[i].visible = true;
            }
            this._startScrVal = scrollBar.value;
        }
        private onScrollBarEnd(scrollBar: Laya.ScrollBar): void {
            let diff: number = this._startScrVal - scrollBar.value;
            let page: number = this._page;
            if (diff < 0 && -diff > this.width / 2) {
                page++;
            } else if (diff > 0 && diff > this.width / 2) {
                page--;
            }
            this.page = page;

            //隐藏不在显示范围的版块
            let cell: Laya.Box;
            let len: number = this._cells.length;
            for (let i: number = 0; i < len; i++) {
                cell = this._cells[i];
                cell.visible = cell.x >= scrollBar.value && cell.x <= (scrollBar.value + this.width);
            }

            //停止
            this.scrollEnd && this.scrollEnd.runWith(page);
        }

        public set itemRender(value: any) {
            /** 销毁老的单元格*/
            let cell: Laya.Box;
            let len: number = this._cells.length;
            for (let i: number = 0; i < len; i++) {
                cell = this._cells[i];
                cell && cell.destroy();
            }
            this._cells.length = 0;
            this._itemRender = value;

            // 设置容器位置吧
            cell = this._getOneCell();
            this._box.x = cell.x >> 0;
            this._box.y = cell.y >> 0;
        }

        public set array(value: Array<any>) {
            this._array = value;
            this.createItems();
        }
        public get array(): Array<any> {
            return this._array;
        }

        public getCell(index: number): Laya.Box {
            return this._cells[index];
        }

        public set page(value: number) {
            this._page = Math.min(value, this.totalPage);
            if (this.hScrollBar) {
                this.hScrollBar.value = this._page * this.width;
            }
        }

        public get page(): number {
            return this._page;
        }

        private createItems(): void {
            this.totalPage = 0;
            let cell: Laya.Box = this._getOneCell();
            let cellWidth: number = cell.width + (this.spaceX >> 0);
            let cellHeight: number = cell.height + (this.spaceY >> 0);
            let numX: number = this.repeatX ? this.repeatX : Math.ceil(this.width / cellWidth);
            let numY: number = this.repeatY ? this.repeatY : Math.floor(this.height / cellHeight);
            let pageSize: number = numX * numY; //一页的数量
            let len: number = this._array.length;

            let arr: Laya.Box[] = [];
            _.forEach(this._cells, (item: Laya.Box) => {
                item.removeSelf();
                arr.push(item);
            });
            this._cells.length = 0;

            for (let i: number = 0; i < len; i++) {
                let index: number = i - this.totalPage * pageSize;
                let r: number = Math.floor(index / numX);
                if (r >= numY) { //TODO 当一页完成了
                    this.totalPage++;
                    index = i - this.totalPage * pageSize;
                    r = Math.floor(index / numX);
                }
                // let x: number = (index % numX + this.totalPage * numX) * cellWidth;
                let x: number = this.totalPage * this.width + (index % numX) * cellWidth;
                let y: number = r * cellHeight;
                if (arr && arr.length > 0) {
                    cell = arr.shift();
                } else {
                    cell = this.createItem();
                }
                cell.x = x + this._box.x;
                cell.y = y + this._box.y;
                cell.name = "item" + i;
                this.renderHandler && this.renderHandler.runWith([cell, i]); //???????? 
                this.addCell(cell);
            }
            if (this.hScrollBar) {
                this._box.width = (this.totalPage + 1) * this.width;
                this.hScrollBar.max = this.totalPage * this.width;
            }
        }

        private addCell(cell: Laya.Box): void {
            cell.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this._cells.push(cell);
            this._box.addChild(cell);
        }

        private onMouseDown(e: Laya.Event): void {
            e.currentTarget.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            if (this.needHold) {
                Laya.timer.once(300, this, this.trigerHold, [e.currentTarget]);
            }
        }

        private onMouseUp(e: Laya.Event) {
            Laya.timer.clear(this, this.trigerHold);
            this.onClick(e);
        }

        private trigerHold(cell: Laya.Box) {
            cell.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            if (this._cells) {
                let index: number = this._cells.indexOf(cell);
                this.holdHandle && this.holdHandle.runWith(index);
            }
        }

        private onClick(e: Laya.Event): void {
            let cell: Laya.Box = e.currentTarget as Laya.Box;
            if (this._cells) {
                let index: number = this._cells.indexOf(cell);
                this.selectHandler && this.selectHandler.runWith(index);
            }
        }

        private _getOneCell(): Laya.Box {
            this._cells.length == 0 && this._cells.push(this.createItem());
            return this._cells[0];
        }

        private createItem(): any {
            let arr: Array<any> = [];
            let box: Laya.View;
            if (this._itemRender instanceof Function) {
                box = new this._itemRender();
            } else {
                box = Laya.SceneUtils.createComp(this._itemRender, null, null, arr);
            }
            if (arr.length == 0 && box["_watchMap"]) {
                let watchMap: any = box["_watchMap"];
                for (let name in watchMap) {
                    let a: Array<any> = watchMap[name];
                    for (let i: number = 0; i < a.length; i++) {
                        let watcher: any = a[i];
                        arr.push(watcher.comp, watcher.prop, watcher.value);
                    }
                }
            }
            if (arr.length) box["_$bindData"] = arr;
            return box;
        }

        public listRefresh(): void {
            this.array = this._array;
        }

        public resizeData(): void {
            this.repeatX = this.repeatY = this.spaceX = this.spaceY = 0;
        }

        public destroy(destroyChild?: boolean): void {
            if (destroyChild == void 0) destroyChild = true;
            this._itemRender = null;
            this._array = null;
            this._cells = null;
            this._hScrollBar?.destroy();
            this._hScrollBar = null;
            this._vScrollBar?.destroy();
            this._vScrollBar = null;
            this.scrollEnd = this.selectHandler = this.selectHandler = null;
            super.destroy(destroyChild);
        }
    }
}