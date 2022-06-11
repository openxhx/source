namespace seventhMoonNight {
    /**
     * 花灯摇晃动画
     */
    export class GameFlowerLightWobbleAnimation {
        private _light: Laya.Image;
        private _tw: Laya.Tween;

        private readonly ANIMATIONS: Array<{ rotation: number, duration: number }> = [
            {rotation: -5, duration: 500},
            {rotation: 0, duration: 300},
            {rotation: 5, duration: 500},
            {rotation: 0, duration: 300}
        ];

        constructor(light: Laya.Image) {
            this._light = light;
        }

        //开始摇晃动画
        public start(): void {
            this._light.rotation = 0;
            this.doTween(0);
        }

        private doTween: (index: number) => void = (index) => {
            this._tw && this._tw.clear();
            let cell: { rotation: number, duration: number } = this.ANIMATIONS[index];
            let isRestar: boolean = false;
            if (this._tw) {
                isRestar = true;
                this._tw.to(this._light, {rotation: cell.rotation}, cell.duration, Laya.Ease.linearNone, Laya.Handler.create(this, this.tweenNext, [index]));
            } else {
                this._tw = Laya.Tween.to(this._light, {rotation: cell.rotation}, cell.duration, Laya.Ease.linearNone, Laya.Handler.create(this, this.tweenNext, [index]));
            }
            if (isRestar) {
                this._tw.restart();
            }
        };

        private tweenNext: (index: number) => void = (index) => {
            index++;
            if (index >= this.ANIMATIONS.length) {
                index = 0;
            }
            this.doTween(index);
        };


        private clearTw(): void {
            if (!this._tw) return;
            this._tw.clear();
            this._tw = null;
        }

        destroy(): void {
            this.clearTw();
            this._light = null;
        }
    }
}