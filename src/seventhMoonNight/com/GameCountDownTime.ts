namespace seventhMoonNight {
    /**
     * 游戏倒计时处理类
     */
    export class GameCountDownTime {
        private _labCd: Laya.Label;
        private readonly cdAll: number;
        private _cd: number;

        constructor(labCd: Laya.Label, cdAll: number) {
            this._labCd = labCd;
            this.cdAll = cdAll;
            this._cd = this.cdAll;
            this.resetLabel();
        }

        //开始倒计时
        public start(): void {
            this.clearTe();
            this._cd = this.cdAll;
            this.resetLabel();
            Laya.timer.loop(1000, this, this.onTimer);
        }

        private onTimer(): void {
            this._cd--;
            this.resetLabel();
            if (this._cd <= 0) {
                this.clearTe();
                EventManager.event(SeventhMoonNightEventType.COUNTDOWN_TIMER_FINISHED);
            }
        }

        private async resetLabel(): Promise<void> {
            return new Promise<void>(resolve => {
                this._cd < 0 && (this._cd = 0);
                this._labCd.text = `${this._cd < 10 ? "0" : ""}${this._cd}`;
                resolve();
            });
        }

        private clearTe(): void {
            Laya.timer.clear(this, this.onTimer);
        }

        public stop(): void{
            this.clearTe();
        }

        public destroy(): void {
            this.clearTe();
            this._labCd = null;
        }
    }
}