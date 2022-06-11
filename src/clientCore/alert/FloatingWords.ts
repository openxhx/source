namespace alert {

    /**
     * 浮动文字tips
     */
    export class FloatingWords extends Laya.Image {

        public static contextArr: any[] = [];
        public static moveing: boolean = false;

        private _text: Laya.Label;
        private _moveY: number = 100;

        public showTime: number;

        constructor() {
            super();

            this.skin = "alert/105.png";
            this.sizeGrid = '0,121,0,128';
            this._text = new Laya.Label();
            this._text.fontSize = 30;
            this._text.centerX = this._text.centerY = 0;
            this._text.font = "汉仪中圆简";
            this._text.color = "#805329";
            this._text.bold = false;
            this._text.wordWrap = false;
            // this._text.width = 292;
            this._text.align = 'center';
            this.addChild(this._text);
        }

        /**
         * 初始化内容
         * @param context 提示文本 
         * @param x 位置
         * @param y 
         */
        public init(context: string, x: number, y: number): void {
            if (context == "") {
                this.clear()
                return;
            };
            this._text.text = context;
            this.width = 230 + this._text.width;
            this.height = this._text.height + 20;
            this.pivot(this.width / 2, this.height / 2);
            this.x = x != void 0 ? x : (clientCore.LayerManager.stageWith / 2);
            this.y = y != void 0 ? y : (clientCore.LayerManager.stageHeight / 2);
            this.scale(0.1, 0.1);
            Laya.Tween.clearAll(this);
            Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, 200, null);
            Laya.Tween.to(this, { y: this.y - this._moveY, alpha: 0.7 }, 1500, Laya.Ease.quadIn, new Laya.Handler(this, this.clear), 200);
        }

        public clear(): void {
            this.alpha = 1;
            this.removeSelf();
            Laya.Tween.clearAll(this);
            Laya.Pool.recover("FloatingWords", this);
        }

        public static create(): FloatingWords {
            return Laya.Pool.getItemByClass("FloatingWords", FloatingWords);
        }
    }
}