namespace appreciate {
    export class OperationItem extends ui.appreciate.render.OperationItemUI {
        public deviationAngle: number = 0;      //旋转角度偏移量

        private _isOnRotate: boolean = false;   //是否处于旋转状态
        private _isOnZoom: boolean = false;     //是否处于缩放状态
        private _isOnZoom2: boolean = false;    //是否处于缩放状态--双指状态

        private lastDistance: number = 0;//上次记录的两个触模点之间距离

        private _mcUI: ArrangeItem;              //绑定ui

        constructor() {
            super();
        }

        public init(mcUI: any): void {
            this._isOnRotate = false;
            this._isOnZoom = false;
            this._isOnZoom2 = false;
            this._mcUI = mcUI;
            this.btnClose.visible = this._mcUI.parms.type != ITEM_NAME.ROLE;
            this.btnDefor.rotation = this.btnClose.rotation = this.btnRotate.rotation = this.btnZoom.rotation = -this._mcUI.rotation;
            this.updatePos();
            this._mcUI.addChild(this);
            this.removeEventListeners();
            this.addEventListeners();

            let rect = this._mcUI.offsetData;
            this.x = rect.x;
            this.y = rect.y;
        }

        public updatePos(): void {
            let rect = this._mcUI.getGetBounds();
            let spMcWidth = rect.width + 4;
            let spMcHeight = rect.height + 4;
            this.imgBg.width = spMcWidth + 10;
            this.imgBg.height = spMcHeight + 10;
            this.btnDefor.x = -spMcWidth / 2;
            this.btnDefor.y = -spMcHeight / 2;
            this.btnClose.x = spMcWidth / 2;
            this.btnClose.y = -spMcHeight / 2;
            this.btnRotate.x = spMcWidth / 2;
            this.btnRotate.y = spMcHeight / 2;
            this.btnZoom.x = -spMcWidth / 2;
            this.btnZoom.y = spMcHeight / 2;
        }

        public onClose(): void {
            let mc = this._mcUI;
            this.removeEventListeners();
            this.removeSelf();
            EventManager.event(AppreciateModule.ITEM_CLOSE, [mc, mc.parms]);
            this._mcUI = null;
        }

        /**点击翻转按钮 */
        public onDeformation(): void {
            this._mcUI.onDeformation();
        }

        /**点击旋转按钮 */
        private onMouseDownRotate(): void {
            this._isOnRotate = true;
        }

        /**点击缩放按钮 */
        private onMouseDownZoom(): void {
            this._isOnZoom = true;
        }

        /**在舞台中按下手指 */
        private onMouseDown(e: Laya.Event): void {
            if (!this.hitTestPoint(e.stageX, e.stageY)) {
                this.removeEventListeners();
                this.removeSelf();
                this._mcUI = null;
            } else {
                var touches: Array<any> = e.touches;
                if (touches) {
                    if (touches.length == 2) {
                        this._isOnZoom2 = true;
                        this.lastDistance = this.getDistance(touches);
                        return;
                    }
                }
            }
        }

        /**在舞台中移动手指 */
        private onMouseMove(e: Laya.Event): void {
            if (this._isOnRotate) {
                this.onRotate(e);
            }
            if (this._isOnZoom) {
                this.OnZoom(e);
                this.updatePos();
            }
            if (this._isOnZoom2) {
                this.OnZoom2(e);
                this.updatePos();
            }
        }

        /**在舞台中释放手指 */
        private onMouseUp(e: Laya.Event): void {
            this._isOnZoom = false;
            this._isOnRotate = false;

            if (this._isOnZoom2) {
                var touches: Array<any> = e.touches;
                if (!touches || touches.length < 2) {
                    this._isOnZoom2 = false;
                }
            }
        }

        /**旋转 */
        private onRotate(e: Laya.Event): void {
            let pos1 = this.localToGlobal(new Laya.Point(0, 0));
            let angle = Math.atan2(e.stageY - pos1.y, e.stageX - pos1.x) * 180 / Math.PI;
            let angle2 = Math.atan2(this.btnRotate.y, this.btnRotate.x) * 180 / Math.PI;
            let rotationValue = angle - angle2 + this.deviationAngle;
            this._mcUI.onRotate(rotationValue);
            this.btnDefor.rotation = this.btnClose.rotation = this.btnRotate.rotation = this.btnZoom.rotation = -rotationValue;
        }

        /**缩放 */
        private OnZoom(e: Laya.Event): void {
            let pos1 = this.localToGlobal(new Laya.Point(this.width / 2, this.height / 2));
            let pos2 = this.btnZoom.localToGlobal(new Laya.Point(this.btnZoom.width / 2, this.btnZoom.height / 2));

            let dx: number = e.stageX - pos1.x;
            let dy: number = e.stageY - pos1.y;
            let distance: number = Math.sqrt(dx * dx + dy * dy);

            let dx2: number = pos2.x - pos1.x;
            let dy2: number = pos2.y - pos1.y;
            let distance2: number = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            let scale = distance / distance2 * this._mcUI.scaleNum;
            this._mcUI.OnZoom(scale);
        }

        private OnZoom2(e: Laya.Event): void {
            var distance: number = this.getDistance(e.touches);

            //判断当前距离与上次距离变化，确定是放大还是缩小
            const factor: number = 0.01;
            let scale = this._mcUI.scaleNum + (distance - this.lastDistance) * factor;
            this._mcUI.OnZoom(scale);

            this.lastDistance = distance;
        }

        /**计算两个触摸点之间的距离*/
        private getDistance(points: Array<any>): number {
            var distance: number = 0;
            if (points && points.length == 2) {
                var dx: number = points[0].stageX - points[1].stageX;
                var dy: number = points[0].stageY - points[1].stageY;

                distance = Math.sqrt(dx * dx + dy * dy);
            }
            return distance;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnDefor, Laya.Event.CLICK, this, this.onDeformation);
            BC.addEvent(this, this.btnRotate, Laya.Event.MOUSE_DOWN, this, this.onMouseDownRotate);
            BC.addEvent(this, this.btnZoom, Laya.Event.MOUSE_DOWN, this, this.onMouseDownZoom);
            BC.addEvent(this, this.stage, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            BC.addEvent(this, this.stage, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.addEvent(this, this.stage, Laya.Event.MOUSE_UP, this, this.onMouseUp);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        dispose(): void {
            this._mcUI = null;
            this.removeEventListeners();
            this.removeSelf();
            super.destroy();
        }
    }
}