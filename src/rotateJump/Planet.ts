namespace rotateJump {
    export class Planet extends GameObject {
        public isCache: boolean = false;
        private mIndex: number = 1;
        private mRadius: number = 0;
        private mRotateSpeed: number = GameDataConfig.PLANET_ROTATE_SPEED;
        private mType: PlanetType = 0;
        private mMoveSpeed: number = GameDataConfig.PLANET_MOVE_SPEED;

        private mIsPlayerStand: boolean = false;
        private mPlayerRotateAngle: number = 0;
        private mDef: PlanetDef;

        constructor(isCreateDisplayObj: boolean = false) {
            super(isCreateDisplayObj);
        }


        private resetTexture(): void {

            this.displayObject.loadImage("rotateJump/planet_" + Math.floor((Math.random() * 4)) + ".png");
            this.displayObject.pivot(this.displayObject.width / 2, this.displayObject.height / 2);
        }


        public reset(index: number): void {
            this.resetTexture();
            this.mIndex = index;
            this.mDef = GameDataConfig.getPlanetDef(this.mIndex % 99 + 1);
            this.mRadius = Math.random() * (this.mDef.radiusMax - this.mDef.radiusMin) + this.mDef.radiusMin;
            let scale = this.mRadius / GameDataConfig.PLANET_DEFAULT_RADIUS;
            this.displayObject.scale(scale, scale);
            //this.displayObject.graphics.drawCircle(this.displayObject.width/2, this.displayObject.width/2, this.mRadius, '#ffffff');
            // let remainder:number = this.mIndex % GameDataConfig.PLANET_BOSS_INDEX;
            // let round:number = Math.floor(this.mIndex / GameDataConfig.PLANET_BOSS_INDEX);

            // this.mRotateSpeed = GameDataConfig.PLANET_ROTATE_SPEED;
            // this.mRotateSpeed = this.mRotateSpeed + remainder * GameDataConfig.PLANET_ROTATE_RATIO * this.mRotateSpeed + round * GameDataConfig.PLANET_REGRESSION_RATIO * this.mRotateSpeed;
            let randomNum: number = Math.random();
            this.mRotateSpeed = 360 / (randomNum * (this.mDef.rotateSpeedMax - this.mDef.rotateSpeedMin) + this.mDef.rotateSpeedMin);
            this.mRotateSpeed = randomNum > 0.5 ? this.mRotateSpeed : -this.mRotateSpeed;

            //if(index != 0 && (index % GameDataConfig.PLANET_BOSS_INDEX == 0))

            this.mType = this.mDef.type;
            this.mMoveSpeed = Math.random() > 0.5 ? GameDataConfig.PLANET_MOVE_SPEED : -GameDataConfig.PLANET_MOVE_SPEED;
        }

        public update(): void {
            let rotateValue: number = Laya.timer.delta / 1000 * this.mRotateSpeed;
            this.displayObject.rotation += rotateValue;
            if (this.mIsPlayerStand) {
                this.mPlayerRotateAngle += rotateValue;
            }

            if (this.mType == PlanetType.Horizontal) {
                let xPos: number = this.pos.x;
                xPos += Laya.timer.delta * this.mMoveSpeed;
                this.setPos(xPos, this.pos.y);
                if (this.mMoveSpeed > 0 && xPos >= Laya.stage.height - this.radius - GameDataConfig.PLAYER_RADIUS) {
                    this.mMoveSpeed *= -1;
                }
                if (this.mMoveSpeed < 0 && xPos <= this.radius + GameDataConfig.PLAYER_RADIUS) {
                    this.mMoveSpeed *= -1;
                }
            }
        }

        public get def(): PlanetDef {
            return this.mDef;
        }

        public playerStandOn(): void {
            this.mIsPlayerStand = true;
            this.mPlayerRotateAngle = 0;
        }

        public playerLeave(): void {
            this.mIsPlayerStand = false;
        }

        public playerStayWithin360(): boolean {
            //console.log("player stay angle: " + this.mPlayerRotateAngle);
            return Math.abs(this.mPlayerRotateAngle) <= 360;
        }

        public get radius(): number {
            return this.mRadius;
        }

        public get index(): number {
            return this.mIndex;
        }

        public get type(): number {
            return this.mType;
        }
    }
}