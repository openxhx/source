namespace spacetimeDetective {
    //支援的倒计时
    export class CountDownSupport {
        private _callback: (tag: string, data: any, ...arg) => void;
        private _labCd: Laya.Label;
        private _model: SpacetimeDetectiveModel;
        private _cd: number;
        //#region 
        private _h: number;
        private _m: number;
        private _s: number;
        private _hStr: string;
        private _mStr: string;
        private _sStr: string;
        //#endregion
        public constructor(callback: (tag: string, data: any, ...arg) => void, labCd: Laya.Label, model: SpacetimeDetectiveModel) {
            this._callback = callback;
            this._labCd = labCd;
            this._model = model;
        }

        public start(): void {
            this.stop();
            const now: number = clientCore.ServerManager.curServerTime;
            const startT: number = util.TimeUtil.formatTimeStrToSec(this._model.ACTIVITY_TIME[0]);
            if (now < startT) {
                this._callback("cd_e", ActivityTimeType.NONE_START);
                return;
            }
            const endT: number = util.TimeUtil.formatTimeStrToSec(this._model.ACTIVITY_TIME[1]);
            const nextDay: number = Math.ceil(new Date(new Date(now * 1000).setHours(23, 59, 59, 999)).getTime() / 1000);
            if (nextDay + 10 > endT) {
                this._callback("cd_e", ActivityTimeType.OVER);
                return;
            }
            this._cd = nextDay - now;
            this.reset2CdShow();
            Laya.timer.loop(1000, this, this.onTimerHandler);
        }

        public stop(): void {
            Laya.timer.clear(this, this.onTimerHandler);
        }
        //处理计时器
        private onTimerHandler(): void {
            this._cd--;
            if (this._cd <= 0) {
                this.stop();
                this._callback("cd_e", ActivityTimeType.GAMEING, 0);//倒计时结束
            }
            this.reset2CdShow();
        }

        private async reset2CdShow(): Promise<void> {
            return new Promise<void>(resolve => {
                if (this._cd < 0) this._cd = 0;
                this._h = Math.floor(this._cd / 3600);
                this._m = Math.floor((this._cd - this._h * 3600) / 60);
                this._s = this._cd - this._h * 3600 - this._m * 60;
                this._hStr = this._h < 10 ? `0${this._h}` : `${this._h}`;
                this._mStr = this._m < 10 ? `0${this._m}` : `${this._m}`;
                this._sStr = this._s < 10 ? `0${this._s}` : `${this._s}`;
                this._labCd.text = `${this._hStr}:${this._mStr}:${this._sStr}`;
                resolve();
            });
        }

        public destroy(): void {
            this.stop();
            this._callback = null;
            this._model = null;
        }
    }
}