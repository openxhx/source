
namespace rotateJump {
    import Point = Laya.Point;
    import Event = Laya.Event;
    export class Player extends GameObject {
        private mIsJumping: boolean = false;
        private mSpeedVector: Point = new Point(0, -1);
        private mStandingPlanet: Planet;
        private mInitScaleX: number;
        private mInitScaleY: number;
        private mAnim: Laya.Sprite;
        private _bone: clientCore.Bone;
        private _nameOrIndex: number | string;

        constructor(type: string) {
            super(false);
            this.createAnimation(type);
        }

        public setDisplayObject(disObj: Laya.Sprite): void {
            super.setDisplayObject(disObj);
            this.Init();
        }

        private createAnimation(type: string): void {
            this.mAnim = new Laya.Sprite;
            let path: string;
            switch(type){
                case 'loveMagic':
                    this._nameOrIndex = 'animation';
                    path = pathConfig.getActivityAnimate('donutjump');
                    break;
                default:
                    this._nameOrIndex = 1;
                    path = 'res/animate/rotateJump/rabbit.sk';
                    break;
            }
            this._bone = clientCore.BoneMgr.ins.play(path, this._nameOrIndex, true, this.mAnim, null, false, true);
            this.mAnim.scale(0.6, 0.6);
            this.mAnim.rotation = 90;
            this.setDisplayObject(this.mAnim);
        }

        public reset(xValue: number, yValue: number): void {
            this.displayObject.rotation = 0;
            if (this.mStandingPlanet != null) {
                this.mStandingPlanet.playerLeave();
                this.mStandingPlanet = null;
            }
            this.setPos(xValue, yValue);
            // this.mAnim.gotoAndStop(0);
            this._bone.play(0, true);
            Laya.stage.on(Event.CLICK, this, this.onStageClick);
        }

        public die(): void {
            this.mIsJumping = false;
            if (this.mStandingPlanet != null) {
                this.mStandingPlanet.playerLeave();
                this.mStandingPlanet = null;
            }
            Laya.stage.off(Event.CLICK, this, this.onStageClick);
        }

        protected Init(): void {
            this.mInitScaleX = this.displayObject.scaleX;
            this.mInitScaleY = this.displayObject.scaleY;
            Laya.stage.on(Event.CLICK, this, this.onStageClick);
        }

        public update(): void {
            //console.log(this.pos, this.displayObject.globalRotation);
            if (!this.mIsJumping)
                return;
            let curPos = this.pos;
            curPos.x = this.mSpeedVector.x * Laya.timer.delta + this.pos.x;
            curPos.y = this.mSpeedVector.y * Laya.timer.delta + this.pos.y;
            this.pos = curPos;
            //console.log(this.mSpeedVector, this.pos);
            this.mSpeedVector.x += GameDataConfig.PLAYER_GRAVITY;
        }

        public get isJumping(): boolean {
            return this.mIsJumping;
        }

        public get standingPlanet(): Planet {
            return this.mStandingPlanet;
        }

        private onStageClick(evt: Event): void {
            //console.log("stage click...");
            if (evt.target instanceof HuaButton)
                return;
            if (this.mIsJumping)
                return;
            this.mIsJumping = true;
            if (this.mStandingPlanet == null) {
                this.mSpeedVector.setTo(0, -1);
            }
            else {
                this.setParent(this.mStandingPlanet.parent);
                this.displayObject.scale(this.mInitScaleX, this.mInitScaleY);
                this.mSpeedVector.setTo(this.pos.x - this.mStandingPlanet.pos.x, this.pos.y - this.mStandingPlanet.pos.y);
                this.mStandingPlanet.playerLeave();
            }
            this.mSpeedVector.normalize();
            this.mSpeedVector.setTo(this.mSpeedVector.x * GameDataConfig.PLAYER_JUMP_SPEED, this.mSpeedVector.y * GameDataConfig.PLAYER_JUMP_SPEED);
            // this.mAnim.play(0, false);
            this._bone.play(this._nameOrIndex, false, new Laya.Handler(this, this.jumpOver));
        }

        private jumpOver() {
            this._bone.play(0, true);
        }


        public collisionDetective(planet: Planet): boolean {

            let distanceSQ: number = (planet.pos.x - this.pos.x) * (planet.pos.x - this.pos.x) + (planet.pos.y - this.pos.y) * (planet.pos.y - this.pos.y);
            let isCollision = distanceSQ <= (GameDataConfig.PLAYER_RADIUS + planet.radius) * (GameDataConfig.PLAYER_RADIUS + planet.radius);
            return isCollision;
        }

        private mPosHelp: Point = new Point();
        public standOnPlanet(planet: Planet): void {
            let standDir: Point = new Point(this.pos.x - planet.pos.x, this.pos.y - planet.pos.y);
            let standRotation: number = Math.atan2(standDir.y, standDir.x) * 180 / Math.PI + 90;
            standDir.normalize();
            let standDis = planet.radius;
            let playerStandPos = this.mPosHelp.setTo(planet.pos.x + standDir.x * standDis, planet.pos.y + standDir.y * standDis);
            this.pos = playerStandPos;
            this.setParent(planet.displayObject);
            this.displayObject.rotation = standRotation - planet.displayObject.rotation;
            this.mStandingPlanet = planet;
            this.mIsJumping = false;
            this.displayObject.scale(this.mInitScaleX / planet.displayObject.scaleX, this.mInitScaleY / planet.displayObject.scaleY);
            // this.mAnim.gotoAndStop(0);
            this._bone.play(0, true);
            planet.playerStandOn();
        }
    }
}