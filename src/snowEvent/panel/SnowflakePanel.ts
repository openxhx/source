namespace snowEvent {
    /**
     * 旋转雪花事件
     */
    export class SnowflakePanel extends ui.snowEvent.SnowflakePanelUI implements ISnowEventPanel {
        private _gameOver: boolean = false;
        private _isOnRotate: boolean = false;   //是否处于旋转状态
        private _startRotation: number;         //雪花图标初始角度
        private _startPos: Laya.Point;          //雪花图标初始按下位置

        public sweepHanlder: Laya.Handler;

        constructor() {
            super();
        }

        public init(d: pb.Isnow_panel): void {
            if (d.res == 0) {
                this.showGame();
            }
        }

        /**游戏状态 */
        private showGame(): void {
            this.imgSnow.rotation = _.random(60, 300);
        }

        /**在舞台中按下手指 */
        private onMouseDown(e: Laya.Event): void {
            if (this._gameOver) {
                return;
            }
            this._startRotation = this.imgSnow.rotation;
            this._startPos = new Laya.Point(e.stageX, e.stageY);
            this._isOnRotate = true;
        }

        /**在舞台中移动手指 */
        private onMouseMove(e: Laya.Event): void {
            if (this._gameOver) {
                return;
            }
            if (this._isOnRotate) {
                let pos1 = this.imgSnow.localToGlobal(new Laya.Point(this.imgSnow.width / 2, this.imgSnow.height / 2));
                let angle = Math.atan2(e.stageY - pos1.y, e.stageX - pos1.x) * 180 / Math.PI;
                let angle2 = Math.atan2(this._startPos.y - pos1.y, this._startPos.x - pos1.x) * 180 / Math.PI;
                let rotationValue = angle - angle2;
                this.imgSnow.rotation = ((this._startRotation + rotationValue) % 360 + 360) % 360;
            }
        }

        /**在舞台中释放手指 */
        private onMouseUp(e: Laya.Event): void {
            if (this._gameOver) {
                return;
            }
            this._isOnRotate = false;
            if (this.imgSnow.rotation < 10 || this.imgSnow.rotation > 350) {
                this._gameOver = true;
                this.sweepHanlder?.run();
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.imgSnow, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            BC.addEvent(this, this.stage, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.addEvent(this, this.stage, Laya.Event.MOUSE_UP, this, this.onMouseUp);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}