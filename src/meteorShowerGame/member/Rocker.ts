namespace meteorShowerGame{

    enum SPEED_TYPE{
        NORMAL,
        FAST
    }

    /**
     * 摇杆
     */
    export class Rocker{

        private _joyView: ui.main.JoyStickUI;
        private _joy: util.JoyStick;
        private _caller: Laya.Sprite;
        private _player: Laya.Box;
        private _camera: Camera;
        private _forbidden: boolean;
        private _type: number;

        constructor(){}

        configure(caller: Laya.Sprite): void{
            this._caller = caller;
            this._joyView = new ui.main.JoyStickUI();
            this._joyView.name = "JoyStickUI";
            this._joy = new util.JoyStick(new Laya.Point(0, 0), this._joyView, clientCore.LayerManager.upMainLayer);
            this._joy.on(Laya.Event.START, this, this.onJoyStart);
            this._joy.on(Laya.Event.END, this, this.onJoyEnd);
            this._joy.visible = false;
            this.addEvents();
        }

        set forbidden(b: boolean){
            this._forbidden = b;
        }

        set player(value: Laya.Box){
            this._player = value;
        }

        set camera(value: Camera){
            this._camera = value;
        }

        get maxDis(): number{
            return this._joy.maxDis;
        }

        private addEvents(): void{
            BC.addEvent(this,this._caller,Laya.Event.MOUSE_DOWN,this,this.onMouseDown);
        }

        private onJoyStart(): void{
            this._joy.on(Laya.Event.CHANGE, this, this.onJoyChange);
        }

        private onJoyChange(): void{
            if(this._forbidden)return;
            let angle: number =this._joy.angle + 90;
            let dirction: number = angle >= -90 && angle < 90 ? 1 : -1;
            // angle = dirction == -1 ? angle - 180 : angle;
            this._player.rotation = angle;
            // this._player.scaleX = dirction;
            let speed: util.Vector2D = new util.Vector2D(Math.cos(this._joy.radians),Math.sin(this._joy.radians));
            let dis: number= Math.min(this._joy.dis,this._joy.maxDis);
            this._camera.speed = speed.normalize().multiply(dis/5);
            dis == this._joy.maxDis ? this.enterFast() : this.enterNormal();
        }

        private enterFast(): void{
            if(this._type == SPEED_TYPE.FAST)return;
            this._type = SPEED_TYPE.FAST;
            this.changePlayerAni(2);
            // Laya.timer.loop(3000,this,this.changePlayerAni,[2]);
        }

        private enterNormal(): void{
            if(this._type == SPEED_TYPE.NORMAL)return;
            Laya.timer.clear(this,this.changePlayerAni);
            this._type = SPEED_TYPE.NORMAL;
            this.changePlayerAni(1);
        }

        private changePlayerAni(type: number): void{
            let player: Player = this._player.getComponent(Player);
            player.playAni(type);
        }


        private onJoyEnd(): void{
            this.enterNormal();
            this._camera.speed = new util.Vector2D(0,0);
            this._joy.visible = false;
        }

        private onMouseDown(e: Laya.Event): void{
            if(this._forbidden)return;
            this._joy.visible = true;
            this._joy.pos(e.stageX,e.stageY);
            this._joy.select();
        }

        dispose(): void{
            BC.removeEvent(this);
            // Laya.timer.clear(this,this.changePlayerAni);
            this._joy.destroy();
            this._joyView.destroy();
            this._caller = this._player = this._joy = this._joyView = this._caller = null;
        }
    }
}