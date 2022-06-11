namespace time {
    /**
     * 定时器管理者
     */
    export class GTimeManager {

        private _fps: number = 100/6;
        private _map: util.HashMap<GTime>;

        constructor() {
            this._map = new util.HashMap<GTime>();
        }

        public update(): void {
            let array: GTime[] = this._map.getValues();
            let now: number = Laya.Browser.now();
            _.forEach(array, (element) => {
                if (element.started && now >= element.executeTime + element.delay) {
                    let dt: number = now - element.executeTime;
                    element.executeTime = now;
                    element.run(Math.floor(dt/element.delay));
                }
            })
        }

        /**
         * 获取一个时间器
         * @param type 类型  globalEvent.TIME_ON  globalEvent.TIME_ONCE
         * @param delay 延迟时间(毫秒)
         * @param caller
         * @param callback 
         */
        public getTime<T, A>(type: string, delay: number, caller: T, callback: Function, args?: A[]): GTime {
            let t: GTime = Laya.Pool.getItemByClass("GTime", GTime);
            t.id = GTime.$ID++;
            t.type = type;
            t.delay = delay;
            t.caller = caller;
            t.callback = callback;
            t.args = args;
            this._map.add(t.id, t);
            return t;
        }

        /**
         * 获取标准60帧时间刷新
         * @param caller 
         * @param callfunc 
         * @param args 
         */
        public getFrame<T,A>(caller: T,callfunc: Function,args?: A[]): GTime{
            return this.getTime(globalEvent.TIME_ON,100/6,caller,callfunc,args);
        }

        public rmTime(id: number): void {
            this._map?.remove(id);
        }

        private static _ins: GTimeManager;
        public static get ins(): GTimeManager {
            return this._ins || (this._ins = new GTimeManager());
        }
    }
}