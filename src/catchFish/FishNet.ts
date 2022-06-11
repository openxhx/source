namespace catchFish{
    /**
     * 渔网
     */
    export class FishNet{
        private _x: number;
        private _y: number;
        private _radius: number; //可视圆半径

        private _mask: Laya.Sprite;
        private _display: Laya.Sprite;

        init(img:Laya.Image): void{
            this._display = img;
            this._radius = 90;
            // this._display.loadImage('hiddenElfGame/wodefangdajing.png');
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
            // let x: number = this._x + 71*this._scale;
            // let y: number = this._y + 64*this._scale;
            // let radius: number = this._radius;
            // if(rect.contains(x,y))return true; //判断圆心是否在矩形中
            // //判断圆是否与矩形四边相交 判断顺序为上下左右
            // if(rect.contains(x,y+radius))return true;
            // if(rect.contains(x,y-radius))return true;
            // if(rect.contains(x+radius,y))return true;
            // if(rect.contains(x-radius,y))return true;
            return false;
        }

        get x(): number{
            return this._x;
        }
        set x(value: number){
            if(this._x == value)return;
            this._x = value;
            this._display.x = value;
        }
        get y(): number{
            return this._y;
        }
        set y(value: number){
            if(this._y == value)return;
            this._y = value;
            this._display.y = value;
        }
        dispose(): void{
            Laya.timer.clearAll(this);
            this._mask.destroy();
            this._mask = null;
            this._display.destroy();
            this._display = null;
        }
    }
}