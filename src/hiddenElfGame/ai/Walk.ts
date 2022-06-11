namespace hiddenElfGame {

    export class Walk {

        private readonly SPEED: number = 0.3;

        private _startX: number;
        private _startY: number;
        private _startT: number;
        private _angle: number;
        private _expectT: number;
        private _owner: Laya.Sprite;
        private _target: Laya.Point;
        private _end: Laya.Handler;

        constructor(owner: Laya.Sprite) { this._owner = owner; }

        start(target: number[], end: Laya.Handler): void {
            this._end = end;
            this._startX = this._owner.x;
            this._startY = this._owner.y;
            this._startT = Laya.Browser.now();
            this._angle = Math.atan2(target[1] - this._startY, target[0] - this._startX);
            this._target = new Laya.Point(target[0], target[1]);;

            let dis: number = this._target.distance(this._startX, this._startY);
            this._expectT = dis / this.SPEED;

            Laya.timer.frameLoop(1, this, this.onFrame);
        }

        private onFrame(): void {
            let passT: number = Laya.Browser.now() - this._startT;
            if (passT >= this._expectT) {
                this._owner.x = this._target.x;
                this._owner.y = this._target.y;
                this.clear();
                this._end?.run();
            } else {
                this._owner.x = Math.cos(this._angle) * this.SPEED * passT + this._startX;
                this._owner.y = Math.sin(this._angle) * this.SPEED * passT + this._startY;
            }
        }

        clear(): void {
            Laya.timer.clear(this, this.onFrame);
            this._target?.recover();
            this._target = null;
        }

        dispose(): void {
            this.clear();
            this._end = this._owner = null;
        }
    }
}