namespace seventhMoonNight {
    /**
     * 小游戏的逐帧时间计时
     */
    export class GameFrameTime {
        private _updateCallback: () => void;

        constructor(updateCallback: () => void) {
            this._updateCallback = updateCallback;
        }

        public start(): void {
            this.clearTe();
            Laya.timer.frameLoop(1, this, this.onTimer);
        }

        private onTimer(): void {
            this._updateCallback();
        }

        private clearTe(): void {
            Laya.timer.clear(this, this.onTimer);
        }

        public stop(): void {
            this.clearTe();
        }

        destroy(): void {
            this.clearTe();
            this._updateCallback = null;
        }
    }
}