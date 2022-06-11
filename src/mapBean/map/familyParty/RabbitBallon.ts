namespace familyParty {
    export class RabbitBalloon extends Laya.Sprite {
        public clickArea:Laya.Sprite;
        private _rabbitBalloonMovie:clientCore.Bone;
        /**
         * 正弦运动，根据y=Asin(Bx+C)+D公式来算
         * 振幅 A： 控制曲线的高度
         * 周期 (2π/B): 控制宽度
         * 相移 (-C/B): 控制水平移动
         * 垂直位移 D: 控制垂直移动
         * 这里假设正弦运动对于y轴没有便宜 D为0
         */
        private _A:number = 100;
        private _B:number = 0.02;
        private _C:number = Math.PI;

        private _moveWidth:number = Math.PI*2/this._B * 12;
        private _totalStep:number = 3000;
        private _stepCount:number = 1000;
        private _moveDir:number = 1;//1 往右  2 往左

        private _startX:number = 150;
        private _startY:number = 500;

        private _stopFlag:boolean = false;
        constructor(){
            super();
            this.init();
        }
        init(){
            this._rabbitBalloonMovie = clientCore.BoneMgr.ins.play("res/animate/familyParty/BalloonRabbit.sk", "1", true,this, null,false);
            
            this.clickArea = new Laya.Sprite();
            this.clickArea.width = 120;
            this.clickArea.height = 400;
            this.clickArea.x = -60;
            this.clickArea.y = -200-50;
            this.clickArea.graphics.clear();
            this.clickArea.graphics.drawRect(0, 0, this.clickArea.width, this.clickArea.height, "#000000");
            this.clickArea.alpha = 0;
            this.addChild(this.clickArea);

            clientCore.MapManager.mapItemsLayer.addChild(this);
            this.x = this._startX;
            this.y = this._startY;

            Laya.timer.frameLoop(1,this,this.updateRabbitBalloonPos);
        }
        updateRabbitBalloonPos(){
            if(this._stopFlag){
                return;
            }
            if(this._moveDir == 1){
                this._stepCount++;
                let disX = this._moveWidth/this._totalStep*this._stepCount;
                this.x = this._startX + disX;;
                this.y = this._startY +this._A * Math.sin(this._B*disX);
                if(this._stepCount == this._totalStep){
                    this._moveDir = 2;
                }
            }
            else{
                this._stepCount--;
                let disX = this._moveWidth/this._totalStep*this._stepCount;
                this.x = this._startX + disX;;
                this.y = this._startY + this._A * Math.sin(this._B*disX - Math.PI);
                if(this._stepCount == 0){
                    this._moveDir = 1;
                }
            }
        }
        public async playBombMovie(){
            this._stopFlag = true;
            return new Promise((ok)=>{
                this._rabbitBalloonMovie.play("2",false,new Laya.Handler(this,()=>{
                    this.visible = false;
                    ok();
                }))
            })
           
        }
        public showRabbit(){
            if(this._stopFlag){
                this._stopFlag = false;
                this.visible = true;
                this.clickArea.visible = true;
                this._rabbitBalloonMovie.play("1",true);
            }
        }
        public hideRabbit(){
            this._stopFlag = true;
            this.visible = false;
        }
        destroy(){
            super.destroy();
            Laya.timer.clear(this,this.updateRabbitBalloonPos);
            this._rabbitBalloonMovie?.dispose();
        }
    }
}
