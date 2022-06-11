

namespace clientCore {
    const DEFAULT_ALPHA = 0.7
    export class MaskManager {

        private static _maskLayer: Laya.Sprite;

        public static setup(): void {
            this._maskLayer = new Laya.Sprite();
            this._maskLayer.alpha = DEFAULT_ALPHA;
            this._maskLayer.mouseEnabled = true;
            this._maskLayer.on(Laya.Event.CLICK, this, this.onMask);
            Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
            EventManager.on(globalEvent.CHECK_MASK, this, this.checkMask);
            EventManager.on(globalEvent.STAGE_RESIZE, this, this.onResize);
            this.onResize();
        }

        static changeAlpha(a: number = DEFAULT_ALPHA) {
            this._maskLayer.alpha = a;
        }

        private static onResize(): void {
            this._maskLayer.x = -LayerManager.OFFSET;
            this._maskLayer.graphics.clear();
            this._maskLayer.width = Laya.stage.width;
            this._maskLayer.height = Laya.stage.height;
            this._maskLayer.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, UIConfig.popupBgColor);
        }

        private static checkMask(): void {
            this._maskLayer.removeSelf();
            let layer: core.BaseLayer = LayerManager.mainLayer;
            let len: number = layer.numChildren;
            for (let i: number = len - 1; i > -1; i--) {
                let child = layer.getChildAt(i);
                if (child instanceof core.BaseDialog || (child instanceof core.BaseModule && !child.fullScreen)) {
                    layer.addChild(this._maskLayer);
                    layer.addChild(child);
                    return;
                }
            }
        }

        private static onMask(): void {
            let layer: core.BaseLayer = LayerManager.mainLayer;
            let len: number = layer.numChildren;
            for (let i: number = len - 1; i > -1; i--) {
                let child: any = layer.getChildAt(i);
                if (child instanceof core.BaseModule) {
                    if(child.sideClose)
                        child.isDialog ? DialogMgr.ins.close(child) : child.destroy();
                    return;
                }
            }
        }

        public static set alpha(value: number) {
            this._maskLayer.alpha = value;
        }
    }
}