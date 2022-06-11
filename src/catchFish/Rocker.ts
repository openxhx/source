namespace catchFish {
    /**
     * 摇杆
     */
    export class Rocker {

        private _joyView: ui.main.JoyStickUI;
        private _joy: util.JoyStick;
        private _forbidden: boolean;
        private _fishNet: FishNet;
        private _speed: util.Vector2D;
        private _baseSpeed: number;

        constructor() {
            this._speed = new util.Vector2D();
        }

        configure(net: FishNet, baseSpeed: number): void {
            this._fishNet = net;
            this._baseSpeed = baseSpeed;
            this._joyView = new ui.main.JoyStickUI();
            this._joyView.name = "JoyStickUI";
            this._joy = new util.JoyStick(new Laya.Point(100, 450), this._joyView, clientCore.LayerManager.upMainLayer);
            this._joy.on(Laya.Event.START, this, this.onJoyStart);
            this._joy.on(Laya.Event.END, this, this.onJoyEnd);
        }

        set forbidden(b: boolean) {
            this._forbidden = b;
        }

        get maxDis(): number {
            return this._joy.maxDis;
        }

        private onJoyStart(): void {
            this._joy.on(Laya.Event.CHANGE, this, this.onJoyChange);
            Laya.timer.loop(40, this, this.update);
        }

        private onJoyChange(diff: { x: number, y: number }): void {
            if (this._forbidden) return;
            let force: util.Vector2D = new util.Vector2D(diff.x, diff.y);
            if (diff.x == 0 && diff.y == 0) {
                this._speed.x = 0;
                this._speed.y = 0;
            } else {
                this._speed = force.normalize().multiply(2);
            }
        }

        private onJoyEnd(): void {
            this._joy?.off(Laya.Event.CHANGE, this, this.onJoyChange);
            Laya.timer.clear(this, this.update);
        }
        public netFlag: number;
        public update(): void {
            if (this.netFlag == 0) {
                this._fishNet.x = _.clamp(this._fishNet.x + this._speed.x * 12, 0, 1190);
                this._fishNet.y = _.clamp(this._fishNet.y + this._speed.y * 12, 0, 420);
            } else {
                this._fishNet.x = _.clamp(this._fishNet.x + this._speed.x * 12, 0, 1190);
                this._fishNet.y = _.clamp(this._fishNet.y + this._speed.y * 12, 0, 660);
            }
        }

        dispose(): void {
            this.onJoyEnd();
            this._joy.destroy();
            this._joyView.destroy();
            this._joy = this._joyView = this._fishNet = null;
        }
    }
}