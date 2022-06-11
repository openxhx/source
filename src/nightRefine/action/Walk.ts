namespace nightRefine {

    export class Walk {
        private readonly SPEED: number = 0.15;
        private _startX: number;
        private _startY: number;
        private _startT: number;
        private _angle: number;
        private _expectT: number;
        private _owner: clientCore.Bone;
        private _target: Laya.Point;
        private _end: Laya.Handler;

        private _up: Laya.Sprite;
        private _down: Laya.Sprite;
        private _rect: Laya.Rectangle;

        constructor(owner: clientCore.Bone, up: Laya.Sprite, down: Laya.Sprite) {
            this._up = up;
            this._down = down; 
            this._owner = owner;
            this._rect = new Laya.Rectangle(0,0,834,369);
        }

        start(target: number[], end: Laya.Handler): void {
            //重置
            this.clear();
            this._end?.recover();
            this._end = null;
            //赋值
            this._end = end;
            this._startX = this._owner.x;
            this._startY = this._owner.y;
            this._startT = Laya.Browser.now();
            this._angle = Math.atan2(target[1] - this._startY, target[0] - this._startX);
            this._target = new Laya.Point(target[0], target[1]);;

            let dis: number = this._target.distance(this._startX, this._startY);
            this._expectT = dis / this.SPEED;

            let radio: number = this._angle * 180 / Math.PI;
            this._owner.scaleX = radio > -90 && radio <= 90 ? 1 : -1;

            Laya.timer.frameLoop(1, this, this.onFrame);
        }

        private onFrame(): void {
            let passT: number = Laya.Browser.now() - this._startT;
            let out: boolean = this.chekcOut();
            if (passT >= this._expectT || out) {
                if(!out){
                    this._owner.x = this._target.x;
                    this._owner.y = this._target.y;
                }else{
                    this._owner.x = _.clamp(this._owner.x, 1, 833);
                    this._owner.y = _.clamp(this._owner.y, 1, 368);
                }
                this.clear();
                this._end?.run();
            } else {
                this._owner.x = Math.cos(this._angle) * this.SPEED * passT + this._startX;
                this._owner.y = Math.sin(this._angle) * this.SPEED * passT + this._startY;
            }
            //层级变化
            this._owner.addTo(this._owner.y > 314 ? this._up : this._down);
        }

        private clear(): void {
            Laya.timer.clear(this, this.onFrame);
            this._target?.recover();
            this._target = null;
        }

        private chekcOut(): boolean{
            return !this._rect.contains(this._owner.x, this._owner.y);
        }

        dispose(): void {
            this._rect.recover();
            this._rect = null;
            this._up = this._down = null;
            this.clear();
            this._end = this._owner = null;
        }
    }
}