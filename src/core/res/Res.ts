namespace res {
    export function load(path: string | string[], type?: string, needCache: boolean = true, progress?: Laya.Handler): Promise<void> {
        if (path == null || path.length <= 0)
            return Promise.resolve();
        if (!type && typeof path == 'string') {
            type = getTypeFromUrl(path);
        }
        return new Promise((ok) => {
            Laya.loader.load(path, Laya.Handler.create(null, () => {
                ok();
            }), progress, type, 1, needCache);
        })
    }

    function getTypeFromUrl(url: string): string {
        let type = Laya.Utils.getFileExtension(url);
        if (type)
            return Laya.Loader.typeMap[type];
        console.warn("Not recognize the resources suffix", url);
        return "text";
    }

    export function get(path: string): any {
        return Laya.loader.getRes(path);
    }

    /**
     * 根据json加载json中配置的内容
     * @param jsonPath 
     */
    export function loadByJson(jsonPath: string): Promise<void> {
        return new Promise((ok) => {
            Laya.loader.load(jsonPath, Laya.Handler.create(null, onJsonLoaded, [ok, jsonPath]), null, Laya.Loader.JSON);
        })
    }

    function onJsonLoaded(ok, jsonPath) {
        let json = res.get(jsonPath);
        let arr = [];
        for (let url of json) {
            arr.push(res.load(url));
        }
        Promise.all(arr).then(() => {
            ok();
        }).catch(e => { console.warn(e) });
    }
}