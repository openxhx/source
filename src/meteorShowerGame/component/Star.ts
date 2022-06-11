namespace meteorShowerGame{
    /**
     * 星星组件
     */
    export class Star extends Laya.Script{
        private _bone: clientCore.Bone;
    
        private _camera: Camera;
        private _player: Laya.Sprite;
        private _trigger: boolean;
        private _type: number;
        private _speed: util.Vector2D;
        private _max: number;
        private _status: number;
        private _fps: number = Math.min(Laya.timer.delta * 6 / 100,1);

        init(type: number,player: Laya.Sprite,camera: Camera,max: number,dir: number): void{
            this._trigger = false;
            this._type = type;
            this._player = player;
            this._status = Status.NEAR;
            this._speed = new util.Vector2D(dir,1);
            this._speed.length = 5;
            this._camera = camera;
            this._max = max;
            this.creBone(dir);
        }

        onUpdate(): void{
            if(this._trigger)return;
            this.handleAI();
            let owner: Laya.Sprite = this.owner as Laya.Sprite;
            let other: Laya.Rectangle = Laya.Rectangle.create();
            other.setTo(Laya.stage.width/2-102,Laya.stage.height/2-83,204,166);
            let my: Laya.Rectangle = Laya.Rectangle.create();
            let x: number = owner.x+owner.parent['x']+clientCore.LayerManager.OFFSET;
            let y: number = owner.y+owner.parent['y'];
            my.setTo(x,y,owner.width,owner.height);
            let intersects: boolean = my.intersects(other);
            if(intersects || y > Laya.stage.height){
                this._trigger = true;
                this.owner?.destroy();
                (this._type == 4 || this._type == 5) && EventManager.event(Constant.STAR_DIED,this._type);
                intersects && EventManager.event(Constant.TRIGGER_STAR,[this._type,x,y]);
            }
            if(!this._trigger && (this._type == 4 || this._type == 5)){
                if(y < -100 || x < -100 || x > Laya.stage.width + 100){
                    this._trigger = true;
                    this.owner?.destroy();
                    EventManager.event(Constant.STAR_DIED,this._type);
                }
            }
            other.recover();
            my.recover();
        }

        onDisable(): void{
            this._bone?.dispose();
            this._bone = null;
            this._player = this._camera = this._speed = null;
        }

        private handleAI(): void{
            if(this._type < 4)return;
            let fps: number = 100/6;
            let owner: Laya.Sprite = this.owner as Laya.Sprite;
            let x: number = owner.x+owner.parent['x']+clientCore.LayerManager.OFFSET;
            let y: number = owner.y+owner.parent['y'];
            let dis: number = Math.sqrt(Math.pow(this._player.x-x,2)+Math.pow(this._player.y-y,2));
            dis > 300 && this._status == Status.NEAR ? this.near() : this.leave();
        }

        private creBone(dir: number): void{
            if(this._type < 4)return;
            this._bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate('fly'),'star'+(6-this._type),true,this.owner as Laya.Sprite);
            this._bone.pos(this.owner['width']/2,0);
            this._bone.rotation = dir == 1 ? -45 : 45;
        }

        private near(): void{
            this._status = Status.NEAR;
            this.owner['x'] += (this._speed.x + this._camera.speed.x)*this._fps;
            this.owner['y'] += (this._speed.y + this._camera.speed.y)*this._fps;
        }

        private leave(): void{
            let cspeed: util.Vector2D = this._camera.speed; 
            if(this._status == Status.NEAR){
                this._status = Status.LEAVE;
                let x: number = this.owner['x']+this.owner.parent['x']+clientCore.LayerManager.OFFSET;
                let y: number = this.owner['y']+this.owner.parent['y'];
                this._speed.angle = Math.atan2(y-this._player.y,x - this._player.x);
            }
            let value: number = cspeed.isZero() ? 2 : cspeed.length;
            this._speed.length = Math.min(Math.max(value,this._speed.length),19.5);
            this.owner['x'] += this._speed.x*this._fps;
            this.owner['y'] += this._speed.y*this._fps;
        }
    }

    enum Status{
        // 靠近
        NEAR,
        // 离开
        LEAVE
    }
}