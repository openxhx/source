namespace channel {

    /**
     * 请求HTTP链接
     * @param url http地址
     * @param handler 回调
     * @param params http参数
     * @param method "get" or "post"
     * @param headers 消息头数组
     */
    export function requestByHttp(url: string, handler: Laya.Handler, params: any, method: string, headers?: Array<any>): void {
        let http: Laya.HttpRequest = new Laya.HttpRequest();
        let postData: string = "";
        let paramData: string = "";
        method = method.toLowerCase();
        http.once(Laya.Event.COMPLETE, http, function (data: any): void {
            http.offAll();
            http = null;
            handler && handler.runWith(data);
        });

        // 参数解析
        if (params) {
            for (let key in params) {
                if (typeof params[key] == "object") {
                    paramData += key + "=" + encodeURIComponent(JSON.stringify(params[key])) + "&";
                } else {
                    paramData += key + "=" + params[key] + "&";
                }
            }
            // 去掉最后一个&
            paramData = paramData.substring(0, paramData.length - 1);
        }

        if (method == "get") {
            // 没有携带？ 那么加一个吧
            if (url.indexOf("?") == -1) {
                url += "?";
            }
            url += paramData;
        } else if (method == "post") {
            postData = paramData;
        }
        // http.http.
        console.log("http: ", url);
        // http.http.withCredentials = true;
        http.send(url, postData, method, null, headers);
    }

    /**
     * 获取cookie
     * @param cname 
     */
    export function getCookie(cname: string): string {
        let name: string = cname + "=";
        let values: string[] = Laya.Browser.document.cookie.split(";");
        let len: number = values.length;
        for (let i: number = 0; i < len; i++) {
            let element: string = trim(values[i]);
            if (element.indexOf(name) == 0) return element.substring(name.length, element.length);
        }
        return "";
    }


    let _params: any;
    /**
     * 获取链接所带参数
     * @param name 
     */
    export function getQureyString(name: string): any {
        if (!_params) {
            _params = {};
            let search: string = Laya.Browser.document.location.search.substr(1);
            let values: string[] = search.split("&");
            let array: any[];
            for (let ele of values) {
                array = ele.split("=");
                _params[array[0]] = array[1];
            }
        }
        return _params[name];
    }

    export function trim(value: string): string {
        return value.replace(/^\s+|\s+$/gm, '');
    }

    /**
     * 动态加载js文件
     * @param url 文件地址
     * @param decode  是否需要解码
     * @param callFunc  文件载入完成后的回调
     */
    export function loadScript(url: string,decode: boolean,callFunc: Function): void{
        let script: any = Laya.Browser.createElement("script");
        script.type = "text/javascript";
        if (decode) {
            script.src = decodeURIComponent(url)
        } else {
            script.src = url
        }
        Laya.Browser.document.head.appendChild(script);
        script.onload = function() {
            script.onload = null;
            callFunc();
        }
    }
}