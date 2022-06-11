

namespace clientCore {
    /**
     * 打开模块动效
     */
    export class ModuleMgr {

        constructor() {
            EventManager.on(globalEvent.CLOSE_DIALOG_MODULE, this, this.close);
        }

        private popEffect(mod: core.BaseModule): void {
            if (mod) {
                // mod.anchorX = mod.anchorY = 0.5;
                mod.anchorX = mod.offsetX;
                mod.anchorY = mod.offsetY;
                mod.scale(1, 1);
                mod.alpha = 1;
                let x: number = Laya.stage.width * mod.offsetX - LayerManager.OFFSET;
                let y: number = Laya.stage.height * mod.offsetY;
                mod.pos(x, y);
                Laya.Tween.from(mod, { x: x, y: y, scaleX: 0.5, scaleY: 0.5, alpha: 0 }, 300, Laya.Ease.backOut, Laya.Handler.create(mod, mod.popupOver));
            }
        }

        private closeEffect(mod: core.BaseModule): void {
            let x: number = Laya.stage.width * mod.offsetX - LayerManager.OFFSET;
            let y: number = Laya.stage.height * mod.offsetY;
            Laya.Tween.to(mod, { x: x, y: y, scaleX: 0, scaleY: 0, alpha: 0 }, 300, Laya.Ease.strongOut, Laya.Handler.create(this, this.doClose, [mod]));
        }

        private doClose(mod: core.BaseModule): void {
            mod.closeMod();
            EventManager.event(globalEvent.CHECK_MASK);
        }

        public open(mod: core.BaseModule): void {
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl('bubble'));
            LayerManager.mainLayer.addChild(mod);
            EventManager.event(globalEvent.CHECK_MASK);
            this.popEffect(mod);
        }

        public close(mod: core.BaseModule): void {
            mod.isPromptlyClose ? this.doClose(mod) : this.closeEffect(mod);
        }

        private static _ins: ModuleMgr;
        public static get ins(): ModuleMgr {
            return this._ins || (this._ins = new ModuleMgr());
        }
    }
}