namespace appreciate {
    interface IItemParams {
        type: string;
        scaleMin: number;
        scaleMax: number;
    }

    export class BgItem extends ui.appreciate.render.BgItemUI {
        private _scaleNum: number = 1;
        private _deformation: number = 1;

        private _parms: IItemParams;
        private _posData: any;
        private _box: Laya.Box;

        constructor() {
            super();

            this.addEventListeners();
        }

        public init(data: IItemParams): void {
            this._parms = data;
        }

        public async update(id: number, posData: any) {
            let cfg: xls.bgshow = xls.get(xls.bgshow).get(id);
            if (cfg.dynamic) {
                if (cfg.clothKind == clientCore.CLOTH_TYPE.Stage) {
                    this.img.skin = null;
                    this.img.width = this.img.height = 1530;
                    await clientCore.BgShowManager.instance.createDynamicStage(id, this.img, 0, 765, 765);
                }
            } else {
                let url = clientCore.ItemsInfo.getItemUIUrl(id);
                await res.load(url);
                this.img.skin = url;
            }
            this._posData = posData;
            this.btn.width = posData.width;
            this.btn.height = posData.height;
            this.onImgPos();
        }

        public onClose(): void {
            this.removeSelf();
        }

        //重置
        public onReset(): void {
            this._scaleNum = 1;
            this._deformation = 1;
            this.spMc.scaleX = this.spMc.scaleY = this._scaleNum;
            this.rotation = 0;
        }

        private onShow(): void {
            if (this._parms.type == ITEM_NAME.ZHUANGSHI) {
                if (this.parent) {
                    this.parent.setChildIndex(this, this.parent.numChildren - 1);
                }
            }
        }

        private onMouseDownShow(e: Laya.Event): void {
            var touches: Array<any> = e.touches;
            if (touches) {
                if (touches.length == 2) {
                    this.stopDrag();
                    return;
                }
                if (touches.length > 2) {
                    return;
                }
            }
            this.startDrag();
            this.onShow();
            EventManager.event(AppreciateModule.ITEM_ON_OPERATION, [this]);
        }

        private onMouseUpShow(): void {
            this.stopDrag();
        }

        private onImgPos(): void {
            this.btn.x = -this.img.width / 2 + this._posData.x - this._posData.width / 2;
            this.btn.y = -this.img.height / 2 + this._posData.y - this._posData.height / 2;

            let offsetData = this.offsetData;
            this.spMc.x = this.spMc.pivotX = offsetData.x;
            this.spMc.y = this.spMc.pivotY = offsetData.y;
            this.pivotX = offsetData.x;
            this.pivotY = offsetData.y;
            this.x = offsetData.x;
            this.y = offsetData.y;
        }

        /**翻转界面 */
        public onDeformation(): void {
            this._deformation *= -1;
            this.spMc.scaleX *= -1;
        }

        /**旋转界面 */
        public onRotate(value: number): void {
            this.rotation = value;
        }

        /**缩放界面 */
        public OnZoom(value: number): void {
            if (value < this._parms.scaleMin) {
                value = this._parms.scaleMin;
            } else if (value > this._parms.scaleMax) {
                value = this._parms.scaleMax;
            }
            this._scaleNum = value;
            this.spMc.scaleX = this._scaleNum * this._deformation;
            this.spMc.scaleY = this._scaleNum;
        }

        public get scaleNum(): number {
            return this._scaleNum;
        }

        public get parms(): IItemParams {
            return this._parms;
        }

        public getGetBounds() {
            return { width: this.btn.width * this._scaleNum, height: this.btn.height * this._scaleNum };
        }

        public get offsetData() {
            return { x: this._posData.x - this.img.width / 2, y: this._posData.y - this.img.height / 2 };
        }

        addEventListeners() {
            BC.addEvent(this, this.btn, Laya.Event.MOUSE_DOWN, this, this.onMouseDownShow);
            BC.addEvent(this, this.btn, Laya.Event.MOUSE_UP, this, this.onMouseUpShow);
            // BC.addEvent(this, this.img, Laya.Event.LOADED, this, this.onImgPos);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        dispose(): void {
            this._parms = null;
            this.removeEventListeners();
            this.removeSelf();
        }
    }
}