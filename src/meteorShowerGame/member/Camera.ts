namespace meteorShowerGame {
    enum LOOK_TYPE {
        NONE,
        /** 对象*/
        OBJECT,
        /** 点*/
        POSITION
    }
    /**
     * 相机
     */
    export class Camera {
        /** 相机绑定者（对象）*/
        private _binder: Laya.Sprite;
        /** 相机绑定者（点）*/
        private _position: Laya.Point;
        /** 可视范围*/
        private _rect: Laya.Rectangle;
        /** 绑定类型*/
        private _type: LOOK_TYPE;
        /** 相机移动速度*/
        private _speed: util.Vector2D;
        /** 地图*/
        private _map: Laya.Sprite;
        private _x: number;
        private _y: number;
        private _bgLayer: Laya.Sprite;
        private _cSpeed: number;
        private _fps: number = 100/6;

        constructor() { }

        init(map: Laya.Sprite, bgLayer: Laya.Sprite): void {
            this._bgLayer = bgLayer;
            this._map = map;
            this._type = LOOK_TYPE.NONE;
            this._rect = new Laya.Rectangle(0, 0, Laya.stage.width, Laya.stage.height);
            this._speed = new util.Vector2D(0, 0);
            Laya.timer.frameLoop(1, this, this.update);
        }

        update(): void {
            this.updateCamera();
            if (this._speed.isZero()) return;
            this._map.x -= this._speed.x * Laya.timer.delta / this._fps;
            this._map.y -= this._speed.y * Laya.timer.delta / this._fps;
            this._x = this._map.x + Laya.stage.width / 2;
            this._y = this._map.y + Laya.stage.height / 2;
        }

        private updateCamera(): void {
            let offx: number = clientCore.LayerManager.OFFSET;
            if (Laya.stage.width - this._bgLayer.x + offx > this._bgLayer.width - 5) this._cSpeed = 0.3;
            if (this._bgLayer.x >= -offx) this._cSpeed = -0.3;
            this._bgLayer.x += this._cSpeed;
            // this._bgLayer.y += 0.25;
        }

        updateBg(timePer: number) {
            timePer = Math.min(timePer,1)
            this._bgLayer.y = timePer * (2250 - 750) + 750;
        }

        lookObj(object: Laya.Sprite): void {
            this.unlook();
            this._binder = object;
            this._type = LOOK_TYPE.OBJECT;
        }
        lookPos(point: Laya.Point): void {
            this.unlook();
            this._position = point;
            this._type = LOOK_TYPE.POSITION;
        }
        unlook(): void {
            this._position = null;
            this._binder = null;
            this._type = LOOK_TYPE.NONE;
        }
        dispose(): void {
            this.unlook();
            Laya.timer.clear(this, this.update);
        }

        set speed(value: util.Vector2D) {
            this._speed = null;
            this._speed = value;
        }

        get speed(): util.Vector2D {
            return this._speed;
        }
    }
}