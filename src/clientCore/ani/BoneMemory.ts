namespace clientCore {
    /**
     * 骨骼缓存管理 LRU算法
     */
    export class BoneMemory {

        private _timeMap: Map<string, number> = new Map();
        private _tempMap: Map<string, BoneInfo> = new Map();
        private _t: time.GTime;
        //--3分清理--
        //--当3分钟内有资源没有被使用 则清理
        private _cleanTime: number = 180000;
        //--清理内存 少于800M不清理
        private _removeM: number = 800;

        constructor() { }

        /**
         * 加入检测同时减小templet引用计数
         * @param temp 
         */
        public add(key: string): void {
            let info: BoneInfo = this._tempMap.get(key);
            if (!info) return;
            info.count--;
            if (info.count <= 0) this._timeMap.set(key, Laya.Browser.now());
            if (this._timeMap.size <= 0) return;
            if (!this._t) this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 5000, this, this.check);
            if (!this._t.started) this._t.start();
        }

        /**
         * 移出检测同时加入templet缓存
         * @param key 
         */
        public remove(key: string, temp: Laya.Templet): void {
            this._timeMap.delete(key);
            let info: BoneInfo = this._tempMap.get(key);
            if (!info) {
                info = BoneInfo.create();
                info.temp = temp;
                this._tempMap.set(key, info);
            }
            info.count++;
        }

        public getTemp(key: string): Laya.Templet {
            let info: BoneInfo = this._tempMap.get(key);
            if (info) return info.temp;
            return null;
        }

        public delete(key: string): void {
            this._timeMap.delete(key);
            this._tempMap.delete(key);
        }

        private check(): void {
            let _memory: number = (Laya.Resource.gpuMemory + Laya.Resource.cpuMemory) / 1024 / 1024;
            if (_memory < this._removeM) {
                return;
            }
            this._timeMap.forEach((value, key) => { this.clear(key, value); })
            this._timeMap.size <= 0 && this._t.stop();
        }

        private clear(key: string, time: number): void {
            let currT: number = Laya.Browser.now();
            if (currT - this._cleanTime >= time) { //到了检测时间了
                let info: BoneInfo = this._tempMap.get(key);
                if (info.count <= 0) {
                    info.dispose();
                    this.delete(key);
                    console.log("bonememory remove: " + key);
                }
            }
        }

        private static _ins: BoneMemory;
        public static get ins(): BoneMemory {
            return this._ins || (this._ins = new BoneMemory());
        }
    }

    class BoneInfo {

        private static _pool: BoneInfo[] = [];

        count: number = 0;
        temp: Laya.Templet;

        dispose(): void {
            this.count = 0;
            this.temp?.destroy();
            this.temp = null;
            BoneInfo._pool.push(this);
        }

        public static create(): BoneInfo {
            return this._pool.shift() || new BoneInfo();
        }
    }
}