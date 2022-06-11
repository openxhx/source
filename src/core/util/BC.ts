module BC {
    /**
    * 是否已经初始化BC
    */
    var hasInitialized: Boolean;


    // /**
    // * 对象存储器,可根据字符名称和对象作为标签名来存储的数据.
    // * 建议"get"一次后缓存好数据不要频繁使用"get对象key","字符key"不影响
    // * 支持用对象作为key存储数据.
    // */
    // export class Dictionary {
    //     private _count: number;
    //     private _maps: any;
    //     private _hashMaps: any;
    //     private _objKeys: any[];
    //     private _objDatum: any[];

    //     public constructor() {
    //         this._count = 0;
    //         this._maps = {};
    //         this._hashMaps = {};
    //         this._objKeys = [];
    //         this._objDatum = []
    //     }

    //     /**
    //      * 添加指定类型的数据
    //      * @param key 可以是对象、字符、数字
    //      * @param value 任何类型
    //      */
    //     public add(key: any, value: any): void {
    //         if ("object" != typeof key) {
    //             if (this._maps[key] == null || this._maps[key] == undefined) {
    //                 this._count++;
    //             }
    //             this._maps[key] = value;
    //         }
    //         else if (key instanceof egret.HashObject) {
    //             if (this._hashMaps[key.hashCode] == null || this._hashMaps[key.hashCode] == undefined) {
    //                 this._count++;
    //             }
    //             this._maps[key.hashCode] = [key, value];
    //         } else {
    //             var index = this._objKeys.lastIndexOf(key);
    //             if (index == -1) {
    //                 this._objKeys.push(key);
    //                 this._objDatum.push(value);
    //                 this._count++;
    //             }
    //             else {
    //                 this._objDatum[key] = value;
    //             }
    //         }
    //     }

    //     /**
    //      * 删除指定类型的全部数据
    //      * @param key  可以是对象、字符、数字
    //      *
    //      */
    //     public del(key: any): any {
    //         var value: any = null;
    //         if ("object" != typeof key) {
    //             if (this._maps[key]) {
    //                 value = this._maps[key];
    //                 delete this._maps[key];
    //                 this._count--;
    //             }
    //         }
    //         else if (key instanceof egret.HashObject) {
    //             if (this._hashMaps[key.hashCode]) {
    //                 value = this._hashMaps[key.hashCode];
    //                 delete this._hashMaps[key.hashCode];
    //                 this._count--;
    //             }
    //         } else {
    //             var index = this._objKeys.lastIndexOf(key);
    //             if (index != -1) {
    //                 value = this._objDatum[index];
    //                 this._objKeys.splice(index, 1);
    //                 this._objDatum.splice(index, 1);
    //                 this._count--;
    //             }

    //         }
    //         return value;
    //     }

    //     /**
    //      * 获取存储中的数据,对象作为key实际上需要进行遍历索引，所以在同一个字典中尽量不要添加过多的key会影响性能,
    //      * 建议get一次后缓存好数据不要频繁使用get对象key,字符key不影响
    //      * @param key 可以是对象、字符、数字
    //      * @return
    //      */
    //     public get(key: any): any {
    //         var value: any = null;
    //         if (!key) return null;

    //         if ("object" != typeof key) {
    //             value = this._maps[key]
    //         }
    //         else if (key instanceof egret.HashObject) {
    //             value = this._hashMaps[key.hashCode]
    //         } else {
    //             var index = this._objKeys.lastIndexOf(key);
    //             if (index != -1) {
    //                 value = this._objDatum[index];
    //             }
    //         }
    //         return value;
    //     }

    //     /**
    //      * 检查是否有该类型的数据存在
    //      * @param key 可以是对象、字符、数字
    //      * @return
    //      */
    //     public has(key: any): boolean {
    //         var value: boolean = false;
    //         if (!key) return false;

    //         if ("object" != typeof key) {
    //             value = this._maps[key] ? true : false;
    //         }
    //         else if (key instanceof egret.HashObject) {
    //             value = this._hashMaps[key.hashCode] ? true : false;
    //         } else {
    //             var index = this._objKeys.lastIndexOf(key);
    //             value = index >= 0 ? true : false;
    //         }
    //         return value;
    //     }

    //     /**
    //      *  获取字典中储存数据的个数
    //      *
    //      */
    //     public count: number;

    //     /**
    //      * 对字典中的每一项执行函数，用该函数可以省去for循环，
    //      * 允许回调函数中删除当前正在执行的key，
    //      * 但是删除字典中的其他key可能会出现少遍历或重复遍历的情况.
    //      *
    //      */
    //     public forEach(callback: (key: any, data: any) => void, thisObject?: any): void {
    //         if (thisObject == undefined) {
    //             thisObject = null;
    //         }
    //         for (var _key in this._maps) {
    //             callback.call(thisObject, _key, this._maps[_key]);
    //         }

    //         for (var _key in this._hashMaps) {
    //             callback.call(thisObject, this._hashMaps[_key][0], this._hashMaps[_key][1]);
    //         }

    //         var len = this._objKeys.length;
    //         for (var i: number = len; i >= 0; i--) {
    //             var _key2 = this._objKeys[i];
    //             callback.call(thisObject, this._objKeys[i], this._objDatum[i]);
    //         }
    //     }

    //     /**
    //      *  获取字典中储存key和data的队列
    //      *
    //      */
    //     public get elements(): { key: any, data: any }[] {
    //         var datas: { key: any, data: any }[] = [];
    //         for (var key1 in this._maps) {
    //             datas.push({
    //                 key: key1,
    //                 data: this._maps[key1]
    //             });
    //         };
    //         for (var key2 in this._hashMaps) {
    //             var data: any = this._hashMaps[key2];
    //             datas.push({
    //                 key: data[0],
    //                 data: data[1]
    //             });
    //         }
    //         for (var i: number = 0; i < this._objKeys.length; i++) {
    //             datas.push({
    //                 key: this._objKeys[i],
    //                 data: this._objDatum[i]
    //             });
    //         }
    //         return datas
    //     }

    //     /**
    //      *  获取字典中储存key队列
    //      *
    //      */
    //     public get keys(): any[] {
    //         var keys: any[] = [];
    //         for (var key1 in this._maps) {
    //             keys.push(key1);
    //         };
    //         for (var key2 in this._hashMaps) {
    //             var data: any = this._hashMaps[key2];
    //             keys.push(data[0]);
    //         }
    //         keys.concat(this._objKeys)
    //         return keys
    //     }

    //     /**
    //      *  获取字典中储存data的队列
    //      *  跟values 等效
    //      */
    //     public get datum(): any[] {

    //         return this.values;
    //     }

    //     /**
    //      *  获取字典中储存data的队列
    //      *
    //      */
    //     public get values(): any[] {
    //         var values: any[] = [];
    //         for (var key1 in this._maps) values.push(this._maps[key1]);
    //         for (var key2 in this._hashMaps) values.push(this._hashMaps[key2][1]);
    //         return values.concat(this._objDatum)
    //     }

    //     /**
    //      *  销毁整个字典
    //      *
    //      */
    //     public destroy(): void {
    //         this._maps = null;
    //         this._hashMaps = null;
    //         this._objKeys = null,
    //             this._objDatum = null;
    //     }

    //     /**
    //      *  打印字典中的所有数据
    //      *
    //      */
    //     public dump(): void {
    //         console.log("==============elements================");
    //         console.log(this.elements);
    //     }
    // }

    var instances: any[] = [];
    // var instanceslib: BC.Dictionary = new BC.Dictionary();

    /**
    * addEvent (监听者, 通知者, 事件名称, 回调函数,冒泡阶段,优先级,是否弱引用)
    * BC.addEvent(this,loader,Event.COMPLETE, fun);
    *
    * @param key  监听者
    * @param dispatch  通知者
    * @param event  事件名称
    * @param func   回调函数
    * @param useCapture 冒泡阶段
    * @param priority   优先级
    * @param useWeakReference   是否弱引用
    */
    export function addEvent(key: any, dispatch: Laya.EventDispatcher, event: string, caller: any, func: Function, args?: any[]): void {
        if (key && dispatch && event && func && caller) {
            dispatch.on(event, caller, func, args);
            instances.push([key, dispatch, event, caller, func, args]);
        }
        else {
            console.error("添加事件监听参数缺少:", BC.addEvent.arguments)
        }
    }

    /**
     * 只监听到一次事件就删除监听，无需手动删除监听
     * 用法同addEvent方法.
     *
     * @param key  监听者
     * @param dispatch  通知者
     * @param event  事件名称
     * @param func   回调函数
     * @param useCapture 冒泡阶段
     * @param priority   优先级
     * @param useWeakReference   是否弱引用
     */
    export function addOnceEvent(key: any, dispatch: Laya.EventDispatcher, event: string, caller: any, func: Function, args?: any[]): void {
        if (key && dispatch && event && func && caller) {
            dispatch.once(event, caller, func, args);
            instances.push([key, dispatch, event, caller, func, args]);
        }
        else {
            console.error("添加事件监听参数缺少:", BC.addEvent.arguments)
        }
    }

    /**
    * 移除监听的用法一共有8种：
    *    000 删除所有关于监听者的所有事件,通常在类销毁时使用一次 BC.removeEvent(this);
    *    001 指定相同回调函数的所有监听 BC.removeEvent(this,null,null,func);
    *    010 指定事件名的所有监听 BC.removeEvent(this,null,Event.COMPLETE);
    *    011 指定事件名，指定回调函数的所有监听 BC.removeEvent(this,null,Event.COMPLETE,func);
    *    100 删除指定通知者 和 监听者之间的所有监听 BC.removeEvent(this,dispatch);
    *    101 删除通知者 和 监听者之间使用同一回调函数的所有监听 BC.removeEvent(this,dispatch,null,func);
    *    110 删除通知者 和 监听者之间指定事件的所有监听 BC.removeEvent(this,dispatch,Event.COMPLETE);
    *    111 明确删除指定的事件监听 BC.removeEvent(this,dispatch,Event.COMPLETE,func);
    *
    * @param key  监听者
    * @param dispatch  通知者
    * @param event  事件名称
    * @param func   回调函数
    * @param useCapture 冒泡阶段
    * @param priority   优先级
    * @param useWeakReference   是否弱引用
    */
    export function removeEvent(key: any, dispatch?: Laya.EventDispatcher, event?: string, caller?: any, func?: Function): void {
        if (dispatch == undefined) dispatch = null;
        if (event == undefined) event = null;
        if (func == undefined) func = null;
        if (key == undefined) console.error("key 不能为空");
        var len: number = instances.length;
        for (var i = len - 1; i >= 0; i--) {
            var needRemove: boolean = true;
            var data: any[] = instances[i];
            if (key != data[0]) {
                continue;
            }
            if (dispatch != null && dispatch != data[1]) {
                continue;
            }
            if (event != null && event != data[2]) {
                continue;
            }
            if (func != null && func != data[4]) {
                continue;
            }
            (data[1] as Laya.EventDispatcher).off(data[2], data[3], data[4]);
            instances.splice(i, 1);
        }
    }
}


// module deden {
//     export class StateUtil {
//         private _isBreak: boolean;
//         private _result: number;
//         private _cache: any[];
//         private _cacheGroup: any[];
//         private _invite: boolean = false

//         /**
//          * 如果lazyMode设置为true，在out函数执行结束前，isBreak值仍未true，
//          * 在着过程中out中的回调可能会导致再次阻止函数，直到所有收集的回调都抛出才会设置为false。
//          * @param lazyMode 默认false
//          */
//         public constructor(lazyMode?: boolean) {
//             if (lazyMode == undefined) lazyMode = false;
//             this._isBreak = true;
//             this._result = 0;
//             this._cache = [];
//             this._cacheGroup = [];
//             this._invite = lazyMode
//         }

//         /**
//          * 是否阻止函数运行，如果为true，in方法和addCallback方法将 函数信息将会存储到队列中.
//          * 如果将值为true设置为false时，将会抛出函数缓存队列中的函数信息依次回调执行.
//          * 默认为true.
//          * @type {boolean}
//          */
//         public get isBreak(): boolean {
//             return this._isBreak;
//         }

//         public set isBreak(value: boolean) {
//             if (this._isBreak && !value) {
//                 this._cacheGroup.unshift(this._cache.slice());
//                 this._cache.length = 0;
//                 if (this._invite) {
//                     this.out();
//                     this._isBreak = value;
//                 }
//                 else {
//                     this._isBreak = value;
//                     this.out()
//                 }
//             }
//             else {
//                 this._isBreak = value;
//             }
//         }

//         /**
//          * 如果isBreak为true时，函数信息输入到队列中，否则不做任何处理返回false.
//          * 用法：在函数内的第一行添加 if(f.in(this))return;
//          * @param thisObj 函数的作用域
//          * @returns {boolean}
//          */
//         public in(thisObj: any): boolean {
//           //  var n;
//           //  return n = t ? t : arguments.callee.caller, !!this._isBreak && (n._caller != this.out && (this._cache
//             //    .unshift([e, args || arguments.callee.caller.arguments, t || arguments.callee.caller]), !0))
//             return true;
//         }

//         /**
//          * 调用该函数将会执行所有之前值为true时缓存的函数.
//          * 用法：f.out();
//          */
//         private out(): void {
//             for (; this._cacheGroup.length;) {
//                 var e = this._cacheGroup.pop(),
//                     t = e.length;
//                 for (this._result = 0; t--;) {
//                     var n = e.pop();
//                     try {
//                         n[2]._caller = this.out, n[2].apply(n[0], n[1]) && this._result++
//                         n[2]._caller = null;
//                     } catch (e) {
//                         console.error(e.message, e.stack)
//                     }
//                 }
//             }
//         }

//         /**
//          * 直接设置毁掉函数，而不是阻止方式待条件满足回调.
//          * @param callback 回调的函数
//          * @param thisObj 回调的作用域
//          * @param args 回调的参数
//          */
//         public addCallback(callback: Function, thisObj?: any, ...args: any[]): void {
//             var i;
//             i = callback ? callback : arguments.callee.caller;
//             for (var a: any = [], r = 2; r < arguments.length; r++) a[r - 2] = arguments[r];
//             i._caller != this.out && (a.callee = callback, this._cache.unshift([thisObj, [], callback]), this._isBreak || egret.callLater(function () {
//                 this._cacheGroup.unshift(this._cache.slice()), this._cache.length = 0, this.out()
//             }, this))
//         }

//         /**
//          * 移除指定回调函数指定作用域的所有已设置的回调.包括使用in方法阻止的函数.
//          * @param callback 回调的函数
//          * @param thisObj 回调的作用域
//          */
//         public delCallback(callback: Function, thisObj?: any): void {
//             for (var n = this._cache.length - 1; n >= 0; n--) this._cache[n][0] == thisObj && this._cache[n][1] == callback && this._cache
//                 .splice(n, 1)
//         }

//         /**
//          * 回调缓存队列
//          */
//         public get length(): number {
//             return this._cache.length;
//         }

//         public set length(len: number) {
//             this._cache.length = len;
//         }

//         /**
//          * 输出时，回调函数返回值可转换为boolean值true的个数
//          */
//         public result(): number {
//             return this._result;
//         }

//         /**
//          * 清除缓存信息，为防止内存泄漏，使用结束时必须回
//          */
//         public clear(): void {
//             this._cacheGroup = null;
//             this._cache = null;
//         }
//     }
// }