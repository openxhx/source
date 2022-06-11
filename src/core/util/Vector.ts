namespace util {
    export class Vector2D {
        private _x: number;
        private _y: number;
        constructor(x: number = 0, y: number = 0) {
            this._x = x;
            this._y = y;
        }
        public clone(): Vector2D {
            return new Vector2D(this._x, this._y);
        }
        public zero(): Vector2D {
            this._x = 0;
            this._y = 0;
            return this;
        }
        public isZero(): boolean {
            return this._x == 0 && this._y == 0;
        }
        public set length(value: number) {
            var a: number = this.angle;
            this._x = Math.cos(a) * value;
            this._y = Math.sin(a) * value;
        }
        public get length(): number {
            return Math.sqrt(this.lengthSQ);
        }
        public get lengthSQ(): number {
            return this._x * this._x + this._y * this._y;
        }
        public set angle(value: number) {
            var len: number = this.length;
            this._x = Math.cos(value) * len;
            this._y = Math.sin(value) * len;
        }
        public get angle(): number {
            return Math.atan2(this._y, this._x);
        }

        public normalize(): Vector2D {
            if (this.length == 0) {
                this._x = 1;
                return this;
            }
            var len: number = this.length;
            this._x /= len;
            this._y /= len;
            return this;
        }
        public truncate(max: number): Vector2D {
            this.length = Math.min(max, this.length);
            return this;
        }
        public min(min: number): Vector2D {
            this.length = Math.max(min, this.length);
            return this;
        }
        public reverse(): Vector2D {
            this._x = -this._x;
            this._y = -this._y;
            return this;
        }
        public isNormalized(): boolean {
            return this.length == 1;
        }
        //点乘
        public dotProd(v2: Vector2D): number {
            return this._x * v2.x + this._y * v2._y;
        }
        //获取两个向量之间的角度
        public static angleBetween(v1: Vector2D, v2: Vector2D): number {
            if (!v1.isNormalized())
                v1 = v1.clone().normalize();
            if (!v2.isNormalized())
                v2 = v2.clone().normalize();
            return Math.cos(v1.dotProd(v2));
        }
        //判断给定的向量在这个向量的左边还是右边，左边-1，右边1
        public sign(v2: Vector2D): number {
            return this.perp.dotProd(v2) < 0 ? -1 : 1;
        }
        public get perp(): Vector2D {
            return new Vector2D(-this._y, this._x);
        }
        //计算两个向量的距离
        public dist(v2: Vector2D): number {
            return Math.sqrt(this.distSQ(v2));
        }
        public distSQ(v2: Vector2D): number {
            var dx: number = v2.x - this._x;
            var dy: number = v2.y - this._y;
            return dx * dx + dy * dy;
        }
        //向量相加
        public add(v2: Vector2D): Vector2D {
            return new Vector2D(this._x + v2.x, this._y + v2.y);
        }
        //向量相减
        public subtract(v2: Vector2D): Vector2D {
            return new Vector2D(this._x - v2.x, this._y - v2.y);
        }
        /**
         * multiply
         */
        public multiply(value: number): Vector2D {
            return new Vector2D(this._x * value, this._y * value);
        }
        public divide(value: number): Vector2D {
            return new Vector2D(this._x / value, this._y / value);
        }
        public equals(v2: Vector2D): boolean {
            return this._x == v2.x && this._y == v2.y;
        }
        public set x(value: number) {
            this._x = value;
        }
        public get x(): number {
            return this._x;
        }
        /**
         * set y
         */
        public set y(value) {
            this._y = value;
        }
        public get y(): number {
            return this._y;
        }
        public toString(): String {
            return "[Vector2D (x: " + this._x + " ,y: " + this._y + ")]";
        }
    }
}