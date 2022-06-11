namespace playground {
    /**
     * 跳跃
     */
    export class Jump implements IMove {

        private _unit: Unit;
        private _movement: Movement;
        private _totalTime: number;
        private _stepX: number;
        private _stepY: number;
        private _jumpAngle: number;
        private _startX: number;
        private _startY: number;
        private _max: number; //最大跳跃高度
        private _complete: Laya.Handler;
        private _target: Laya.Point;

        constructor() { }

        /**
         * 
         * @param unit 
         * @param param 
         * @param movement 
         */
        start(unit: Unit, param: { time: number, max: number, target: Laya.Point }, movement: Movement, complete?: Laya.Handler): void {
            this._complete = complete;
            this._unit = unit;
            this._movement = movement;
            this._totalTime = param.time;
            this._max = param.max;
            this._target = param.target;
            this._jumpAngle = Math.PI / this._totalTime;
            this._startX = unit.x;
            this._startY = unit.y;

            this.moveToPointWithTime(param.target, this._totalTime);
            this._unit?.action(ACTION.JUMP);
        }

        update(passTime: number): void {
            if (this._totalTime < passTime) { //到时间了
                this._unit.z = 0;
                this._unit.x = this._target.x;
                this._unit.y = this._target.y;
                this._unit.action(ACTION.IDLE);
                this._complete?.run();
                this._complete = null;
                this._movement?.end();
                return;
            }
            let angle: number = this._jumpAngle * passTime;
            angle = angle > Math.PI / 2 ? Math.PI - angle : angle;
            this._unit.z = -Math.sin(angle) * this._max;
            this._unit.x = this._startX + this._stepX * passTime;
            this._unit.y = this._startY + this._stepY * passTime;
        }

        /**
         * 匀速移动到某点
         * @param target 目标点
         * @param time 时间
         */
        private moveToPointWithTime(target: Laya.Point, time: number): void {
            let angle: number = Math.atan2(target.y - this._unit.y, target.x - this._unit.x);
            let angle2: number = angle * 180 / Math.PI;
            let distance: number = target.distance(this._unit.x, this._unit.y);
            this._stepX = distance * Math.cos(angle) / time;
            this._stepY = distance * Math.sin(angle) / time;
            this._unit?.direction(angle2 <= 90 && angle2 > -90 ? DIRECTION.RIGHT : DIRECTION.LEFT);
        }

        dispose(): void {
            this._complete = this._target = this._unit = this._movement = null;
        }
    }
}