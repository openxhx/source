/// <reference path="./WebSocket.ts" />


var EventManager = new Laya.EventDispatcher();
namespace net {
    let ws = new HuaWebSocket();
    let proto: any;
    let listenHash: util.HashMap<any[]>;
    let promiseHash: util.HashMap<net.PendingReqItem[]>;

    export function init() {
        //监听hash
        listenHash = new util.HashMap();
        //sendAndWait hash
        promiseHash = new util.HashMap();
        //改变协议命名空间
        Laya.Browser.window['pb'] = proto = protobuf.roots.pb;
    }

    export function getListen(): util.HashMap<any[]> {
        return listenHash;
    }

    export function connect(addr: string, uid: number): Promise<any> {
        console.log('connect to ' + addr);
        ws.connect(addr, uid);
        return new Promise<void>((ok, fail) => {
            ws.once(Laya.Event.OPEN, null, () => {
                console.log('connect ok');
                ok();
            });
            ws.once(Laya.Event.ERROR, null, (e) => {
                console.log('connect error');
                fail(e);
            });
            ws.once(Laya.Event.CLOSE, this, onClose);
            ws.on(Laya.Event.MESSAGE, this, onMessage);
        });
    }

    export function reconnect(): Promise<boolean> {
        ws.offAll();
        return new Promise<boolean>((ok, fail) => {
            ws.once(Laya.Event.OPEN, this, () => {
                ok(true);
            });
            ws.once(Laya.Event.ERROR, this, (e) => {
                ok(false);
            });
            ws.once(Laya.Event.CLOSE, this, onClose);
            ws.on(Laya.Event.MESSAGE, this, onMessage);
            ws.reconnect();
        });
    }

    export function close() {
        ws.close();
    }

    function onMessage(data: any) {
        let cmdName: string = 'sc_' + data.head.cmd;
        if (data.head.ret === -1) {
            //错误码
            handleErrCode(cmdName, data.head.seq, data.body);
        }
        else {
            //消息正常
            handleMsg(cmdName, data.head.seq, data.body);
        }
    }

    function handleMsg(cmdName: string, seq: number, body: any) {
        let data: any;
        try {
            data = proto[cmdName].decode(body);//解析后的消息体
        } catch (error) {
            logErrorCode(cmdName, 'proto解析错误' + error);
            return;
        }
        log(cmdName, data, false);
        //遍历listen 
        if (listenHash.has(cmdName)) {
            let listenArr = listenHash.get(cmdName);
            for (const iterator of listenArr) {
                iterator.cb.call(iterator.c, data);
            }
        }
        //遍历promise
        if (promiseHash.has(cmdName)) {
            let promiseArr = promiseHash.get(cmdName);
            for (let i = promiseArr.length - 1; i >= 0; i--) {
                const reqItem = promiseArr[i];
                if (!reqItem.finished && reqItem.seq == seq) {
                    reqItem.complete(data);
                    promiseArr.splice(i, 1);
                    break;
                }
            }
        }
    }

    function handleErrCode(cmdName: string, seq: number, body: any) {
        let by = new Laya.Byte(body);
        body = JSON.parse(by.readUTFBytes(by.length));
        //遍历promise
        let needSilent = false;
        if (promiseHash.has(cmdName)) {
            let promiseArr = promiseHash.get(cmdName);
            for (let i = promiseArr.length - 1; i >= 0; i--) {
                const reqItem = promiseArr[i];
                if (!reqItem.finished && reqItem.seq == seq) {
                    reqItem.errorCode(body);
                    if (reqItem.silent)
                        needSilent = true;
                    promiseArr.splice(i, 1);
                }
            }
        }
        logErrorCode(cmdName, body);
        if (!needSilent)
            alertErrorCode(body);
    }

    export function alertErrorCode(err: ErrorCode) {
        EventManager.event(globalEvent.ERROR_CODE, err);
    }

    function onClose() {
        EventManager.event(globalEvent.CONNECT_CLOSE);
        console.warn('断线了');
    }

    export function send(data: any) {
        let name = data.constructor.name;
        log(name, data, true);
        let buffer = proto[name].encode(data).finish();
        ws.send(name.split("cs_")[1], buffer);
    }

    /**
     * 
     * @param data 消息结构体
     * @param silent 若出现错误码是否忽略弹窗
     * @param timeOut 超时时间,单位毫秒
     */
    export function sendAndWait(data: any, silent: boolean = false, timeOut: number = PendingReqItem.defaultTimeOut): Promise<any> {
        let name: string = data.constructor.name;
        log(name, data, true);
        let buffer = proto[name].encode(data).finish();
        let handleCmdName = name.replace('cs_', 'sc_');
        let seq = ws.nextSeq();
        ws.send(name.split("cs_")[1], buffer);
        return new Promise((ok, fail) => {
            let reqItem = new net.PendingReqItem(ok, fail, timeOut);
            reqItem.cmdName = name;
            reqItem.silent = silent;
            reqItem.seq = seq;
            if (promiseHash.has(handleCmdName)) {
                promiseHash.get(handleCmdName).push(reqItem);
            }
            else {
                promiseHash.add(handleCmdName, [reqItem]);
            }
        });
    }

    function log(pbName: string, data: any, isSend: boolean) {
        let style = 'background: #aae89b';
        let headMark = isSend ? '>>>' : '<<<';
        console.groupCollapsed('%c' + headMark + ' ' + pbName, style);
        console.log(data);
        console.groupEnd();
    }

    function logErrorCode(pbName: string, err: ErrorCode | string) {
        let style = 'background: #eebc65';
        let headMark = '<<<';
        console.groupCollapsed('%c' + headMark + ' ' + pbName, style);
        console.log("error proto name:" + pbName);
        console.log(JSON.stringify(err));
        console.groupEnd();
    }

    /**
     * 取消wait中的监听
     * @param cmd 协议名(cs_开头)
     */
    export function cancleWait(cmd: any) {
        let name = cmd.name;
        if (name.substr(0, 3) == 'sc_') {
            console.log(name + '只能取消cs_的wait');
            return;
        }
        else {
            name = name.replace('cs_', 'sc_');
            if (promiseHash.has(name)) {
                let promiseArr = promiseHash.get(name);
                for (const o of promiseArr) {
                    o.clear();
                }
                promiseHash.remove(name);
            }
        }
    }

    /**
     * 监听协议
     * @param cmd  协议名 pb.sc_xxxxx
     * @param caller 
     * @param callBack(data)=>void
     */
    export function listen<T>(cmd: { new(): T }, caller: any, callBack: (data: T) => any) {
        let name = cmd['name'];
        if (name.substr(0, 3) == 'cs_') {
            console.log(name + " 监听协议不对，应该是sc_");
            return;
        }
        let listener = { c: caller, cb: callBack };
        if (listenHash.has(name)) {
            let listenArr = listenHash.get(name);
            let findIdx = _.findIndex(listenArr, (lis) => { return lis.c == caller && lis.cb == callBack });
            if (findIdx == -1)
                listenArr.push(listener);
            else
                console.warn('有重复监听!');
        }
        else {
            listenHash.add(name, [listener]);
        }
    }

    export function unListen(cmd: any, caller: any, callBack: any) {
        let name = cmd.name;
        if (name.substr(0, 3) == "cs_") {
            console.log(name + " 移除监听协议不对，应该是sc_");
            return;
        }
        if (listenHash.has(name)) {
            let listenArr = listenHash.get(name);
            for (let i = listenArr.length - 1; i >= 0; i--) {
                const lis = listenArr[i];
                if (lis.c == caller && lis.cb == callBack) {
                    listenArr.splice(i, 1);
                }
            }
            if (listenArr.length == 0)
                listenHash.remove(name);
        }
    }

    /**暂停所有等待回包的promise */
    export function pauseAllwait() {
        for (const arr of promiseHash.getValues()) {
            for (const pro of arr) {
                pro.pause();
            }
        }
    }

    export function resumeAllWait() {
        for (const arr of promiseHash.getValues()) {
            for (const pro of arr) {
                pro.resume();
            }
        }
    }
}
