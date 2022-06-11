namespace clientCore{
    /**
     * 适配
     */
    export class ResizeMgr{
        private static _instance: ResizeMgr;
        public static get instance(): ResizeMgr{
            return this._instance || (this._instance = new ResizeMgr());
        }

        constructor(){
        }

        configure(): void{
            Laya.stage.on(Laya.Event.RESIZE,this,this.onResize);
        }

        private onResize(): void{
            LayerManager.resizeView();
            ModuleManager.resizeView();
            MapManager.resizeMap();
            EventManager.event(globalEvent.STAGE_RESIZE);
        }
    }
}