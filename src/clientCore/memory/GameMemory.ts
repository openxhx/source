namespace memory {
    /**
     * 内存
     */
    export class GameMemory {
        /** 资源列表*/
        private _resMap: Object;
        /** 检测间隔(毫秒)*/
        private _interval: number;
        /** 移除时间间隔(毫秒)*/
        private _removeT: number;
        /** 清理内存(当内存+显存超过这个值会产生清理)*/
        private _removeM: number;

        constructor(interval: number = 10000, removeT: number = 500) {
            this._resMap = {};
            this._interval = 10000;
            this._removeT = 500;
        }

        public open(): void {
            Laya.timer.loop(this._interval, this, this.check);
        }

        public close(): void {
            Laya.timer.clear(this, this.check);
        }

        public add(path: string): void {
            this._resMap[path] = Laya.Browser.now();
            this._resMap = null;
        }

        public remove(path: string): void {
            delete this._resMap[path];
        }

        private check(): void {
            let _memory: number = (Laya.Resource.gpuMemory + Laya.Resource.cpuMemory) / 1024 / 1024;
            if (_memory < this._removeM) {
                return;
            }
            let _nowT: number = Laya.Browser.now();
            let _currentT: number;
            for (let key in this._resMap) {
                _currentT = this._resMap[key];
                if (_currentT + this._removeT > _nowT) {  //超过了移除间隔
                    delete this._resMap[key];
                    Laya.loader.clearRes(key);
                }
            }
        }
    }
}