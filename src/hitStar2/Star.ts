namespace hitStar2 {


    interface IStarParams {
        x: number;
        y: number;
        type: number; //1-红 2-绿 3-黄
        ex: number; //偏移角度
        speed: number; //速度
    }

    /**
     * 星星的一生
     */
    export class Star extends Laya.Image {

        private _params: IStarParams;
        private _startT: number;
        private _z: number; //z轴坐标
        private _angle: number;

        constructor() {
            super();
            this.anchorX = this._anchorY = 0.5;
        }

        configure(params: IStarParams): void {
            this._startT = Laya.Browser.now();
            this._params = params;
            this._angle = (750 - params.y) / (params.ex - params.x);

            this.z = 0;
            this.pos(params.x, params.y);
            this.skin = `hitStar2/${['hong_se', 'huang_se', 'lan_se'][params.type - 1]}.png`;

            this.on(Laya.Event.CLICK, this, this.onClick);
        }

        update(currT: number): void {
            let passT: number = (currT - this._startT) / 1000;
            this.y = this._params.y + this._params.speed * passT;
            this.z = _.clamp(passT * this._params.speed * 100 / (800 - this._params.y), 0, 100);
            this.x = this._params.x + this._params.speed * passT / this._angle;

            if (this.y > 750) {
                this.dispose();
                this._params.type == 2 && EventManager.event(Config.YELLOW_STAR_OUT);
            }
        }

        dispose(): void {
            this.offAll();
            this.removeSelf();
            Laya.Pool.recover('hitStar2.Star', this);
        }

        set z(v: number) {
            if (v == this._z) return;
            let s: number = v / 100;
            this.scaleX = this.scaleY = s;
            this._z = v;
        }

        get z(): number {
            return this._z;
        }

        private onClick(): void {
            if (this.y <= 440 - this.scaleX * 219) return;
            this.dispose();
            EventManager.event(Config.HIT_STAR, this._params.type);
        }
    }
}