namespace clientCore {
    /**
     * 小游戏引导
     */
    export class LittleGameGuide extends ui.alert.GameGuideUI {

        public sideClose = false;
        private _bone: Bone;
        private _handler: Laya.Handler;

        constructor() { super(); }

        show(path: string, scale?: number, handler?: Laya.Handler): void {
            DialogMgr.ins.open(this);
            this.btnStart.visible = false;
            let x: number = this.width / 2;
            let y: number = this.height / 2 - 20;
            this._handler = handler;
            this._bone = BoneMgr.ins.play(path, 0, false, this);
            this._bone.pos(x, y);
            this._bone.scaleX = this._bone.scaleY = scale || 1;
            this._bone.once(Laya.Event.COMPLETE, this, () => {
                this._bone = BoneMgr.ins.play(path, 0, true, this);
                this._bone.pos(x, y);
                this._bone.scaleX = this._bone.scaleY = scale || 1;
                this.btnStart.visible = true;
            });
        }

        hide(): void {
            if (this._handler) {
                this._handler.once = true;
                this._handler.run();
                this._handler = null;
            }
            DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.hide);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._bone.dispose();
            this._bone = null;
            super.destroy();
        }
    }
}