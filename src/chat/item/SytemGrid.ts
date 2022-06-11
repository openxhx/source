namespace chat.item {
    /**
     * 系统通知
     */
    export class SystemGrid {
        private _x: number;
        private _y: number;
        private _w: number;
        private _h: number;
        private _bg: Laya.Image;
        private _valueTxt: Laya.Text;
        constructor() {
        }
        init(atlasLayer: Laya.Sprite, textLayer: Laya.Sprite, value: string): void {
            //底
            if (!this._bg) {
                this._bg = new Laya.Image('chat/systemBg.png');
                this._bg.sizeGrid = '1,1,1,1';
                this._w = this._bg.width = 546;
                this._h = this._bg.height = 52;
            }
            atlasLayer.addChild(this._bg);
            //内容字
            if (!this._valueTxt) {
                this._valueTxt = new Laya.Text();
                this._valueTxt.font = '汉仪中圆简';
                this._valueTxt.fontSize = 18;
                this._valueTxt.color = '#ffffff';
                this._valueTxt.wordWrap = true;
                this._valueTxt.width = 512;
                this._valueTxt.height = 42;
                this._valueTxt.leading = 5;
                this._valueTxt.align = 'center';
            }
            this._valueTxt.text = '系统公告：' + value;
            textLayer.addChild(this._valueTxt);
        }

        public set x(value: number) {
            this._x = value;
            this._bg.x = value;
            this._valueTxt.x = value + 17;
        }

        public set y(value: number) {
            this._y = value;
            this._bg.y = value;
            this._valueTxt.y = value + 5;
        }

        public get x(): number {
            return this._x;
        }

        public get y(): number {
            return this._y;
        }

        public get width(): number {
            return this._w;
        }

        public get height(): number {
            return this._h;
        }

        public set visible(value: boolean) {
            this._bg.visible = this._valueTxt.visible = value;
        }

        public dispose(): void {
            this._bg.removeSelf();
            this._valueTxt.removeSelf();
            Laya.Pool.recover('chat.item.SystemGrid', this);
        }

        public static create(): SystemGrid {
            return Laya.Pool.getItemByClass('chat.item.SystemGrid', SystemGrid);
        }
    }
}