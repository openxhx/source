namespace util {
    /**
     * @example 
     *  var obj = {a:123};
     * util.watch(obj,'a', this, (pre,now)=>{
     *      
     * })
     */
    export function watch(obj: any, name: string, caller: any, hook: (pre: any, now: any) => void) {
        if (!obj || !hook)
            return;
        let preO = obj;
        let des = Object.getOwnPropertyDescriptor(obj, name);
        while (!des && obj["__proto__"]) {
            obj = obj["__proto__"];
            des = Object.getOwnPropertyDescriptor(obj, name);
        }
        if (!des) {
            console.warn('dont have prop ' + name + 'on' + obj);
            return;
        }
        if (des.set) {
            console.warn(obj + 'already have a set ');
            return;
        }
        if (!des.writable)
            console.warn(name + ' on ' + obj + ' is unWritable');

        let preValue = obj[name];
        let mSet = function (value) {
            preValue = value;
        };
        let mGet = function () {
            return preValue;
        };
        let ndes = {
            set: mSet,
            get: mGet,
            enumerable: des.enumerable,
            configurable: des.configurable
        };
        hookFun(ndes, 'set', name, mSet, caller, hook);
        Object.defineProperty(preO, name, ndes);
    }

    export function unWatch(obj: any, name: string) {
        let preO = obj;
        if (!obj)
            return;
        let des = Object.getOwnPropertyDescriptor(obj, name);
        while (!des && obj["__proto__"]) {
            obj = obj["__proto__"];
            des = Object.getOwnPropertyDescriptor(obj, name);
        }
        if (!des) {
            console.warn('dont have prop ' + name + 'on' + obj);
            return;
        }
        let ndes = {
            configurable: true,
            value: obj[name],
            writable: true
        };
        Object.defineProperty(preO, name, ndes);
    }

    function hookFun(obj: any, funName: string, propName: string, setFun: Function, caller: any, hookFun: Function) {
        obj[funName] = function () {
            let now = arguments[0];
            let pre = this[propName];
            setFun.apply(this, arguments);
            hookFun.apply(caller, [pre, now]);
        }
    }
}