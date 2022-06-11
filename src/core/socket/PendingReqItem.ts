namespace net {
    export class PendingReqItem {
        static defaultTimeOut: number = 10000;//默认5秒
        public finished: boolean = false;
        public seq: number;
        public silent: boolean;
        public cmdName: string;
        private resolve: (v?: any) => void;
        private reject: (v?: any) => void;
        private _totalTimeOut: number;

        constructor(resolve: (v?: any) => void, reject: (v?: any) => void, timeOut: number) {
            this.resolve = resolve;
            this.reject = reject;
            this._totalTimeOut = timeOut;
            if (this._totalTimeOut > 0)
                Laya.timer.once(this._totalTimeOut, this, this.onTimeOut);
        }

        public complete(data: any) {
            this.resolve(data);
            this.clear();
        }

        public errorCode(err: ErrorCode) {
            this.reject(err);
            this.clear();
        }

        private onTimeOut() {
            this.reject(ErrorCode.OUT_TIME);
            this.clear();
            !this.silent && net.alertErrorCode(ErrorCode.OUT_TIME);
        }

        public clear() {
            Laya.timer.clear(this, this.onTimeOut);
            this.finished = true;
        }

        public pause() {
            if (this._totalTimeOut > 0)
                Laya.timer.clear(this, this.onTimeOut);
        }

        public resume() {
            if (this._totalTimeOut > 0)
                Laya.timer.once(this._totalTimeOut, this, this.onTimeOut);
        }
    }
}
