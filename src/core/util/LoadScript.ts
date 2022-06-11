namespace util {
    export function LoadScript(url: string, forceReload: boolean = false): Promise<any> {
        return new Promise((resolve, reject) => {
            Laya.loader.load(url,
                Laya.Handler.create(this, (result: any) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject({ message: 'nothing loaded' })
                    }
                }), null, '', 0, true, '', forceReload
            );
        })
    }
}