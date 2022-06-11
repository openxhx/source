namespace clientCore{
    /**
     * JSZIP
     */
    export class JsMgr{
        private static _performer: any = new Laya.Browser.window.JSZip();
        static loadVer(): Promise<number>{
            return new Promise(async(ok)=>{
                let url: string = 'update/version.xin?t='+Laya.Browser.now();
                await res.load(url,Laya.Loader.BUFFER);
                let data: ArrayBuffer = res.get(url);
                if(!data){
                    ok(-1);
                    return;
                }
                this._performer.loadAsync(data).then((zip: any)=>{
                    return zip.file('version.json').async('string');
                }).then((value: string)=>{
                    Laya.URL.version = JSON.parse(value);
                    ok(0);
                })
            })
        }
    }
}