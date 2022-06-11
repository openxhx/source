namespace channel.utils {
    /**
     * Http网络管理
     */
    export class HttpUtils {

        private static readonly TAG: string = 'HTTP_UTILS';
        private static _handler: Laya.Handler;

        constructor() { }


        static httPGet(url: string, handler: Laya.Handler, params?: Object): void {
            let xhr: { http: Laya.HttpRequest, data: string } = this.creHttp(url, handler, params);
            url = url.indexOf('?') == -1 ? url + '?' : url;
            xhr.http.send(url + xhr.data, null, 'get');
        }

        static httpPost(url: string, handler: Laya.Handler, params?: Object): void {
            let xhr: { http: Laya.HttpRequest, data: string } = this.creHttp(url, handler, params);
            xhr.http.send(url, xhr.data, 'post');
        }

        private static creHttp(url: string, handler: Laya.Handler, params: object): { http: Laya.HttpRequest, data: string } {
            this._handler = handler;
            let xhr: Laya.HttpRequest = new Laya.HttpRequest();
            let data: string = '';
            xhr.http.timeout = 10000;//超时时间
            xhr.once(Laya.Event.PROGRESS, this, this.httpProgress);
            xhr.once(Laya.Event.COMPLETE, this, this.httpComplete);
            xhr.once(Laya.Event.ERROR, this, this.httpError);
            if (params) {
                for (let key in params) { data += `${key}=${params[key]}&`; }
                data = data.substring(0, data.length - 1); //去掉最后一个&
            }
            return { http: xhr, data: data }
        }

        private static httpComplete(data): void {
            this._handler?.runWith(data);
        }

        private static httpProgress(e): void {
            console.log(e);
        }

        private static httpError(e): void {
            Log.e(this.TAG, 'http error.' + e);
            this._handler = null;
        }
    }
}