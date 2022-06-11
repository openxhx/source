namespace chat.item {
    /**
     * cp系统通知
     */
    export class CpSystemGrid {
        private _x: number;
        private _y: number;
        private _w: number;
        private _h: number;
        private _bg: Laya.Image;
        private _titleTxt: Laya.Text;
        private _valueTxt: Laya.Text;
        constructor() {
        }
        init(atlasLayer: Laya.Sprite, textLayer: Laya.Sprite, value: string): void {
            //底
            if (!this._bg) {
                this._bg = new Laya.Image('chat/di_gonggao.png');
                this._bg.sizeGrid = '0,80,0,90';
                this._w = this._bg.width = 493;
                this._h = this._bg.height = 107;
            }
            atlasLayer.addChild(this._bg);
            //标题字
            if (!this._titleTxt) {
                this._titleTxt = new Laya.Text();
                this._titleTxt.font = '汉仪中圆简';
                this._titleTxt.fontSize = 20;
                this._titleTxt.color = '#ffffff';
                this._titleTxt.text = '守护花缘';
            }
            textLayer.addChild(this._titleTxt);
            //内容字
            if (!this._valueTxt) {
                this._valueTxt = new Laya.Text();
                this._valueTxt.font = '汉仪中圆简';
                this._valueTxt.fontSize = 20;
                this._valueTxt.color = '#805329';
                this._valueTxt.wordWrap = true;
                this._valueTxt.width = 377;
                this._valueTxt.height = 56;
                this._valueTxt.leading = 5;
            }
            this._valueTxt.text = value;
            textLayer.addChild(this._valueTxt);
        }

        public set x(value: number) {
            this._x = value;
            this._bg.x = value;
            this._titleTxt.x = value + 4;
            this._valueTxt.x = value + 98;
        }

        public set y(value: number) {
            this._y = value;
            this._bg.y = value;
            this._titleTxt.y = value + 14;
            this._valueTxt.y = value + 16;
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
            this._bg.visible = this._valueTxt.visible = this._titleTxt.visible = value;
        }

        public dispose(): void {
            this._bg.removeSelf();
            this._titleTxt.removeSelf();
            this._valueTxt.removeSelf();
            Laya.Pool.recover('chat.item.CpSystemGrid', this);
        }

        public static create(): CpSystemGrid {
            return Laya.Pool.getItemByClass('chat.item.CpSystemGrid', CpSystemGrid);
        }
    }
}