namespace spirittree {
    export class SpriteTreeFlower {
        static templet: Laya.Templet;
        private _sk: Laya.Skeleton;
        private _parent: Laya.Box;
        constructor(parent: Laya.Box) {
            this._sk = SpriteTreeFlower.templet.buildArmature(1);
            this._sk.pos(parent.width / 2, parent.height / 2, true);
            this._parent = parent;
            this._parent.addChild(this._sk);
        }

        set visible(b) {
            this._parent.visible = b;
        }

        get visible() {
            return this._parent.visible;
        }

        on(ev: string, caller: any, fun: Function, param: any) {
            this._parent.on(ev, caller, fun, param);
        }

        async playAni(ani: | 'harvest' | 'create') {
            return new Promise((ok) => {
                this._sk.once(Laya.Event.STOPPED, this, ok);
                this._sk.play(ani, false);
            })
        }

        playLoop() {
            this._sk.play('loop', true);
        }

        destory() {
            this._sk.destroy();
        }
    }
}