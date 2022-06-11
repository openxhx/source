namespace secretroom{
    /**
     * 相机
     */
    export class Camera{

        private static _instance: Camera;
        public static get instance(): Camera{
            return this._instance || (this._instance = new Camera());
        }

        /** 地图层-地图单元都必须在这个容器里面*/
        private _layer: Laya.Sprite;

        constructor(){ }

        public init(layer: Laya.Sprite): void{
            this._layer = layer;
            let w: number = Laya.stage.width - layer.width;
            layer.pos(-clientCore.LayerManager.OFFSET - Math.abs(w)/2,0);
            this.addEvents();
        }

        public dispose(): void{
            this._layer = null;
            this.removeEvents()
        }

        private addEvents(): void{
            BC.addEvent(this,this._layer,Laya.Event.MOUSE_DOWN,this,this.onStartDrag);
        }

        private removeEvents(): void{
            BC.removeEvent(this);
        }

        private onStartDrag(): void{
            let offset: number = clientCore.LayerManager.OFFSET;
            let x: number = Laya.stage.width - this._layer.width;
            let y: number = Laya.stage.height - this._layer.height;
            this._layer.startDrag(new Laya.Rectangle(x-offset,y,Math.abs(x),Math.abs(y)));
        }        
    }
}