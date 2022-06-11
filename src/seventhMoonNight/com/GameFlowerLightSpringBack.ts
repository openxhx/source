namespace seventhMoonNight {
    /**
     * 花灯的回弹处理
     */
    export class GameFlowerLightSpringBack {
        /**回弹的距离*/
        private readonly DISTANCE: number = 70;
        /**回弹所需要的时间*/
        private readonly DURATIONS: number = 1000;
        /**花灯*/
        private _light: Laya.Image;
        /**回弹结束回调*/
        private _completeFun: () => void;
        /**是否正在回弹ing*/
        private _isWorking: boolean;
        /**回弹的缓动方法*/
        private _tw: Laya.Tween;
        /**坐标转换使用*/
        private _po: Laya.Point;

        constructor(light: Laya.Image, completeFun: () => void) {
            this._light = light;
            this._completeFun = completeFun;
            this._isWorking = false;
            this._po = new Laya.Point();
        }

        /**
         * 开始回弹效果处理
         */
        public start(): void {
            this.stop();
            Laya.Tween.clearTween(this._light);
            this._light.rotation = 0;
            this._isWorking = true;
            let targetY: number = this._light.y - this.DISTANCE;
            if (targetY < this._light.height) targetY = this._light.height;
            if (this._light.y - targetY > 0) {
                // this._po.x = this._light.width / 2;
                // this._light.localToGlobal(this._po, false);
                // const offXCenter: number = Math.abs(this._po.x - Laya.stage.width / 2);
                // let durationTime: number = Math.ceil(offXCenter / 100) * 1.05;
                // if (durationTime <= 0) durationTime = 1;
                const duration: number = ((this._light.y - targetY) / this.DISTANCE) * this.DURATIONS;
                this._tw = Laya.Tween.to(this._light, {y: targetY}, duration, Laya.Ease.linearIn, Laya.Handler.create(
                    this, this.onTweenComplete
                ));
            } else {
                this._isWorking = false;
                this._completeFun();//回调通知
            }
        }

        /**
         * 缓动已经结束
         */
        private onTweenComplete(): void {
            this.clearTw();
            this._isWorking = false;
            this._completeFun();//回调通知
        }

        /**是否处在回弹工作中*/
        public get isSpringBacking(): boolean {
            return this._isWorking;
        }

        public stop(): void {
            this.clearTw();
            this._isWorking = false;
        }

        /**清除缓动*/
        private clearTw(): void {
            if (!this._tw) return;
            this._tw.clear();
            this._tw = null;
        }

        destroy(): void {
            this.clearTw();
            this._light = this._completeFun = null;
            this._po = null;
        }
    }
}