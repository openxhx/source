namespace hiddenElfGame{
    /**
     * 摇杆
     */
    export class Rocker{

        private _joyView: ui.main.JoyStickUI;
        private _joy: util.JoyStick;
        private _forbidden: boolean;
        private _glass: Glass;
        private _speed: util.Vector2D;

        constructor(){
            this._speed = new util.Vector2D();
        }

        configure(glass: Glass): void{
            this._glass = glass;
            this._joyView = new ui.main.JoyStickUI();
            this._joyView.name = "JoyStickUI";
            this._joy = new util.JoyStick(new Laya.Point(100, 400), this._joyView, clientCore.LayerManager.upMainLayer);
            this._joy.on(Laya.Event.START, this, this.onJoyStart);
            this._joy.on(Laya.Event.END, this, this.onJoyEnd);
        }

        set forbidden(b: boolean){
            this._forbidden = b;
        }

        get maxDis(): number{
            return this._joy.maxDis;
        }

        private onJoyStart(): void{
            this._joy.on(Laya.Event.CHANGE, this, this.onJoyChange);
            Laya.timer.frameLoop(1,this,this.update);
        }

        private onJoyChange(diff: {x: number,y: number}): void{
            if(this._forbidden)return;
            let force: util.Vector2D = new util.Vector2D(diff.x, diff.y);
            let distance: number = Math.min(this._joy.dis,this._joy.maxDis);
            this._speed = force.normalize().multiply(distance/10);
        }

        private onJoyEnd(): void{
            this._joy?.off(Laya.Event.CHANGE, this, this.onJoyChange);
            Laya.timer.clear(this,this.update);
        }

        public update(): void{
            this._glass.x = _.clamp(this._glass.x + this._speed.x,0,Laya.stage.width - 146 * this._glass.scale);
            this._glass.y = _.clamp(this._glass.y + this._speed.y,0,Laya.stage.height - 137 * this._glass.scale - 150);
        }

        dispose(): void{
            this.onJoyEnd();
            this._joy.destroy();
            this._joyView.destroy();
            this._joy = this._joyView = this._glass = null;
        }
    }
}