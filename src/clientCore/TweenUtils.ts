
namespace util {
    /**
     * Tween管理
     */
    export class TweenUtils {

        private static _pool: Laya.Tween[] = [];
        private static _map: object = {};
        // private static _t: time.GTime;
        // private static _id: number = 1;
        // private static _map: Map<number, { delay: number, tween: Laya.Tween }> = new Map();
        // private static _targetMap: object = {};

        constructor() { }


        /**
         * 缓动对象的props属性到目标值。
         * @param target 目标对象(即将更改属性值的对象)。
         * @param props 变化的属性列表
         * @param duration 花费的时间，单位毫秒。
         * @param ease 缓动类型，默认为匀速运动。
         * @param caller 作用域
         * @param callfunc 回调函数
         * @param sign 缓存标志
         */
        static creTween(target: any, props: any, duration: number, ease?: Function, caller?: any, callfunc?: Function, sign?: string): void {
            let tw: Laya.Tween = this._pool.shift() || new Laya.Tween();
            tw.to(target, props, duration, ease, Laya.Handler.create(this, this.tweenCom, [tw, caller, callfunc, sign]));

            if (!sign) return;
            let tws: Laya.Tween[] = this._map[sign];
            if (!tws) {
                tws = [];
                this._map[sign] = tws;
            }
            tws.push(tw);
        }

        static remove(sign: string): void {
            let tws: Laya.Tween[] = this._map[sign];
            if (tws) {
                _.forEach(tws, (element) => {
                    element.clear();
                    this._pool.push(element);
                })
                tws.length = 0;
            }
            delete this._map[sign];
        }

        /**
         * 把正在执行的立即结束
         * @param sign 
         */
        static over(sign: string): void{
            let tws: Laya.Tween[] = this._map[sign];
            if (tws) {
                _.forEach(tws, (element) => {
                    if(element){
                        element.complete();
                        this._pool.push(element);
                    }
                })
                tws.length = 0;
            }
            delete this._map[sign];
        }

        private static tweenCom(tw: Laya.Tween, caller: any, callfunc: any, sign: string): void {
            if (caller && callfunc) {
                callfunc.apply(caller);
                caller = null;
                callfunc = null;
            }
            if (sign) {
                let tws: Laya.Tween[] = this._map[sign];
                if (tws) {
                    tws = _.remove(tws, (element) => { return element == tw; });
                    tws.length == 0 && delete this._map[sign];
                }
            }
            tw.clear();
            this._pool.push(tw);
        }

        // /**
        //  * 缓动对象的props属性到目标值,
        //  * @param target 目标对象(即将更改属性值的对象)。
        //  * @param props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
        //  * @param duration 花费的时间，单位毫秒。
        //  * @param check 检查 是否加入检查
        //  * @param ease 缓动类型，默认为匀速运动。
        //  * @param caller 作用域
        //  * @param callfunc 结束回调函数。
        //  */
        // static creTween(key: string, target: any, props: any, duration: number, check?: boolean, ease?: Function, caller?: any, callfunc?: Function): void {
        //     if (!target) {
        //         console.log('tween target is not found~');
        //         return;
        //     }
        //     let id: number = -1;
        //     let tw: Laya.Tween = this._pool.shift() || new Laya.Tween();
        //     if (check) {
        //         id = this._id++;
        //         this._map.set(id, { delay: duration + Laya.Browser.now(), tween: tw });
        //         if (!this._t) this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.tweenCheck);
        //         if (!this._t.started) this._t.start();
        //     }
        //     tw.to(target, props, duration, ease, Laya.Handler.create(this, this.tweenCom, [key, tw, target, caller, callfunc, id]));

        //     let targets: any[] = this._targetMap[key];
        //     if (!targets) {
        //         targets = [];
        //         this._targetMap[key] = targets;
        //     }
        //     targets.push([id, target]);
        // }

        // static remove(key: string): void {
        //     let targets: any[] = this._targetMap[key];
        //     if (targets) {
        //         _.forEach(targets, (element) => {
        //             element[0] != -1 && this._map.delete(element[0]);
        //             Laya.Tween.clearAll(element[1]);
        //         })
        //         targets.length = 0;
        //     }
        //     delete this._targetMap[key];
        // }

        // private static tweenCom(key: string, tw: Laya.Tween, target: any, caller: any, callfunc: Function, id: number): void {
        //     let targets: any[] = this._targetMap[key];
        //     if (targets) {
        //         targets = _.remove(targets, (element) => { return element[1] == target; });
        //         targets.length == 0 && delete this._targetMap[key];
        //     }
        //     tw.clear();
        //     this._pool.push(tw);
        //     callfunc && callfunc.apply(caller);
        //     id != -1 && this._map.delete(id);
        // }

        // private static tweenCheck(): void {
        //     let ct: number = Laya.Browser.now();
        //     for (let key of this._map.keys()) {
        //         let data: { delay: number, tween: Laya.Tween } = this._map.get(key);
        //         data && ct > data.delay && data.tween.complete();
        //     }
        //     this._map.size == 0 && this._t && this._t.stop();
        // }
    }
}