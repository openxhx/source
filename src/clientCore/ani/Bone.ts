

namespace clientCore {

    /**
     * 一个sk动画
     */
    export class Bone extends Laya.EventDispatcher {

        path: string;
        skeleton: Laya.Skeleton;
        templet: Laya.Templet;
        isLoop: boolean;
        isHit: boolean;
        parent: Laya.Sprite;
        nameOrIndex: number | string;
        disposed: boolean = false;
        buildType: number;
        defaultSkinName: string = 'default';
        retain: boolean;
        extraData: any;
        private completHandle: Laya.Handler;


        private _rotation: number = 0;
        private _rate: number = 1;
        private _scaleX: number = 1;
        private _scaleY: number = 1;
        private _visible: boolean = true;
        private _x: number = 0;
        private _y: number = 0;

        private _mask: Laya.Sprite;

        public pos(x: number, y: number): void {
            this._x = x;
            this._y = y;
            this.skeleton && this.skeleton.pos(x, y, true);
        }

        public get x(): number {
            return this._x;
        }
        public set x(value: number) {
            this._x = value;
            this.skeleton && (this.skeleton.x = value);
        }

        public get y(): number {
            return this._y;
        }
        public set y(value: number) {
            this._y = value;
            this.skeleton && (this.skeleton.y = value);
        }

        public get scaleX(): number {
            return this._scaleX;
        }

        public set scaleX(value: number) {
            this._scaleX = value;
            this.skeleton && (this.skeleton.scaleX = value);
        }

        public get scaleY(): number {
            return this._scaleY;
        }

        public get visible(): boolean {
            return this._visible;
        }
        public set visible(value: boolean) {
            this._visible = value;
            this.skeleton && (this.skeleton.visible = value);
        }

        public set scaleY(value: number) {
            this._scaleY = value;
            this.skeleton && (this.skeleton.scaleY = value);
        }

        public get mask(): Laya.Sprite {
            return this._mask;
        }

        public set mask(value: Laya.Sprite) {
            this._mask = value;
            this.skeleton && (this.skeleton.mask = value);
        }

        /** 播放速率*/
        public get rate(): number {
            return this._rate;
        }

        public set rate(value: number) {
            this._rate = value;
            this.skeleton && this.skeleton.playbackRate(value);
        }

        public get rotation(): number {
            return this._rotation;
        }

        public set rotation(value: number) {
            this._rotation = value;
            this.skeleton && (this.skeleton.rotation = value);
        }

        public play(nameOrIndex: any, isLoop: boolean, complete?: Laya.Handler): void {
            if (this.skeleton) {
                this.completHandle = complete;
                this.skeleton.once(Laya.Event.STOPPED, this, () => {
                    this.event(Laya.Event.STOPPED);
                    this.completHandle && this.completHandle.run();
                });
                this.skeleton.on(Laya.Event.LABEL, this, (e: Laya.Event) => {
                    this.event(Laya.Event.LABEL, e);
                })
                this.nameOrIndex = nameOrIndex;
                this.skeleton.play(nameOrIndex, isLoop);
                //启动点击的话 在每次开始播放的时候会延迟0.5秒设置点击区域
                if (this.isHit) {
                    this.skeleton.off(Laya.Event.CLICK, this, this.onClick);
                    Laya.timer.once(500, this, this.hitArea);
                }
            }
        }

        /** 单纯发送终止事件*/
        public stopEvent(args?: any): void {
            this.skeleton && this.skeleton.event(Laya.Event.STOPPED, args);
        }

        /** 设置点击区域*/
        public hitArea(): void {
            if (!this.skeleton) return;
            let rect: Laya.Rectangle = this.skeleton.getBounds();
            this.skeleton.hitArea = new Laya.Rectangle(rect.x - this._x, rect.y - this._y, rect.width, rect.height);
            this.skeleton.on(Laya.Event.CLICK, this, this.onClick);
        }

        private onClick(): void {
            this.event(Laya.Event.CLICK);
        }

        public stop() {
            this.skeleton && this.skeleton.stop();
        }

        public addTo(parent: Laya.Sprite): void {
            if (parent != this.parent) {
                this.parent = parent;
                parent.addChild(this.skeleton);
            }
        }

        public offAllHandle() {
            this.completHandle?.clear();
            this.completHandle = null;
            this.skeleton && this.skeleton.offAll();
        }

        /**
         * 是否强行清理模板
         * @param isForce 
         */
        public dispose(isForce: boolean = false): void {
            this.offAll();
            Laya.timer.clearAll(this);
            this.disposed = true;
            if (this.skeleton && this.skeleton.templet) {
                this.completHandle?.clear();
                this.completHandle = null;
                this.skeleton.offAll();
                this.skeleton.stop();
                this.skeleton.destroy(true);
                this.skeleton = null
            }
            if (this.templet && isForce) {
                this.templet && this.templet.destroy();
                this.templet = null;
                BoneMemory.ins.delete(this.path);
            } else {
                BoneMemory.ins.add(this.path);
            }
            this._mask && this._mask.destroy();
            this._mask = this.parent = this.skeleton = null;
        }
    }
}