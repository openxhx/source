namespace chat.item {
    /**
     * 时间
     */
    export class TimeGrid {

        private _timeBG: Laya.Image;
        private _timeTX: Laya.Text;

        private _w: number; //父容器的宽度

        private _y: number;

        public static HEIGHT: number = 30;

        constructor() {

        }

        public init(atlasLayer: Laya.Sprite, textLayer: Laya.Sprite, value: string, w: number): void {
            this._w = w;
            this.showBG(atlasLayer);
            this.showTX(textLayer, value);
        }

        /**
         * 展示底图
         * @param parent 
         */
        private showBG(parent: Laya.Sprite): void {
            if (!this._timeBG) {
                this._timeBG = new Laya.Image();
                this._timeBG.source = Laya.loader.getRes("chat/di_time.png");
                this._timeBG.sizeGrid = "0,8,0,8";
                this._timeBG.anchorX = 0.5;
            }
            this._timeBG.x = this._w / 2;
            parent.addChild(this._timeBG);
        }

        /**
         * 展示时间
         * @param parent 
         * @param value 
         */
        private showTX(parent: Laya.Sprite, value: string): void {
            if (!this._timeTX) {
                this._timeTX = new Laya.Text();
                this._timeTX.font = "汉仪中圆简";
                this._timeTX.fontSize = 16;
                this._timeTX.color = "#FFFFFF";
            }
            this._timeTX.text = value;
            this._timeBG.width = this._timeTX.textWidth + 20;
            this._timeTX.x = 10 + (this._timeBG.x - this._timeBG.width / 2);
            parent.addChild(this._timeTX);
        }

        public set y(value: number) {
            this._y = value;
            this._timeBG.y = value + 6;
            this._timeTX.y = value + 7;
        }

        public get y(): number {
            return this._y;
        }

        public set visible(value: boolean) {
            this._timeTX.visible = this._timeBG.visible = value;
        }

        public dispose(): void {
            this._timeBG.removeSelf();
            this._timeTX.removeSelf();
            this.visible = true;
            Laya.Pool.recover("chat.TimeGrid", this);
        }

        public static create(): TimeGrid {
            return Laya.Pool.getItemByClass("chat.TimeGrid", TimeGrid);
        }
    }
}