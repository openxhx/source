namespace core {

    export class BaseLayer extends Laya.Sprite {
        private _layer: number;
        constructor(layer: number) {
            super();
            this._layer = layer;
            this.width = this.stage.width;
            this.height = this.stage.height;
            this.mouseThrough = true;
        }

        public get layer(): number {
            return this._layer;
        }
    }
}