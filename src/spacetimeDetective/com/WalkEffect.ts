namespace spacetimeDetective {
    /**
     * 模拟走动效果
     */
    export class WalkEffect {
        private _childIndex: number;
        private _leftPos: { x: number, y: number };
        private _rightPos: { x: number, y: number };
        private _scene: Laya.Box;
        private _imgOnLightLeft: Laya.Image;
        private _imgOnLightRight: Laya.Image;
        private _tw: Laya.Tween;
        private _po: Laya.Point;
        private _tempPo: Laya.Point;
        private _sceneY: number;
        private readonly _steps: Array<IWalkVo> = [
            { rotation: 0, offY: -10, delay: 0, duration: 200 },
            { rotation: 0, offY: 0, delay: 80, duration: 100 },
            { rotation: 0, offY: 10, delay: 50, duration: 150 },
            { rotation: 0, offY: 0, delay: 80, duration: 200 },
            { rotation: 0, offY: -10, delay: 50, duration: 150 },
            { rotation: 0, offY: 0, delay: 80, duration: 200 }
        ];
        public constructor(scene: Laya.Box, imgOnLightLeft: Laya.Image, imgOnLightRight: Laya.Image) {
            this.resetScene(scene);
            this._childIndex = imgOnLightLeft.parent.getChildIndex(imgOnLightLeft);
            this._imgOnLightLeft = imgOnLightLeft;
            this._imgOnLightRight = imgOnLightRight;
            this._leftPos = { x: this._imgOnLightLeft.x, y: this._imgOnLightLeft.y };
            this._rightPos = { x: this._imgOnLightRight.x, y: this._imgOnLightRight.y };
            this._po = new Laya.Point(0, 0);
            this._tempPo = new Laya.Point(0, 0);
        }

        public resetScene(scene: Laya.Box): void {
            this._scene = scene;
            this._sceneY = this._scene.y;
        }

        public async start(): Promise<void> {
            this.stop(false);
            return new Promise<void>(resolve => {
                this.setImgParent(true);
                this.doTween(resolve, 0);//从第一步开始
            });
        }

        private doTween: (callback: () => void, step: number) => void = (callback, step) => {
            const data: IWalkVo = this._steps[step];
            this._tw = Laya.Tween.to(
                this._scene,
                { rotation: data.rotation, y: this._sceneY + data.offY },
                data.duration,
                Laya.Ease.linearNone,
                Laya.Handler.create(this, this.onCkeckOver, [callback, step]),
                data.delay);
        };

        private onCkeckOver(callback: () => void, step: number): void {
            this.clearTw();
            step++;
            if (step >= this._steps.length) {
                this.stop(true);
                callback();
                return;
            }
            this.doTween(callback, step);
        }



        private setImgParent(isEnter: boolean): void {
            if (isEnter) {
                const doEnter: (target: Laya.Image) => void = (target) => {
                    this._tempPo.x = this._tempPo.y = 0;
                    this._po = target.localToGlobal(this._tempPo);
                    this._tempPo = this._scene.globalToLocal(this._po);
                    target.x = this._tempPo.x;
                    target.y = this._tempPo.y;
                    target.removeSelf();
                    this._scene.addChild(target);
                };
                if (this._imgOnLightLeft.parent != this._scene) {
                    doEnter(this._imgOnLightLeft);
                    doEnter(this._imgOnLightRight);
                }
            } else {
                const doOut: (target: Laya.Image, index: number, pos: { x: number, y: number }) => void = (target, index, pos) => {
                    target.x = pos.x;
                    target.y = pos.y;
                    target.removeSelf();
                    this._scene.parent.addChildAt(target, index);
                };
                if (this._imgOnLightLeft.parent == this._scene) {
                    doOut(this._imgOnLightLeft, this._childIndex, this._leftPos);
                    doOut(this._imgOnLightRight, this._childIndex + 1, this._rightPos);
                }
            }
        }

        private stop(isNeedOutImg: boolean): void {
            if (isNeedOutImg) {
                this.setImgParent(false);
            }
            this.clearTw();
            this._scene.rotation = 0;
            this._scene.y = this._sceneY;
        }

        private clearTw: () => void = () => {
            if (this._tw) {
                this._tw.clear();
                this._tw = null;
            }
        };

        public destroy(): void {
            this.stop(true);
            this._po = this._tempPo = null;
            this._leftPos = this._rightPos = null;
            this._scene = this._imgOnLightLeft = this._imgOnLightRight = null;
        }
    }
}