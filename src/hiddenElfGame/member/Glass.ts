namespace hiddenElfGame{
    /**
     * 放大镜
     */
    export class Glass{
        private _x: number;
        private _y: number;
        private _radius: number; //可视圆半径

        private _mask: Laya.Sprite;
        private _display: Laya.Sprite;
        private _imgSign: Laya.Sprite;
        private _scale: number;

        init(radius: number,parent: Laya.Sprite,maskTarget: Laya.Sprite): void{
            this._scale = 1;
            this._radius = radius;
            this._mask = new Laya.Sprite();
            this._display = new Laya.Sprite();
            this._imgSign = new Laya.Sprite();
            this._imgSign.loadImage('hiddenElfGame/wo.png');
            this._display.loadImage('hiddenElfGame/wodefangdajing.png');
            parent.addChild(this._display);
            parent.addChild(this._imgSign);
            maskTarget.mask = this._mask;
        }
        pos(x: number,y: number): void{
            this.x = x;
            this.y = y;
        }
        /**
         * 检查交集
         * @param rect 
         */
        intersection(rect: Laya.Rectangle): boolean{
            let x: number = this._x + 71*this._scale;
            let y: number = this._y + 64*this._scale;
            let radius: number = this._scale * this._radius;
            if(rect.contains(x,y))return true; //判断圆心是否在矩形中
            //判断圆是否与矩形四边相交 判断顺序为上下左右
            if(rect.contains(x,y+radius))return true;
            if(rect.contains(x,y-radius))return true;
            if(rect.contains(x+radius,y))return true;
            if(rect.contains(x-radius,y))return true;
            return false;
        }
        /** 扩大*/
        amp(): void{
            this.scale = Config.AMP_SCALE;
            Laya.timer.once(Config.AMP_TIME * 1000,this,()=>{ this.scale = 1; });
        }

        get x(): number{
            return this._x;
        }
        set x(value: number){
            if(this._x == value)return;
            this._x = value;
            this._display.x = value;
            this._imgSign.x = value + 42;
            this.updateDraw();
        }
        get y(): number{
            return this._y;
        }
        set y(value: number){
            if(this._y == value)return;
            this._y = value;
            this._display.y = value;
            this._imgSign.y = value - 33;
            this.updateDraw();
        }
        set scale(value: number){
            this._scale = value;
            this._display.scaleX = this._display.scaleY = this._scale;
            this.updateDraw();
        }
        get scale(): number{
            return this._scale;
        }
        private updateDraw(): void{
            this._mask.graphics.clear();
            this._mask.graphics.drawCircle(71*this._scale + this._x,64*this._scale + this._y,this._radius * this._scale,'#ffffff');
        }
        dispose(): void{
            Laya.timer.clearAll(this);
            this._mask.destroy();
            this._mask = null;
            this._display.destroy();
            this._display = null;
            this._imgSign.destroy();
            this._imgSign = null;
        }
    }
}