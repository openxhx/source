namespace playground {

    export enum ACTION {
        IDLE = 'idle',
        JUMP = 'jump'
    }

    export enum DIRECTION {
        LEFT,
        RIGHT
    }

    /**
     * 地图单位
     */
    export class Unit {
        private _movement: Movement;
        private _x: number;
        private _y: number;
        private _z: number; //z轴 用来跳跃
        private _render: clientCore.Bone;
        private _direction: number;
        constructor(parent: Laya.Sprite) {
            this._movement = new Movement(this);
            this._render = clientCore.BoneMgr.ins.play(`res/animate/playground/${clientCore.LocalInfo.sex == 1 ? 'girl' : 'boy'}.sk`, ACTION.IDLE, true, parent, null, false, true);
        }

        public pos(x: number, y: number): void {
            this._x = x;
            this._y = y;
            this._render?.pos(x, y);
        }

        public jump(target: Laya.Point, complete: Laya.Handler): void {
            this._movement?.start(MoveType.JUMP, { time: 600, max: 100, target: target }, complete);
        }

        public dispose(): void {
            this._movement?.dispose();
            this._render?.dispose();
            this._movement = this._render = null;
        }

        public action(type: ACTION): void {
            // this._render.play(type, true);
        }

        public direction(type: DIRECTION): void {
            if (type == this._direction) return;
            this._direction = type;
            this._render.scaleX = type == DIRECTION.LEFT ? 1 : -1;
        }

        public get x(): number {
            return this._x;
        }
        public set x(value: number) {
            this._x = value;
            if (this._render) this._render.x = value;
        }

        public get y(): number {
            return this._y;
        }
        public set y(value: number) {
            this._y = value;
            if (this._render) this._render.y = value + this._z;
        }

        public get z(): number {
            return this._z;
        }

        public set z(value: number) {
            this._z = value;
            this.y = this._y;
        }
    }
}