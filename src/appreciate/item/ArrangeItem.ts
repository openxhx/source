namespace appreciate {
    interface IItemParams {
        type: string;
        scaleMin: number;
        scaleMax: number;
        hasAni: boolean;
        aniPos: xls.pair;
        side:number
    }

    export class ArrangeItem extends ui.appreciate.render.ArrangeItemUI {
        private _scaleNum: number = 1;
        private _deformation: number = 1;

        private _parms: IItemParams;
        private _ani: clientCore.Bone;
        constructor() {
            super();

            this.addEventListeners();
        }

        public init(data: IItemParams): void {
            this._parms = data;
        }

        public update(id: number): void {
            this.img.skin = clientCore.ItemsInfo.getItemUIUrl(id);
            if (this._parms.hasAni) {
                this._ani = clientCore.BoneMgr.ins.play(`res/animate/collocation/${id}.sk`, 0, true, this.spMc);
                // this._ani.pos(this._parms.aniPos.v1, this._parms.aniPos.v2);
                this._ani.pos(0, 0);
            }
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
            this._ani?.dispose();
            this._ani = null;
        }

        private onShow(): void {
            if (this._parms.type == ITEM_NAME.ZHUANGSHI && this._parms.side == 1) {
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
            return { width: this.spMc.displayWidth, height: this.spMc.displayHeight };
        }

        public get offsetData() {
            return { x: 0, y: 0 };
        }

        addEventListeners() {
            BC.addEvent(this, this.img, Laya.Event.MOUSE_DOWN, this, this.onMouseDownShow);
            BC.addEvent(this, this.img, Laya.Event.MOUSE_UP, this, this.onMouseUpShow);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        dispose(): void {
            this._ani?.dispose();
            this._ani = null;
            this._parms = null;
            this.removeEventListeners();
            this.removeSelf();
        }
    }
}