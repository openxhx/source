namespace core {
    export class Native {
        // private bridge: laya.runtime.IPlatformClass;
        private bridge: any;

        constructor() {
            if (Laya.Render.isConchApp) {
                let os = window['conchConfig'].getOS();

                if (os == 'Conch-ios') {
                    this.bridge = Laya.Browser.window['PlatformClass'].createClass("JSBridge");
                }
                else {
                    this.bridge = Laya.Browser.window['PlatformClass'].createClass('utils.GameUtil');
                }
            }
        }

        callFun(fun: string, ...args: any[]) {
            if (!this.bridge)
                return;
            if (args.length > 0)
                return this.bridge.call(fun, ...args);
            else
                return this.bridge.call(fun);
        }

        dispathChannel(type: string, params: any, handler?: Laya.Handler): void {
            if (!this.bridge) {
                console.warn("当前未处于native环境~");
                return;
            }
            if (params) {
                this.bridge.callWithBack((data) => {
                    if (handler) {
                        handler.once = true; //设置一次回收
                        handler.runWith(data ? JSON.parse(data) : null);
                    }
                }, type, JSON.stringify(params));
            } else {
                this.bridge.callWithBack((data) => {
                    if (handler) {
                        handler.once = true; //设置一次回收
                        handler.runWith(data ? JSON.parse(data) : null);
                    }
                }, type);
            }
        }
    }
}